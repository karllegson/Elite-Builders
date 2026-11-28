import ShowcaseTvDisplay from "@/components/showcase/ShowcaseTvDisplay";
import { createDefaultShowcaseStore } from "@/lib/admin/showcaseData";
import { getShowcaseStoreForDisplay } from "@/lib/site/showcasePublic";

// Cached; dashboard/admin saves refresh it right away (revalidatePath) and the TV reloads every 5 min.
export const revalidate = 60;

async function loadShowcase() {
  try {
    return await getShowcaseStoreForDisplay();
  } catch (error) {
    // Never fail the build over the store; the first refresh after deploy loads the real data.
    // At runtime, rethrow so the last good cached page keeps showing.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return { settings: createDefaultShowcaseStore().settings, projects: [] };
    }
    throw error;
  }
}

export default async function ShowcasePage() {
  const { settings, projects } = await loadShowcase();

  // ?slide=N is read in the browser (ShowcaseTvDisplay) so this page can stay cached.
  return <ShowcaseTvDisplay settings={settings} projects={projects} />;
}
