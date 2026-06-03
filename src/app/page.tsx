import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Elite Builders IX</h1>
      <p style={{ color: "#50575e", margin: 0 }}>
        Public site coming soon. Admin dashboard is available now.
      </p>
      <Link
        href="/admin"
        style={{
          color: "#2271b1",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Go to Admin →
      </Link>
    </main>
  );
}
