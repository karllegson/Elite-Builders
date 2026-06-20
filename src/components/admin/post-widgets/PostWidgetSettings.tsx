"use client";

import { BriefcaseMedical, Flame, Star, X } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  createDefaultGeneralSettings,
  createDefaultPopularSettings,
  createDefaultWidgetTabs,
  createWidgetTabId,
  formatNextQueryTime,
  POPULAR_SOURCE_OPTIONS,
  POST_WIDGET_TABS,
  type GeneralWidgetSettings,
  type PopularPostsSettings,
  type PostWidgetSettingsTab,
  type WidgetTabIcon,
  type WidgetTabItem,
} from "@/lib/admin/postWidgetSettings";

const WIDGET_TAB_ICONS: Record<
  WidgetTabIcon,
  { label: string; render: () => ReactNode }
> = {
  star: {
    label: "Star",
    render: () => <Star size={28} strokeWidth={1.75} aria-hidden />,
  },
  flame: {
    label: "Flame",
    render: () => <Flame size={28} strokeWidth={1.75} aria-hidden />,
  },
  "case-study": {
    label: "Case study",
    render: () => <BriefcaseMedical size={28} strokeWidth={1.75} aria-hidden />,
  },
};

function SettingsRow({
  label,
  children,
  help,
}: {
  label: string;
  children: ReactNode;
  help?: ReactNode;
}) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        {children}
        {help ? <p className="admin-post-widget-help">{help}</p> : null}
      </td>
    </tr>
  );
}

function GeneralSettingsPanel({
  settings,
  onChange,
  onSave,
}: {
  settings: GeneralWidgetSettings;
  onChange: (settings: GeneralWidgetSettings) => void;
  onSave: () => void;
}) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form className="admin-post-widget-panel" onSubmit={handleSubmit}>
      <table className="admin-post-widget-form-table">
        <tbody>
          <SettingsRow label="Max posts on homepage">
            <span className="admin-post-widget-inline-field">
              <input
                type="number"
                min={1}
                className="admin-post-widget-input admin-post-widget-input-small"
                value={settings.maxPostsHomepage}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    maxPostsHomepage: Number(event.target.value) || 0,
                  })
                }
              />
              <span>posts</span>
            </span>
          </SettingsRow>
          <SettingsRow label="Max posts on interior pages">
            <span className="admin-post-widget-inline-field">
              <input
                type="number"
                min={1}
                className="admin-post-widget-input admin-post-widget-input-small"
                value={settings.maxPostsInterior}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    maxPostsInterior: Number(event.target.value) || 0,
                  })
                }
              />
              <span>posts</span>
            </span>
          </SettingsRow>
          <SettingsRow label="Tab columns">
            <input
              type="number"
              min={1}
              className="admin-post-widget-input admin-post-widget-input-small"
              value={settings.tabColumns}
              onChange={(event) =>
                onChange({
                  ...settings,
                  tabColumns: Number(event.target.value) || 0,
                })
              }
            />
          </SettingsRow>
        </tbody>
      </table>
      <p className="admin-post-widget-submit-wrap">
        <button type="submit" className="admin-btn-primary-inline">
          Save Changes
        </button>
      </p>
    </form>
  );
}

function PopularPostsSettingsPanel({
  settings,
  onChange,
  onSave,
  onReset,
  onRunQuery,
  nextQueryTime,
}: {
  settings: PopularPostsSettings;
  onChange: (settings: PopularPostsSettings) => void;
  onSave: () => void;
  onReset: () => void;
  onRunQuery: () => void;
  nextQueryTime: string;
}) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };

  return (
    <div className="admin-post-widget-panel">
      <form onSubmit={handleSubmit}>
        <table className="admin-post-widget-form-table">
          <tbody>
            <SettingsRow label="Enable">
              <label className="admin-post-widget-checkbox">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(event) =>
                    onChange({ ...settings, enabled: event.target.checked })
                  }
                />
              </label>
            </SettingsRow>
            <SettingsRow
              label="Max Age"
              help="Eg: 3d (days), 1w (weeks), 2m (months), 1y (year(s))"
            >
              <input
                type="text"
                className="admin-post-widget-input admin-post-widget-input-small"
                value={settings.maxAge}
                onChange={(event) =>
                  onChange({ ...settings, maxAge: event.target.value })
                }
              />
            </SettingsRow>
            <SettingsRow label="Minimum Views">
              <input
                type="number"
                min={0}
                className="admin-post-widget-input admin-post-widget-input-small"
                value={settings.minimumViews}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    minimumViews: Number(event.target.value) || 0,
                  })
                }
              />
            </SettingsRow>
            <SettingsRow label="Source">
              <select
                className="admin-post-widget-select"
                value={settings.source}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    source: event.target.value as PopularPostsSettings["source"],
                  })
                }
              >
                {POPULAR_SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow label="Categories">
              <input
                type="text"
                className="admin-post-widget-input admin-post-widget-input-wide"
                placeholder="Leave blank for all categories"
                value={settings.categories}
                onChange={(event) =>
                  onChange({ ...settings, categories: event.target.value })
                }
              />
            </SettingsRow>
          </tbody>
        </table>
        <p className="admin-post-widget-submit-wrap">
          <button type="submit" className="admin-btn-primary-inline">
            Save Changes
          </button>
        </p>
      </form>

      <table className="admin-post-widget-form-table admin-post-widget-form-table-secondary">
        <tbody>
          <SettingsRow
            label="Reset Settings"
            help="Resets the popular post settings"
          >
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onReset}
            >
              Reset Now
            </button>
          </SettingsRow>
          <SettingsRow
            label="Next Query Time"
            help="The next time the popular posts query will run"
          >
            <span className="admin-post-widget-inline-actions">
              <span className="admin-post-widget-query-time">{nextQueryTime}</span>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={onRunQuery}
              >
                Run Query Now
              </button>
            </span>
          </SettingsRow>
        </tbody>
      </table>
    </div>
  );
}

function WidgetTabCard({
  tab,
  onChange,
  onRemove,
}: {
  tab: WidgetTabItem;
  onChange: (tab: WidgetTabItem) => void;
  onRemove: (id: string) => void;
}) {
  const icon = WIDGET_TAB_ICONS[tab.icon];

  return (
    <article className="admin-post-widget-card">
      <div className="admin-post-widget-card-header">
        <label className="admin-post-widget-checkbox">
          <input
            type="checkbox"
            checked={tab.enabled}
            onChange={(event) =>
              onChange({ ...tab, enabled: event.target.checked })
            }
          />
          <span>Enabled</span>
        </label>
        <button
          type="button"
          className="admin-post-widget-card-remove"
          aria-label={`Remove ${tab.title}`}
          onClick={() => onRemove(tab.id)}
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      <label className="admin-post-widget-card-field">
        <span>Tab Title</span>
        <input
          type="text"
          className="admin-post-widget-input"
          value={tab.title}
          onChange={(event) => onChange({ ...tab, title: event.target.value })}
        />
      </label>

      <div className="admin-post-widget-card-field">
        <span>Tab Icon</span>
        <div
          className="admin-post-widget-icon-preview"
          title={icon.label}
          aria-hidden
        >
          {icon.render()}
        </div>
      </div>

      <button type="button" className="admin-btn-primary-inline admin-post-widget-card-edit">
        Edit
      </button>
    </article>
  );
}

function WidgetSettingsPanel({
  tabs,
  onChange,
  onAddTab,
  onRemoveTab,
  onSave,
  onResetTabs,
}: {
  tabs: WidgetTabItem[];
  onChange: (tabs: WidgetTabItem[]) => void;
  onAddTab: () => void;
  onRemoveTab: (id: string) => void;
  onSave: () => void;
  onResetTabs: () => void;
}) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };

  const updateTab = (updatedTab: WidgetTabItem) => {
    onChange(tabs.map((tab) => (tab.id === updatedTab.id ? updatedTab : tab)));
  };

  return (
    <form className="admin-post-widget-panel" onSubmit={handleSubmit}>
      <p className="admin-post-widget-add-tab-wrap">
        <button type="button" className="admin-btn-primary-inline" onClick={onAddTab}>
          Add New Tab
        </button>
      </p>

      <div className="admin-post-widget-card-grid">
        {tabs.map((tab) => (
          <WidgetTabCard
            key={tab.id}
            tab={tab}
            onChange={updateTab}
            onRemove={onRemoveTab}
          />
        ))}
      </div>

      <p className="admin-post-widget-submit-wrap admin-post-widget-submit-wrap-row">
        <button type="submit" className="admin-btn-primary-inline">
          Save Changes
        </button>
        <button type="button" className="admin-btn-secondary" onClick={onResetTabs}>
          Reset Tabs
        </button>
      </p>
    </form>
  );
}

export function PostWidgetSettings() {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<PostWidgetSettingsTab>("general");
  const [generalSettings, setGeneralSettings] = useState(createDefaultGeneralSettings);
  const [popularSettings, setPopularSettings] = useState(createDefaultPopularSettings);
  const [widgetTabs, setWidgetTabs] = useState(createDefaultWidgetTabs);
  const [nextQueryTime, setNextQueryTime] = useState(formatNextQueryTime);

  const showStatus = (message: string) => {
    toast.success(message);
  };

  const handleAddTab = () => {
    setWidgetTabs((current) => [
      ...current,
      {
        id: createWidgetTabId(),
        enabled: true,
        title: "New Tab",
        icon: "star",
      },
    ]);
  };

  const handleRemoveTab = (id: string) => {
    setWidgetTabs((current) => current.filter((tab) => tab.id !== id));
  };

  const handleResetPopular = () => {
    setPopularSettings(createDefaultPopularSettings());
    showStatus("Popular post settings reset.");
  };

  const handleRunQuery = () => {
    const next = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setNextQueryTime(formatNextQueryTime(next));
    showStatus("Popular posts query scheduled.");
  };

  const handleResetTabs = () => {
    setWidgetTabs(createDefaultWidgetTabs());
    showStatus("Widget tabs reset.");
  };

  return (
    <div className="admin-post-widget-settings">
      <nav className="admin-post-widget-nav" aria-label="Post widget settings sections">
        {POST_WIDGET_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`admin-post-widget-nav-tab${activeTab === tab.value ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "general" ? (
        <GeneralSettingsPanel
          settings={generalSettings}
          onChange={setGeneralSettings}
          onSave={() => showStatus("General settings saved.")}
        />
      ) : null}

      {activeTab === "popular" ? (
        <PopularPostsSettingsPanel
          settings={popularSettings}
          onChange={setPopularSettings}
          onSave={() => showStatus("Popular post settings saved.")}
          onReset={handleResetPopular}
          onRunQuery={handleRunQuery}
          nextQueryTime={nextQueryTime}
        />
      ) : null}

      {activeTab === "widget" ? (
        <WidgetSettingsPanel
          tabs={widgetTabs}
          onChange={setWidgetTabs}
          onAddTab={handleAddTab}
          onRemoveTab={handleRemoveTab}
          onSave={() => showStatus("Widget tabs saved.")}
          onResetTabs={handleResetTabs}
        />
      ) : null}
    </div>
  );
}
