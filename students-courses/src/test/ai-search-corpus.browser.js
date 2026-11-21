// Exercise the normal Forms Search dialog against the public seed corpus.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const {cases} = require('../srv/ai-search-evaluation.corpus');

const project = path.resolve(__dirname, '../..');
const tooling = path.resolve(project, process.env.VISIONR_PLAYWRIGHT_ROOT || 'target/agent/cli/tooling.playwright');
const {chromium} = require(path.join(tooling, 'node_modules/playwright-core'));
const routes = {'courses.course':'courses', 'courses.student':'students', 'courses.department':'departments'};
const searchInput = 'search .search-input-varchar input:visible';
const supportedLanguages = ['en-US', 'de-DE'];

async function login(page, url) {
    await page.goto(url);
    const password = page.locator('input[type=password]:visible').first();
    const person = page.locator('.app-layout-person-button:visible');
    const native = page.getByText(/^(Login with VisionR|Anmelden mit VisionR)$/);
    const session = page.getByRole('button', {name:/Neue Sitzung|New session/i});
    const firstVisible = controls => Promise.any(controls.map(control => control.waitFor().then(() => control)));
    const first = await firstVisible([person, password, native, session]);
    if (first === native) await native.click();
    if (first === native || first === password) {
        const form = password.locator('xpath=ancestor::*[descendant::input[not(@type="password")]][1]');
        await form.locator('input:visible:not([type=password])').first().fill(process.env.VISIONR_TEST_USER);
        await password.fill(process.env.VISIONR_TEST_PASSWORD);
        await password.press('Enter');
    }
    if (await firstVisible([person, session]) === session) await session.click();
    await person.waitFor();
    await password.waitFor({state:'hidden'});
}

async function openView(page, url, lang) {
    await page.goto(url);
    await page.reload();
    const session = page.getByRole('button', {name:/Neue Sitzung|New session/i});
    const input = page.locator(searchInput).last();
    if (await Promise.any([input.waitFor().then(() => false), session.waitFor().then(() => true)])) await session.click();
    await input.waitFor();
    if (await page.evaluate(() => root.db.lang) !== lang) {
        await page.locator('.app-layout-language-button:visible').click();
        const label = lang === 'de-DE' ? /Deutsch|German/i : /English|Englisch/i;
        await page.getByRole('menuitem').filter({hasText:label}).first().click();
        await page.waitForFunction(expected => root.db.lang === expected, lang);
    }
    await page.locator('th.mat-mdc-header-cell:visible').first().waitFor();
    assert.deepEqual(await page.evaluate(() => [navigator.language, root.db.lang]), [lang, lang]);
}

// Set the fixture scope on the view itself. Search signing and applying a
// scoped aggregate must both read the same population through ObjectsView.
async function observeSearch({schema, scopeCondition, prompt}) {
    const receipt = window.corpusSearch = {started:false, received:false};
    const view=root.app.scripting.allProviders.map(p=>p.def?.params?.widget)
        .find(w=>w?.schema===schema && w.search?.aiSearchAvailable);
    if (!view) throw Error('Search collection unavailable');
    const original=view.filterCondition;
    view.filterCondition=root.app.vsql.mergeConditions([original,scopeCondition]);
    // Forms signs the parameter-resolved VSQL emitted by the server.
    receipt.scope=(await new Promise((resolve,reject)=>root.remote('server/misc')
        .vsqlConditionEscapeParams(schema,view.getSearchScopeCondition(),view.search.queryParams||{})
        .done(resolve).error(reject))).trim();
    const socket = root.db._socket;
    const emit = socket.emitDirect;
    socket.emitDirect = function(name, ...args) {
        if (name === 'aisearchstart') {
            receipt.started = true;
            receipt.job = args[0];
            receipt.startTime = performance.now();
            const signed = JSON.parse(JSON.parse(args[1]).token);
            receipt.sameScope=!!receipt.scope && signed.scopeCondition===receipt.scope;
            receipt.sameRequest=signed.schema===schema && signed.prompt===prompt;
            receipt.verified = !args[2] && receipt.sameScope && receipt.sameRequest;
        }
        return emit.call(this, name, ...args);
    };
    const result = message => {
        if (!receipt.started || message.id !== receipt.job) return;
        receipt.received = true;
        receipt.ms = Math.round(performance.now() - receipt.startTime);
        receipt.result = message.result;
        receipt.failed = !!message.error;
    };
    socket.on('aisearchresult', result);
    receipt.restore = () => {
        socket.off('aisearchresult', result);
        socket.emitDirect = emit;
        view.filterCondition=original;
        delete window.corpusSearch;
    };
}

async function submit(page, prompt) {
    const choices = page.locator(searchInput);
    for (let i = await choices.count() - 1; i >= 0; i--) {
        await choices.nth(i).dispatchEvent('dblclick');
        await page.getByRole('tab').first().waitFor();
        const tab = page.getByRole('tab', {name:/KI-Suche|AI Search/i});
        if (await tab.count()) {
            await tab.click();
            const panel = page.getByRole('tabpanel', {name:/KI-Suche|AI Search/i});
            const field = panel.locator('textarea:visible');
            await field.click(); // Wait for the selected tab to finish sliding into view.
            await field.fill(prompt);
            await field.press('Tab');
            assert.equal(await field.inputValue(), prompt);
            await panel.locator('xpath=ancestor::mat-dialog-container').locator('[dialog-submit]').click();
            return;
        }
        await page.getByRole('button', {name:/Cancel|Abbrechen/i}).last().click();
    }
    throw Error('No Search tab in the active view');
}

async function verify({schema, expectedCodes}) {
    const audit = window.corpusSearch;
    const result = audit.result;
    if (!audit.received || !audit.verified) throw Error('Missing authenticated search receipt');
    const draft = result?.draft?.condition;
    const row = {ms:audit.ms, cypherCalls:result?.metrics?.modelCalls || 0, compiled:!!draft, exact:false,
        error:audit.failed ? 'search-error' : result?.errors?.[0]?.code || null,
        diagnostics:(result?.diagnostics || []).map(issue => issue.code)};
    if (!draft || row.error) return row;
    const condition = draft.split('⟦EXTCOND⟧').join('(id IN (SELECT id WHERE '+audit.scope+'))');
    const rows = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('Oracle query timed out')), 45000);
        root.SELECT(schema, {properties:'code', where:'('+audit.scope+') AND ('+condition+')', limit:16385})
            .done(data => { clearTimeout(timer); resolve(data); })
            .error(() => { clearTimeout(timer); reject(Error('Oracle query failed')); });
    });
    if (rows.length > 16384) throw Error('Oracle result cap exceeded');
    const actual = rows.map(record => record.code).sort();
    const expected = [...expectedCodes].sort();
    row.rows = actual.length;
    row.exact = JSON.stringify(actual) === JSON.stringify(expected);
    row.missing = expected.filter(code => !actual.includes(code)).length;
    row.extra = actual.filter(code => !expected.includes(code)).length;
    return row;
}

async function run() {
    const caseIds=process.env.SEARCH_CASE?.split(',');
    const selected = cases.filter(test => !caseIds || caseIds.includes(test.id))
        .sort((a,b) => a.schema.localeCompare(b.schema));
    if (caseIds) assert.equal(selected.length,new Set(caseIds).size,'Unknown case ID');
    const languages = supportedLanguages.filter(lang => !process.env.SEARCH_LOCALE || lang === process.env.SEARCH_LOCALE);
    assert(selected.length && languages.length, 'Unknown case or language');
    assert(process.env.VISIONR_TEST_USER && process.env.VISIONR_TEST_PASSWORD, 'Supply Forms test credentials');
    const url = process.env.VISIONR_TEST_URL || JSON.parse(execFileSync('vrs', ['agent','status'],
        {cwd:project, shell:process.platform === 'win32'})).server.developmentUrl;
    const directory = path.join(project, 'target/agent');
    fs.mkdirSync(directory, {recursive:true});
    const out = path.join(fs.mkdtempSync(path.join(directory, 'ai-search-corpus-')), 'receipts.jsonl');
    console.log('Receipts', out);
    const browser = await chromium.launch({executablePath:process.env.VISIONR_CHROMIUM_EXECUTABLE});
    try {
        for (const lang of languages) {
            const options={locale:lang, timezoneId:'Europe/Berlin', ignoreHTTPSErrors:true};
            let context = await browser.newContext(options);
            try {
                let page = await context.newPage();
                page.setDefaultTimeout(45000);
                await login(page, new URL('#/main/courses?ref=courses', url).href);
                let current;
                for (const test of selected) {
                    if (process.env.SEARCH_APPLY==='1' && test!==selected[0]) {
                        await context.close();
                        context=await browser.newContext(options);
                        page=await context.newPage();
                        page.setDefaultTimeout(45000);
                        await login(page,new URL('#/main/courses?ref=courses',url).href);
                        current=undefined;
                    }
                    const route = '#/main/courses?ref='+routes[test.schema];
                    let phase = 'open-view';
                    let metrics;
                    try {
                        let reopened=false;
                        if (current !== route) {
                            const target=new URL(route,url).href;
                            try {await openView(page,target,lang);}
                            catch(error) {
                                if (!(error instanceof AggregateError) && error.name!=='TimeoutError') throw error;
                                // No prompt has been submitted. Reestablish the authenticated collection once.
                                reopened=true;
                                await login(page,target);
                                await openView(page,target,lang);
                            }
                        }
                        current = route;
                        await page.waitForFunction(schema=>root.app.scripting.allProviders.some(p=>{
                            const view=p.def?.params?.widget;
                            return view?.schema===schema && view.search?.aiSearchAvailable;
                        }),test.schema);
                        phase = 'submit';
                        await page.evaluate(observeSearch, {schema:test.schema, scopeCondition:test.scopeCondition, prompt:test.prompts[lang]});
                        await submit(page, test.prompts[lang]);
                        phase = 'start-search';
                        await page.waitForFunction(() => window.corpusSearch?.started, null, {timeout:60000});
                        phase = 'wait-for-dialog';
                        const dialog = page.locator('mat-dialog-container:visible').last();
                        const apply = dialog.getByRole('button', {name:/^(Anwenden|Apply)$/i});
                        await apply.or(dialog.getByRole('button', {name:/^(Wiederholen|Retry)$/i})).waitFor({timeout:510000});
                        phase = 'verify';
                        metrics = await page.evaluate(verify, {schema:test.schema, expectedCodes:test.expectedCodes});
                        if (reopened) metrics.collectionReopened=true;
                        if (metrics.compiled && !await apply.isVisible()) throw Error('Draft unavailable for review');
                        if (metrics.exact && process.env.SEARCH_APPLY==='1') {
                            phase='apply';
                            await apply.click();
                            await dialog.waitFor({state:'hidden'});
                            await page.waitForFunction(({schema,prompt})=>{
                                const contains=node=>node && (node.type==='ai' && node.values===prompt || node.children?.some(contains));
                                return root.app.scripting.allProviders.some(p=>{
                                    const w=p.def?.params?.widget;
                                    return w?.schema===schema && w.search?.filterCondition && contains(w.search.state?.root);
                                });
                            },{schema:test.schema,prompt:test.prompts[lang]});
                            metrics.applied=await page.evaluate(({schema,prompt,expectedCodes})=>{
                                const contains=node=>node && (node.type==='ai' && node.values===prompt || node.children?.some(contains));
                                const view=root.app.scripting.allProviders.map(p=>p.def?.params?.widget)
                                    .find(w=>w?.schema===schema && w.search?.filterCondition && contains(w.search.state?.root));
                                const scope=window.corpusSearch.scope;
                                const select=where=>new Promise((resolve,reject)=>root.SELECT(schema,{properties:'id,code',where,limit:16385})
                                    .done(resolve).error(reject));
                                const applied=root.app.vsql.mergeConditions([view._where,view.getFilterCondition()]);
                                return Promise.all([select(scope),select(applied)]).then(([all,visible])=>{
                                    if (all.length>=16385 || visible.length>=16385) throw Error('Applied result cap exceeded');
                                    const expected=all.filter(r=>expectedCodes.includes(r.code));
                                    const ids=rows=>rows.map(r=>r.id).sort((a,b)=>a-b);
                                    return expected.length===expectedCodes.length && JSON.stringify(ids(visible))===JSON.stringify(ids(expected));
                                });
                            },{schema:test.schema,prompt:test.prompts[lang],expectedCodes:test.expectedCodes});
                            if (!metrics.applied)metrics.exact=false;
                        } else await dialog.getByRole('button', {name:/^(Cancel|Abbrechen|Close|Schließen)$/i}).first().click();
                        await page.locator('mat-dialog-container').waitFor({state:'detached'});
                    } catch (failure) {
                        const state = await page.evaluate(() => ({
                            promptIssued:!!window.corpusSearch?.scope, started:!!window.corpusSearch?.started,
                            received:!!window.corpusSearch?.received, sameScope:window.corpusSearch?.sameScope,
                            sameRequest:window.corpusSearch?.sameRequest, dialogVisible:!!document.querySelector('mat-dialog-container')
                        })).catch(() => ({}));
                        metrics = {error:phase, reason:failure.name, compiled:false, exact:false, route, ...state};
                        current = undefined; // Reload closes any remaining dialog before the next case.
                    } finally {
                        await page.evaluate(() => window.corpusSearch?.restore()).catch(() => {});
                    }
                    const row = {id:test.id, lang, mode:'direct', ...metrics};
                    fs.appendFileSync(out, JSON.stringify(row)+'\n');
                    console.log(test.id, lang, row.exact ? 'passed' : row.error || 'wrong result');
                    if (!row.exact) process.exitCode = 1;
                }
            } finally { await context.close(); }
        }
    } finally { await browser.close(); }
}
run().catch(() => { console.error('Suite setup failed. Check the Java agent, browser tooling and Forms login.'); process.exitCode=1; });
