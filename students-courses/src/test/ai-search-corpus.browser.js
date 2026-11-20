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

// This wrapper adds the published seed-data constraint before the server signs
// the request. Keep any native view restriction and compare the signed scope.
function observeSearch({schema, scopeCondition, prompt}) {
    const receipt = window.corpusSearch = {started:false, received:false};
    let owner = root;
    while (!Object.hasOwn(owner, 'remote')) owner = Object.getPrototypeOf(owner);
    const remote = owner.remote;
    owner.remote = function(...params) {
        const api = remote.apply(this, params);
        if (params[0] !== 'server/form') return api;
        return new Proxy({}, {get(_, key) {
            if (key !== 'getSearchAIExecution') return api[key];
            return (...args) => {
                if (args[3]?.input) {
                    if (args[0] !== schema || args[3].input !== prompt) throw Error('Unexpected search input');
                    const scope = args[4];
                    receipt.scope = scope && scope !== scopeCondition ? '('+scope+') AND ('+scopeCondition+')' : scopeCondition;
                    args[4] = receipt.scope;
                }
                return api[key](...args);
            };
        }});
    };
    const socket = root.db._socket;
    const emit = socket.emitDirect;
    socket.emitDirect = function(name, ...args) {
        if (name === 'aisearchstart') {
            receipt.started = true;
            receipt.job = args[0];
            receipt.startTime = performance.now();
            const signed = JSON.parse(JSON.parse(args[1]).token);
            receipt.verified = !args[2] && !!receipt.scope && signed.scopeCondition === receipt.scope;
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
        owner.remote = remote;
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
            const field = page.locator('mat-dialog-content textarea:visible');
            await field.pressSequentially(prompt, {delay:10});
            await field.press('Tab');
            await page.locator('mat-dialog-actions [dialog-submit]:visible').click();
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
    const selected = cases.filter(test => !process.env.SEARCH_CASE || test.id === process.env.SEARCH_CASE)
        .sort((a,b) => a.schema.localeCompare(b.schema));
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
            const context = await browser.newContext({locale:lang, timezoneId:'Europe/Berlin', ignoreHTTPSErrors:true});
            try {
                const page = await context.newPage();
                page.setDefaultTimeout(45000);
                await login(page, new URL('#/main/courses?ref=courses', url).href);
                let current;
                for (const test of selected) {
                    const route = '#/main/courses?ref='+routes[test.schema];
                    let phase = 'open-view';
                    let metrics;
                    try {
                        if (current !== route) await openView(page, new URL(route, url).href, lang);
                        current = route;
                        phase = 'submit';
                        await page.evaluate(observeSearch, {schema:test.schema, scopeCondition:test.scopeCondition, prompt:test.prompts[lang]});
                        await submit(page, test.prompts[lang]);
                        phase = 'wait-for-dialog';
                        const dialog = page.locator('mat-dialog-container:visible').last();
                        const apply = dialog.getByRole('button', {name:/^(Anwenden|Apply)$/i});
                        await apply.or(dialog.getByRole('button', {name:/^(Wiederholen|Retry)$/i})).waitFor({timeout:510000});
                        phase = 'verify';
                        metrics = await page.evaluate(verify, {schema:test.schema, expectedCodes:test.expectedCodes});
                        if (metrics.compiled && !await apply.isVisible()) throw Error('Draft unavailable for review');
                        await dialog.getByRole('button', {name:/^(Cancel|Abbrechen|Close|Schließen)$/i}).first().click();
                    } catch {
                        const state = await page.evaluate(() => ({
                            promptIssued:!!window.corpusSearch?.scope, started:!!window.corpusSearch?.started,
                            received:!!window.corpusSearch?.received, dialogVisible:!!document.querySelector('mat-dialog-container')
                        })).catch(() => ({}));
                        metrics = {error:phase, compiled:false, exact:false, route, ...state};
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
