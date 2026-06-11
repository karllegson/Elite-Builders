type ComingSoonProps = {
  phase?: number;
};

export function ComingSoon({ phase = 2 }: ComingSoonProps) {
  return (
    <div className="admin-card">
      <h3>Coming in Phase {phase}</h3>
      <p>
        This section will be wired to Supabase in a future update. The dashboard
        shell is live — content CRUD ships next.
      </p>
    </div>
  );
}
