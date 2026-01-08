// Copyright 2026 The OpenTrusty Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fs from 'fs';
import path from 'path';

// Minimal script to convert Playwright JSON results to Markdown
// Usage: node scripts/generate-playwright-md.js <json-file> <output-md-file>

const jsonPath = process.argv[2];
const mdPath = process.argv[3];

if (!jsonPath || !mdPath) {
    console.error("Usage: node generate-playwright-md.js <json-file> <output-md-file>");
    process.exit(1);
}

try {
    const data = fs.readFileSync(jsonPath, 'utf8');
    const results = JSON.parse(data);

    let md = `# Playwright E2E Test Report\n\n`;
    md += `**Total Tests**: ${results.stats.total}\n`;
    md += `**Expected**: ${results.stats.expected}\n`;
    md += `**Unexpected**: ${results.stats.unexpected}\n`;
    md += `**Flaky**: ${results.stats.flaky}\n`;
    md += `**Skipped**: ${results.stats.skipped}\n`;
    md += `**Duration**: ${(results.stats.duration / 1000).toFixed(2)}s\n\n`;

    md += `## Test Suites\n`;

    results.suites.forEach(suite => {
        md += `### ${suite.title}\n`;
        suite.specs.forEach(spec => {
            const status = spec.tests[0].results[0].status;
            const icon = status === 'passed' ? '✅' : '❌';
            md += `- ${icon} **${spec.title}** (${status})\n`;
        });
        md += `\n`;
    });

    fs.writeFileSync(mdPath, md);
    console.log(`Markdown report generated at ${mdPath}`);

} catch (err) {
    console.error("Error generating Markdown report:", err);
    process.exit(1);
}
