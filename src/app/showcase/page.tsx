import ShowcaseTvDisplay from "@/components/showcase/ShowcaseTvDisplay";
import { getShowcaseStoreForDisplay } from "@/lib/site/showcasePublic";

export const revalidate = 60;

export const dynamic = "force-dynamic";

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ slide?: string }>;
}) {
  const [{ settings, projects }, { slide }] = await Promise.all([
    getShowcaseStoreForDisplay(),
    searchParams,
  ]);
  const requested = Number(slide);

  return (
    <ShowcaseTvDisplay
      settings={settings}
      projects={projects}
      initialSlide={Number.isInteger(requested) && requested > 0 ? requested - 1 : 0}
    />
  );
}
