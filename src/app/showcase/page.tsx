import ShowcaseTvDisplay from "@/components/showcase/ShowcaseTvDisplay";
import { getShowcaseStoreForDisplay } from "@/lib/site/showcasePublic";

export const revalidate = 60;

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const { settings, projects } = await getShowcaseStoreForDisplay();

  return <ShowcaseTvDisplay settings={settings} projects={projects} />;
}
