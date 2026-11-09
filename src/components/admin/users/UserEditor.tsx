"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  createUserAction,
  fetchUserForEditAction,
  updateUserAction,
} from "@/app/admin/(shell)/users/actions";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { MIN_PASSWORD_LENGTH, type AdminUser } from "@/lib/admin/usersData";

const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";

function generatePassword(length = 20): string {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join(
    "",
  );
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type UserEditorProps = {
  userId?: string;
};

export function UserEditor({ userId }: UserEditorProps) {
  const toast = useAdminToast();
  const router = useRouter();
  const isEditing = Boolean(userId);
  const [loaded, setLoaded] = useState(!isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [existing, setExisting] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(!isEditing);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    void fetchUserForEditAction(userId).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.user) {
        setExisting(result.user);
        setEmail(result.user.email);
        setDisplayName(result.user.displayName);
      } else {
        setLoadError(result.error ?? "User not found.");
      }

      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleGeneratePassword = () => {
    setPassword(generatePassword());
    setShowPassword(true);
  };

  const closePassword = () => {
    setPassword("");
    setShowPassword(false);
    setPasswordOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const input = { email, displayName, password: passwordOpen ? password : "" };
    const result = existing
      ? await updateUserAction(existing.id, input)
      : await createUserAction(input);

    setSaving(false);

    if (result.error || !result.user) {
      toast.error(result.error ?? "Could not save the user.");
      return;
    }

    if (!existing) {
      toast.success(`Added ${result.user.displayName}.`);
      router.push("/admin/users");
      return;
    }

    setExisting(result.user);
    setEmail(result.user.email);
    setDisplayName(result.user.displayName);
    closePassword();
    toast.success("User updated.");
  };

  if (!loaded) {
    return <p className="admin-post-editor-status">Loading user…</p>;
  }

  if (loadError) {
    return (
      <p className="admin-categories-status-message admin-post-editor-status" role="alert">
        {loadError} <Link href="/admin/users">Return to Users</Link>.
      </p>
    );
  }

  return (
    <form className="admin-user-form" onSubmit={handleSubmit}>
      <p className="admin-user-form-intro">
        {isEditing
          ? "Update this user's details or set a new password."
          : "Create a new user who can log in to the admin."}
      </p>

      <table className="admin-site-config-table">
        <tbody>
          <tr>
            <th scope="row">
              <label htmlFor="user-email">
                Email <span className="admin-user-required">(required)</span>
              </label>
            </th>
            <td>
              <input
                id="user-email"
                type="email"
                className="admin-site-config-input"
                autoComplete="off"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <p className="admin-site-config-help">Used to log in.</p>
            </td>
          </tr>

          <tr>
            <th scope="row">
              <label htmlFor="user-display-name">Display name</label>
            </th>
            <td>
              <input
                id="user-display-name"
                type="text"
                className="admin-site-config-input"
                autoComplete="off"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <p className="admin-site-config-help">
                Shown in the admin toolbar. Leave blank to use the part of the email before the @.
              </p>
            </td>
          </tr>

          <tr>
            <th scope="row">
              <label htmlFor="user-password">
                {isEditing ? (
                  "New password"
                ) : (
                  <>
                    Password <span className="admin-user-required">(required)</span>
                  </>
                )}
              </label>
            </th>
            <td>
              {passwordOpen ? (
                <div className="admin-user-password">
                  <input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    className="admin-site-config-input"
                    autoComplete="new-password"
                    spellCheck={false}
                    required={!isEditing}
                    minLength={MIN_PASSWORD_LENGTH}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleGeneratePassword}
                  >
                    Generate
                  </button>
                  {isEditing ? (
                    <button type="button" className="admin-btn-secondary" onClick={closePassword}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  id="user-password"
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setPasswordOpen(true)}
                >
                  Set New Password
                </button>
              )}
              <p className="admin-site-config-help">
                At least {MIN_PASSWORD_LENGTH} characters. Share it with the user privately.
              </p>
            </td>
          </tr>

          {existing ? (
            <>
              <tr>
                <th scope="row">Last login</th>
                <td>{formatDateTime(existing.lastSignInAt)}</td>
              </tr>
              <tr>
                <th scope="row">Registered</th>
                <td>{formatDateTime(existing.createdAt)}</td>
              </tr>
            </>
          ) : null}
        </tbody>
      </table>

      <p className="admin-site-config-submit-wrap">
        <button type="submit" className="admin-btn-primary-inline" disabled={saving}>
          {saving ? "Saving…" : isEditing ? "Update User" : "Add New User"}
        </button>
      </p>
    </form>
  );
}
