"use client";

import { GripVertical } from "lucide-react";
import { useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { DEFAULT_POST_CREATION_FEEDS, type PostCreationFeedItem } from "@/lib/admin/formPostCreation";

function PostCreationTableHead() {
  return (
    <tr>
      <td className="admin-form-post-creation-col-check">
        <input type="checkbox" aria-label="Select all" disabled />
      </td>
      <th scope="col" className="admin-form-post-creation-col-name">
        Name
      </th>
      <th scope="col" className="admin-form-post-creation-col-type">
        Post Type
      </th>
      <th scope="col" className="admin-form-post-creation-col-status">
        Status
      </th>
      <th scope="col" className="admin-form-post-creation-col-drag" aria-label="Reorder" />
    </tr>
  );
}

export function FormPostCreationList() {
  const toast = useAdminToast();
  const [feeds] = useState<PostCreationFeedItem[]>(DEFAULT_POST_CREATION_FEEDS);

  const handleAddNew = () => {
    toast.info("Add New post creation feed is coming soon.");
  };

  const handleCreateOne = () => {
    toast.info("Create post creation feed is coming soon.");
  };

  return (
    <div className="admin-form-post-creation">
      <section className="admin-form-post-creation-panel">
        <header className="admin-form-post-creation-header">
          <h2 className="admin-form-post-creation-title">Post Creation Feeds</h2>
          <button type="button" className="admin-page-title-action" onClick={handleAddNew}>
            Add New
          </button>
        </header>

        <div className="admin-form-post-creation-table-wrap">
          <table className="admin-form-post-creation-table">
            <thead>
              <PostCreationTableHead />
            </thead>
            <tbody>
              {feeds.length === 0 ? (
                <tr>
                  <td className="admin-form-post-creation-col-check">
                    <input type="checkbox" aria-label="Select feed" disabled />
                  </td>
                  <td colSpan={3} className="admin-form-post-creation-empty">
                    You don&apos;t have any feeds configured. Let&apos;s go{" "}
                    <button type="button" className="admin-form-entries-name-link" onClick={handleCreateOne}>
                      create one!
                    </button>
                  </td>
                  <td className="admin-form-post-creation-col-drag">
                    <span className="admin-form-post-creation-drag" aria-hidden>
                      <GripVertical size={16} />
                    </span>
                  </td>
                </tr>
              ) : (
                feeds.map((feed) => (
                  <tr key={feed.id}>
                    <th scope="row" className="admin-form-post-creation-col-check">
                      <input type="checkbox" aria-label={`Select ${feed.name}`} />
                    </th>
                    <td className="admin-form-post-creation-col-name">
                      <button type="button" className="admin-form-entries-name-link">
                        {feed.name}
                      </button>
                    </td>
                    <td className="admin-form-post-creation-col-type">{feed.postType}</td>
                    <td className="admin-form-post-creation-col-status">{feed.status}</td>
                    <td className="admin-form-post-creation-col-drag">
                      <button
                        type="button"
                        className="admin-form-post-creation-drag"
                        aria-label={`Reorder ${feed.name}`}
                      >
                        <GripVertical size={16} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <PostCreationTableHead />
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
