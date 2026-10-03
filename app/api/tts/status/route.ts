import { detectProvider } from "@/lib/ttsProvider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** بيقول للواجهة هل في مزوّد نطق احترافي متاح ولا نرجع لصوت المتصفح */
export async function GET() {
  const provider = detectProvider();
  return Response.json(
    { enabled: provider !== "none", provider },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
