import { PostEditor } from "@/components/admin/posts/PostEditor";

type AdminAddPostPageProps = {
  searchParams: Promise<{ post?: string }>;
};

export default async function AdminAddPostPage({
  searchParams,
}: AdminAddPostPageProps) {
  const params = await searchParams;

  return <PostEditor postId={params.post} />;
}
