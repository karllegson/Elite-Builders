"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnalyticsOverview } from "@/components/admin/analytics/AnalyticsOverview";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  createDefaultAnalyticsSettings,
  readAnalyticsSettings,
  resolveClarityProjectId,
  resolveGaMeasurementId,
  writeAnalyticsSettings,
  type AnalyticsSettings,
} from "@/lib/admin/analyticsSettings";

type AnalyticsTab = "overview" | "settings";

const EXTERNAL_LINKS = [
  {
    label: "Google Analytics 4",
    href: "https://analytics.google.com/",
    description: "Traffic, acquisition, and conversion reports.",
  },
  {
    label: "Google Search Console",
    href: "https://search.google.com/search-console",
    description: "Search impressions, clicks, and indexing.",
  },
  {
    label: "Microsoft Clarity",
    href: "https://clarity.microsoft.com/",
    description: "Session recordings and heatmaps.",
  },
] as const;

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`admin-analytics-badge${active ? " is-active" : ""}`}>{label}</span>
  );
}

export function AnalyticsManager() {
  const toast = useAdminToast();
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const [settings, setSettings] = useState<AnalyticsSettings>(() => createDefaultAnalyticsSettings());

  useEffect(() => {
    setSettings(readAnalyticsSettings());
  }, []);

  const ga4Active = useMemo(() => Boolean(resolveGaMeasurementId(settings)), [settings]);
  const clarityActive = useMemo(() => Boolean(resolveClarityProjectId(settings)), [settings]);

  const handleChange = (key: keyof AnalyticsSettings, value: string | boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    writeAnalyticsSettings(settings);
    toast.success("Analytics settings saved.");
  };

  return (
    <div className="admin-analytics-page">
      <p className="admin-analytics-intro">
        Built-in stats for page views, phone clicks, estimate submits, and outbound links. Connect
        GA4 or Clarity in Settings for deeper reporting in those dashboards.
      </p>

      <div className="admin-analytics-tabs" role="tablist" aria-label="Analytics sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          className={`admin-analytics-tab${tab === "overview" ? " is-active" : ""}`}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "settings"}
          className={`admin-analytics-tab${tab === "settings" ? " is-active" : ""}`}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </div>

      {tab === "overview" ? (
        <>
          <AnalyticsOverview />

          <div className="admin-card admin-analytics-panel">
            <h3>External dashboards</h3>
            <div className="admin-analytics-integration-row">
              <div>
                <strong>Google Analytics 4</strong>
                <StatusBadge active={ga4Active} label={ga4Active ? "Connected" : "Not connected"} />
              </div>
              <div>
                <strong>Microsoft Clarity</strong>
                <StatusBadge
                  active={clarityActive}
                  label={clarityActive ? "Connected" : "Not connected"}
                />
              </div>
            </div>
            <ul className="admin-analytics-links">
              {EXTERNAL_LINKS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-analytics-link"
                  >
                    <span>
                      <strong>{item.label}</strong>
                      <span className="admin-analytics-link-desc">{item.description}</span>
                    </span>
                    <ExternalLink size={16} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <form className="admin-card admin-analytics-settings" onSubmit={handleSave}>
          <h3>Tracking IDs</h3>
          <table className="admin-site-config-table">
            <tbody>
              <tr>
                <th scope="row">
                  <label htmlFor="ga4MeasurementId">GA4 Measurement ID</label>
                </th>
                <td>
                  <input
                    id="ga4MeasurementId"
                    className="admin-site-config-input"
                    value={settings.ga4MeasurementId}
                    onChange={(event) => handleChange("ga4MeasurementId", event.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="admin-site-config-help">
                    Also supported via <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> in{" "}
                    <code>.env.local</code> for production deploys.
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">Enable GA4</th>
                <td>
                  <label className="admin-analytics-toggle">
                    <input
                      type="checkbox"
                      checked={settings.ga4Enabled}
                      onChange={(event) => handleChange("ga4Enabled", event.target.checked)}
                    />
                    Load Google Analytics on the public site
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <label htmlFor="searchConsoleProperty">Search Console property</label>
                </th>
                <td>
                  <input
                    id="searchConsoleProperty"
                    className="admin-site-config-input"
                    value={settings.searchConsoleProperty}
                    onChange={(event) =>
                      handleChange("searchConsoleProperty", event.target.value)
                    }
                    placeholder="https://www.elitebuildersco.com/"
                  />
                  <p className="admin-site-config-help">
                    Reference only — verify the domain in{" "}
                    <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">
                      Search Console
                    </a>
                    .
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <label htmlFor="clarityProjectId">Clarity project ID</label>
                </th>
                <td>
                  <input
                    id="clarityProjectId"
                    className="admin-site-config-input"
                    value={settings.clarityProjectId}
                    onChange={(event) => handleChange("clarityProjectId", event.target.value)}
                    placeholder="abc123xyz"
                  />
                  <p className="admin-site-config-help">
                    Optional. Also supported via <code>NEXT_PUBLIC_CLARITY_PROJECT_ID</code>.
                  </p>
                </td>
              </tr>
              <tr>
                <th scope="row">Enable Clarity</th>
                <td>
                  <label className="admin-analytics-toggle">
                    <input
                      type="checkbox"
                      checked={settings.clarityEnabled}
                      onChange={(event) => handleChange("clarityEnabled", event.target.checked)}
                    />
                    Load Microsoft Clarity on the public site
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="admin-analytics-settings-subheading">Event tracking</h3>
          <table className="admin-site-config-table">
            <tbody>
              <tr>
                <th scope="row">Phone clicks</th>
                <td>
                  <label className="admin-analytics-toggle">
                    <input
                      type="checkbox"
                      checked={settings.trackPhoneClicks}
                      onChange={(event) =>
                        handleChange("trackPhoneClicks", event.target.checked)
                      }
                    />
                    Track <code>phone_click</code> on tel: links
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row">Estimate forms</th>
                <td>
                  <label className="admin-analytics-toggle">
                    <input
                      type="checkbox"
                      checked={settings.trackEstimateForms}
                      onChange={(event) =>
                        handleChange("trackEstimateForms", event.target.checked)
                      }
                    />
                    Track <code>estimate_form_submit</code>
                  </label>
                </td>
              </tr>
              <tr>
                <th scope="row">Outbound links</th>
                <td>
                  <label className="admin-analytics-toggle">
                    <input
                      type="checkbox"
                      checked={settings.trackOutboundLinks}
                      onChange={(event) =>
                        handleChange("trackOutboundLinks", event.target.checked)
                      }
                    />
                    Track <code>outbound_link</code> on external URLs
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="admin-analytics-actions">
            <button type="submit" className="admin-btn-primary">
              Save Analytics Settings
            </button>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-btn-secondary">
              View public site
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
