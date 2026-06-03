type ComingSoonProps = {
  title: string;
  phase?: number;
};

export function ComingSoon({ title, phase = 2 }: ComingSoonProps) {
  return (
    <>
      <h1 className="admin-page-title">{title}</h1>
      <div className="admin-card">
        <h3>Coming in Phase {phase}</h3>
        <p>
          {title} management will be wired to Supabase in a future update. The
          dashboard shell is live — content CRUD ships next.
        </p>
      </div>
    </>
  );
}
