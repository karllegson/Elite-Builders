import { shouldShowPostExcerpt, contentHasQuickSummary } from "../src/lib/site/postContent";
import { prepareServiceAreaHtml, parseServiceAreaContent } from "../src/lib/site/serviceAreaContent";

const samples = [
  `<p><strong>Quick Summary</strong></p>
<p>Sliding patio doors in Eden Prairie, MN now feature wider glass and slimmer frames.</p>
<h2>Introduction</h2>
<p>Some content here.</p>`,

  `<div class="highlight-box"><div class="quick-summary"><p><strong>Quick Summary</strong></p><p>Body text</p></div></div>
<h2>Next section</h2>`,

  `[quick_summary]<p>Summary body</p>[/quick_summary]
<h2>More</h2>`,
];

for (const [index, content] of samples.entries()) {
  console.log(`\n--- sample ${index + 1} ---`);
  try {
    const start = Date.now();
    console.log("hasQS", contentHasQuickSummary(content));
    console.log("showExcerpt", shouldShowPostExcerpt(content, "Quick Summary test"));
    console.log("parsed", parseServiceAreaContent(content));
    const prepared = prepareServiceAreaHtml(content, content);
    console.log("prepared length", prepared.length, "ms", Date.now() - start);
  } catch (error) {
    console.error("ERR", error);
  }
}
