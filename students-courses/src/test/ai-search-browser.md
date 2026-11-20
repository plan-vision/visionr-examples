# Running the bilingual Forms Search suite

The [corpus](../srv/ai-search-evaluation.corpus.js) defines 26 student, course and department questions, their English and German wording, and the expected business codes on the example seed data. From the students-courses project, run `npm run test:ai-search-corpus` to check the corpus structure or `npm run test:ai-search-browser` for all 52 real-model searches.

For the browser suite, use the populated example, a configured Search model and a running local Java development agent (`vrs agent start -java`). Set `VISIONR_TEST_USER` and `VISIONR_TEST_PASSWORD` for the Forms account that can read the example seed data. The runner gets the development URL from `vrs agent status`. Set `VISIONR_TEST_URL` to target a disposable copy of the same example. Use an account and browser origin intended for testing.

The default Playwright tooling directory is `target/agent/cli/tooling.playwright` and must contain `node_modules/playwright-core`. Set `VISIONR_PLAYWRIGHT_ROOT` to reuse an existing tooling directory. Set `VISIONR_CHROMIUM_EXECUTABLE` when using a locally installed Chrome or Chromium.

Each language gets a separate browser context. The runner checks the Forms and browser languages, opens the Search dialog, checks the signed view scope, and compares the entire set of accessible business codes against the fixture. The seed-data scope excludes optional performance datasets. Each run writes a new `target/agent/ai-search-corpus-*/receipts.jsonl` containing case IDs, verdicts, timings and counts. A failed case sets a nonzero exit code. To repeat one case, set `SEARCH_CASE` to its corpus ID and optionally set `SEARCH_LOCALE` to `de-DE` or `en-US`.
