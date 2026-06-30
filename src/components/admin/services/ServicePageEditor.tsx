"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PostEditorSeo } from "@/components/admin/posts/PostEditorSeo";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { slugify, createSchemaItem, type PostSeoSnippet, type SchemaItem } from "@/lib/admin/postSeo";
import { createDefaultSchemaGeneratorConfig } from "@/lib/admin/postSchemaGenerator";
import { createDefaultPublishSettings, type PublishSettings } from "@/lib/admin/postPublish";
import {
  getServicePageBySlug,
  upsertServicePage,
  type ServicePageRecord,
  type ServicePageStatus,
} from "@/lib/admin/servicesData";
import { ensureServicePagesStoreReady } from "@/lib/admin/servicesSync.client";
import type { HomeImageKey } from "@/lib/site/images";
import { homeImages } from "@/lib/site/images";

const HERO_IMAGE_OPTIONS = Object.keys(homeImages) as HomeImageKey[];

type ServicePageEditorProps = {
  slug: string;
};

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(value: string[]): string {
  return value.join("\n");
}

export function ServicePageEditor({ slug }: ServicePageEditorProps) {
  const toast = useAdminToast();
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [publishSettings, setPublishSettings] = useState<PublishSettings>(
    createDefaultPublishSettings,
  );
  const [title, setTitle] = useState("");
  const [h1, setH1] = useState("");
  const [heroImage, setHeroImage] = useState<HomeImageKey>("residentialRoofFraming");
  const [introText, setIntroText] = useState("");
  const [scopeHeading, setScopeHeading] = useState("");
  const [scopeText, setScopeText] = useState("");
  const [residentialHeading, setResidentialHeading] = useState("");
  const [residentialBody, setResidentialBody] = useState("");
  const [commercialHeading, setCommercialHeading] = useState("");
  const [commercialBody, setCommercialBody] = useState("");
  const [faqText, setFaqText] = useState("");
  const [snippet, setSnippet] = useState<PostSeoSnippet>({
    seoTitle: "",
    permalink: "",
    metaDescription: "",
  });
  const [schemas, setSchemas] = useState<SchemaItem[]>([createSchemaItem("Service")]);
  const [schemaGeneratorConfig, setSchemaGeneratorConfig] = useState(
    createDefaultSchemaGeneratorConfig,
  );

  const applyLoadedRecord = useCallback((record: ServicePageRecord) => {
    setTitle(record.title);
    setH1(record.h1);
    setHeroImage(record.heroImage);
    setIntroText(listToLines(record.intro));
    setScopeHeading(record.scopeHeading);
    setScopeText(listToLines(record.scope));
    setResidentialHeading(record.residential.heading);
    setResidentialBody(record.residential.body);
    setCommercialHeading(record.commercial.heading);
    setCommercialBody(record.commercial.body);
    setFaqText(
      record.faqs
        .map((faq) => `${faq.question}\n${faq.answer}`)
        .join("\n\n"),
    );
    setSnippet({
      seoTitle: record.metaTitle,
      permalink: record.slug,
      metaDescription: record.metaDescription,
    });
    setSchemas([
      createSchemaItem("Service", record.metaTitle || record.title, record.metaDescription),
    ]);
    setPublishSettings({
      ...createDefaultPublishSettings(),
      status: record.status === "published" ? "published" : "draft",
    });
  }, []);

  useEffect(() => {
    void ensureServicePagesStoreReady().then(() => {
      const record = getServicePageBySlug(slug);

      if (!record) {
        setMissing(true);
        setLoaded(true);
        return;
      }

      applyLoadedRecord(record);
      setLoaded(true);
    });
  }, [applyLoadedRecord, slug]);

  const parseFaqs = () => {
    return faqText
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const [question, ...answerParts] = block.split("\n");
        return {
          question: question.trim(),
          answer: answerParts.join("\n").trim(),
        };
      })
      .filter((faq) => faq.question && faq.answer);
  };

  const persist = (status: ServicePageStatus) => {
    if (!title.trim()) {
      toast.error("Add a title before saving.");
      return;
    }

    const saved = upsertServicePage({
      slug: snippet.permalink || slug,
      name: title.trim(),
      title: title.trim(),
      h1: h1.trim() || title.trim(),
      metaTitle: snippet.seoTitle || title.trim(),
      metaDescription: snippet.metaDescription,
      heroImage,
      intro: linesToList(introText),
      scopeHeading: scopeHeading.trim() || "Scope of Work",
      scope: linesToList(scopeText),
      residential: {
        heading: residentialHeading.trim(),
        body: residentialBody.trim(),
      },
      commercial: {
        heading: commercialHeading.trim(),
        body: commercialBody.trim(),
      },
      faqs: parseFaqs(),
      status,
    });

    applyLoadedRecord(saved);
    toast.success(status === "published" ? "Service page published." : "Draft saved.");
  };

  if (!loaded) {
    return <p className="admin-post-editor-status">Loading service page…</p>;
  }

  if (missing) {
    return (
      <div className="admin-post-editor">
        <p className="admin-post-editor-status">Service page not found.</p>
        <Link href="/admin/pages" className="admin-inline-link">
          Back to Pages
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-post-editor">
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="service-page-title">
          Service title
        </label>
        <input
          id="service-page-title"
          type="text"
          className="admin-post-title"
          value={title}
          onChange={(event) => {
            const nextTitle = event.target.value;
            setTitle(nextTitle);
            setSnippet((current) => ({
              seoTitle: current.seoTitle || nextTitle,
              permalink: current.permalink || slugify(nextTitle),
              metaDescription: current.metaDescription,
            }));
          }}
        />

        <label className="admin-post-title-label" htmlFor="service-page-h1">
          Page H1
        </label>
        <input
          id="service-page-h1"
          type="text"
          className="admin-post-title"
          value={h1}
          onChange={(event) => setH1(event.target.value)}
        />

        <label className="admin-post-title-label" htmlFor="service-page-hero-image">
          Hero image
        </label>
        <select
          id="service-page-hero-image"
          className="admin-pages-quick-edit-select"
          value={heroImage}
          onChange={(event) => setHeroImage(event.target.value as HomeImageKey)}
        >
          {HERO_IMAGE_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <label className="admin-post-title-label" htmlFor="service-page-intro">
          Intro paragraphs (one per line)
        </label>
        <textarea
          id="service-page-intro"
          className="admin-post-content"
          rows={5}
          value={introText}
          onChange={(event) => setIntroText(event.target.value)}
        />

        <label className="admin-post-title-label" htmlFor="service-page-scope-heading">
          Scope heading
        </label>
        <input
          id="service-page-scope-heading"
          type="text"
          className="admin-post-title"
          value={scopeHeading}
          onChange={(event) => setScopeHeading(event.target.value)}
        />

        <label className="admin-post-title-label" htmlFor="service-page-scope">
          Scope items (one per line)
        </label>
        <textarea
          id="service-page-scope"
          className="admin-post-content"
          rows={8}
          value={scopeText}
          onChange={(event) => setScopeText(event.target.value)}
        />

        <div className="admin-page-cta-field">
          <label htmlFor="service-page-residential-heading">Residential heading</label>
          <input
            id="service-page-residential-heading"
            type="text"
            className="admin-page-cta-input"
            value={residentialHeading}
            onChange={(event) => setResidentialHeading(event.target.value)}
          />
          <textarea
            className="admin-page-cta-textarea"
            rows={4}
            value={residentialBody}
            onChange={(event) => setResidentialBody(event.target.value)}
          />
        </div>

        <div className="admin-page-cta-field">
          <label htmlFor="service-page-commercial-heading">Commercial heading</label>
          <input
            id="service-page-commercial-heading"
            type="text"
            className="admin-page-cta-input"
            value={commercialHeading}
            onChange={(event) => setCommercialHeading(event.target.value)}
          />
          <textarea
            className="admin-page-cta-textarea"
            rows={4}
            value={commercialBody}
            onChange={(event) => setCommercialBody(event.target.value)}
          />
        </div>

        <label className="admin-post-title-label" htmlFor="service-page-faqs">
          FAQs (question on first line, answer below; blank line between items)
        </label>
        <textarea
          id="service-page-faqs"
          className="admin-post-content"
          rows={10}
          value={faqText}
          onChange={(event) => setFaqText(event.target.value)}
        />

        <PostEditorSeo
          postTitle={title}
          snippet={snippet}
          schemas={schemas}
          schemaGeneratorConfig={schemaGeneratorConfig}
          onSnippetChange={setSnippet}
          onSchemasChange={setSchemas}
          onSchemaGeneratorConfigChange={setSchemaGeneratorConfig}
        />
      </div>

      <aside className="admin-post-editor-sidebar">
        <div className="admin-post-publish-panel">
          <h2 className="admin-post-publish-title">Publish</h2>
          <p className="admin-post-editor-status">
            Status: {publishSettings.status === "published" ? "Published" : "Draft"}
          </p>
          <div className="admin-post-publish-actions">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => persist("draft")}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => persist("published")}
            >
              Publish
            </button>
          </div>
          <Link href={`/services/${snippet.permalink || slug}`} className="admin-inline-link">
            View live page
          </Link>
          <Link href="/admin/pages" className="admin-inline-link">
            Back to Pages
          </Link>
        </div>
      </aside>
    </div>
  );
}
