import { permanentRedirect } from "next/navigation";

const CHICKEN_RABBIT_KNOWLEDGE_POINT_ID = 4030201;
export const dynamic = "force-dynamic";

export default function ChickenRabbitDemoPage() {
  permanentRedirect(`/knowledge-points/${CHICKEN_RABBIT_KNOWLEDGE_POINT_ID}`);
}
