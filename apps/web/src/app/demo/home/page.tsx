import { HomeExperiencePage } from "@/components/home-experience-page";

export const dynamic = "force-dynamic";

export default function HomeDemoPage() {
  return (
    <HomeExperiencePage
      previewLabel="预览页"
      previewNote="不影响正式首页"
      footerText="预览页"
    />
  );
}
