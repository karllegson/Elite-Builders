import { siteConfig } from "@/lib/admin/config";

export default function AdminSettingsPage() {
  return (
    <>
      <h1 className="admin-page-title">Settings</h1>
      <div className="admin-card">
        <h3>Site</h3>
        <p>
          <strong>Name:</strong> {siteConfig.name}
          <br />
          <strong>Support email:</strong>{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
        </p>
        <p style={{ marginTop: 12 }}>
          Editable site settings will be added in a later phase. Update{" "}
          <code>src/lib/admin/config.ts</code> for now.
        </p>
      </div>
    </>
  );
}
