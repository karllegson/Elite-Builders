import Link from "next/link";

export function SuperAdminOnlyNotice() {
  return (
    <div className="admin-card">
      <h3>Users</h3>
      <p>
        Only the super admin can add, edit or delete users.{" "}
        <Link href="/admin/users">View all users</Link>.
      </p>
    </div>
  );
}
