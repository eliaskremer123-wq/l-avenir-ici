import { getProjects } from "@/app/lavenir/data";
import { getProjectsFromSheet, hasSheetCredentials } from "@/app/lavenir/sheets";

// googleapis relies on Node APIs and must not run on the Edge runtime.
export const runtime = "nodejs";
// Project data comes from a live external sheet, so never statically cache it.
export const dynamic = "force-dynamic";

/**
 * Exposure layer — the ONLY place the frontend should read project data from,
 * and the ONLY place that wires the Google Sheets connector into the
 * orchestration layer. This keeps googleapis strictly server-side.
 *
 * The orchestration layer (`getProjects`) handles validation and mock fallback.
 * Credentials live in env vars and are never returned in the response.
 */
export async function GET() {
  try {
    const source = hasSheetCredentials() ? getProjectsFromSheet : undefined;
    const projects = await getProjects(source);
    return Response.json({ projects });
  } catch (error) {
    // getProjects is designed not to throw, but stay defensive at the boundary
    // so the route always returns valid JSON instead of a 500 HTML page.
    console.warn("[api/projects] Unexpected failure while loading projects.", error);
    return Response.json({ projects: [] }, { status: 200 });
  }
}
