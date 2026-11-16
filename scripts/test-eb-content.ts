import assert from "node:assert/strict";
import {
  buildEbJumpLinks,
  extractEbH1,
  isEbContent,
  prepareEbHtml,
  splitEbBlocks,
} from "../src/lib/site/ebContent";

const options = {
  estimateHref: "/contact/",
  stats: [
    { value: "2012", label: "Family-owned since" },
    { value: "350+", label: "Projects completed" },
  ],
};

const page = `<div class="eb-short">
  <p>Elite Builders IX provides framing services in Modesto, CA.</p>
</div>

<h1>Framing Contractor In Modesto, CA</h1>

<h2 id="the-basics">Structural Framing Built For The Next Stage</h2>
<p>Intro copy.</p>
[estimate_button]

<h2 id="our-services">Framing Services In Modesto, CA</h2>
<h3>Framing That Matches The Project</h3>

<div class="eb-card">
  <img src="https://example.com/a.png" alt="A" title="A">
  <h3>Custom Home Framing</h3>
  <p>Card one.</p>
  [button href="/services/framing-contractor/custom-framing"]More on Custom Framing[/button]
</div>

<div class="eb-card">
  <img src="https://example.com/b.png" alt="B">
  <h3>Production Home Framing</h3>
  <p>Card two.</p>
</div>

<h2 id="the-elite-difference">Why Modesto Chooses Elite Builders IX</h2>
[stats]
<ul class="eb-tiles"><li><strong>Licensed</strong> CSLB 970551.</li></ul>

<h2 id="what-clients-say">Modesto Framing Reviews</h2>
[reviews amount="3"]

<h2 id="questions">Your Modesto Framing Questions</h2>
[faqs category="modesto-faq"]

<h2 id="where-we-work">Serving Modesto, CA</h2>
[map]

<h2 id="book-an-estimate">Schedule A Free Framing Estimate</h2>
[estimate_button]`;

const legacy = `<div class="highlight-box"><span>Quick Summary</span><p>Old.</p></div>
<h1>Old Page</h1><h2 id="intro">Intro</h2>[cta-btn]
[faqs category="x"]`;

// Detection
assert.equal(isEbContent(page), true, "new format detected");
assert.equal(isEbContent(legacy), false, "old Level 10 format left alone");

// H1 + jump links
assert.equal(extractEbH1(page), "Framing Contractor In Modesto, CA");
assert.deepEqual(
  buildEbJumpLinks(page).map((link) => link.label),
  [
    "The Basics",
    "Our Services",
    "The Elite Difference",
    "What Clients Say",
    "Questions",
    "Where We Work",
    "Book An Estimate",
  ],
);

const prepared = prepareEbHtml(page, options);

assert.ok(!/<h1\b/i.test(prepared), "H1 removed from body (shown in header band)");
assert.ok(prepared.includes(`<p class="eb-short__label">The Short Version</p>`), "short box label");
assert.equal((prepared.match(/<div class="eb-cards">/g) ?? []).length, 1, "consecutive cards grouped once");
assert.equal((prepared.match(/<article class="eb-card">/g) ?? []).length, 2, "two cards");
assert.ok(prepared.includes(`href="/services/framing-contractor/custom-framing"`), "card button href");
assert.equal((prepared.match(/eb-btn--estimate/g) ?? []).length, 2, "both estimate buttons");
assert.ok(prepared.includes("Start My Estimate"), "estimate label");
assert.ok(prepared.includes(`<div class="eb-stats">`), "stats row");
assert.equal((prepared.match(/<p class="eb-label">/g) ?? []).length, 7, "label above every section");
assert.equal((prepared.match(/<hr class="eb-rule">/g) ?? []).length, 6, "divider before all but first section");
assert.ok(prepared.indexOf("eb-jump-mobile") < prepared.indexOf('id="our-services"'), "phone jump list after first section");
assert.ok(!/\[(?:button|estimate_button|stats)\b/.test(prepared), "inline shortcodes all rendered");

const blocks = splitEbBlocks(prepared);
assert.deepEqual(
  blocks.map((block) => block.type),
  ["html", "reviews", "html", "faqs", "html", "map", "html"],
  "content after FAQ and map is kept",
);
const faq = blocks.find((block) => block.type === "faqs");
assert.equal(faq?.type === "faqs" && faq.categoryRef, "modesto-faq");
const reviews = blocks.find((block) => block.type === "reviews");
assert.equal(reviews?.type === "reviews" && reviews.config.amount, 3);

console.log("eb content: all checks passed");
