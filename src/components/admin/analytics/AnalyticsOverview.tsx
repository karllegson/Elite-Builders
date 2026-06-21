"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { fetchAnalyticsSummary } from "@/app/admin/(shell)/analytics/actions";
import {
  formatAnalyticsDate,
  formatAnalyticsEventLabel,
  formatAnalyticsNumber,
  summarizeAnalyticsMetadata,
} from "@/lib/analytics/format";
import type { SiteAnalyticsSummary } from "@/lib/analytics/types";

const PERIOD_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="admin-analytics-card">
      <p className="admin-analytics-card-label">{label}</p>
      <p className="admin-analytics-card-value">{formatAnalyticsNumber(value)}</p>
      {hint ? <p className="admin-analytics-card-hint">{hint}</p> : null}
    </div>
  );
}

export function AnalyticsOverview() {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [summary, setSummary] = useState<SiteAnalyticsSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadSummary = useCallback((days: number) => {
    startTransition(async () => {
      const next = await fetchAnalyticsSummary(days);
      setSummary(next);
    });
  }, []);

  useEffect(() => {
    loadSummary(periodDays);
  }, [loadSummary, periodDays]);

  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === periodDays)?.label ?? `Last ${periodDays} days`;

  return (
    <div className="admin-analytics-overview">
      <div className="admin-analytics-toolbar-row">
        <label className="admin-analytics-period">
          <span className="screen-reader-text">Report period</span>
          <select
            className="admin-posts-select"
            value={periodDays}
            onChange={(event) => setPeriodDays(Number(event.target.value))}
            disabled={isPending}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() => loadSummary(periodDays)}
          disabled={isPending}
        >
          {isPending ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {summary && !summary.available ? (
        <div className="admin-analytics-notice" role="status">
          {summary.message}
        </div>
      ) : null}

      <div className="admin-analytics-cards">
        <MetricCard
          label="Page views"
          value={summary?.pageViews ?? 0}
          hint={`${formatAnalyticsNumber(summary?.todayPageViews ?? 0)} today · ${periodLabel.toLowerCase()}`}
        />
        <MetricCard
          label="Phone clicks"
          value={summary?.phoneClicks ?? 0}
          hint={`${formatAnalyticsNumber(summary?.todayPhoneClicks ?? 0)} today · ${periodLabel.toLowerCase()}`}
        />
        <MetricCard
          label="Estimate submits"
          value={summary?.estimateSubmits ?? 0}
          hint={periodLabel.toLowerCase()}
        />
        <MetricCard
          label="Outbound clicks"
          value={summary?.outboundClicks ?? 0}
          hint={periodLabel.toLowerCase()}
        />
      </div>

      <div className="admin-analytics-split">
        <div className="admin-card admin-analytics-panel">
          <h3>Top pages</h3>
          {(summary?.topPages.length ?? 0) === 0 ? (
            <p className="admin-analytics-empty">No page views recorded yet for this period.</p>
          ) : (
            <table className="admin-analytics-events-table">
              <thead>
                <tr>
                  <th scope="col">Page</th>
                  <th scope="col">Views</th>
                </tr>
              </thead>
              <tbody>
                {summary?.topPages.map((page) => (
                  <tr key={page.path}>
                    <td>
                      <code>{page.path}</code>
                    </td>
                    <td>{formatAnalyticsNumber(page.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card admin-analytics-panel">
          <h3>Recent activity</h3>
          {(summary?.recentEvents.length ?? 0) === 0 ? (
            <p className="admin-analytics-empty">No events recorded yet for this period.</p>
          ) : (
            <table className="admin-analytics-events-table">
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Page</th>
                  <th scope="col">When</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recentEvents.map((event, index) => {
                  const detail = summarizeAnalyticsMetadata(event.metadata);

                  return (
                    <tr key={`${event.createdAt}-${event.eventType}-${index}`}>
                      <td>
                        <strong>{formatAnalyticsEventLabel(event.eventType)}</strong>
                        {detail ? (
                          <span className="admin-analytics-event-label">{detail}</span>
                        ) : null}
                      </td>
                      <td>
                        <code>{event.pagePath}</code>
                      </td>
                      <td>{formatAnalyticsDate(event.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
