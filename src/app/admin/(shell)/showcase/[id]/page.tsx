"use client";

import { useParams } from "next/navigation";
import { ShowcaseProjectEditor } from "@/components/admin/showcase/ShowcaseProjectEditor";

export default function AdminShowcaseEditPage() {
  const params = useParams<{ id: string }>();
  return <ShowcaseProjectEditor projectId={params.id} />;
}
