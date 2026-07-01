import { loadProjects } from "@/app/lavenir/data";
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
 * The orchestration layer (`loadProjects`) handles validation and the local CSV
 * fallback. Credentials live in env vars and are never returned in the response.
 *
 * Which source was actually used (live Sheet vs. CSV fallback) is exposed for
 * developers only — via a server log and the `X-Data-Source` response header.
 * The JSON body shape (`{ projects }`) is unchanged, so the UI has no idea
 * where the data came from.
 */
export async function GET() {
  try {
    const rawSource = hasSheetCredentials() ? getProjectsFromSheet : undefined;
    let googleSheetsError: unknown;

    const source = rawSource
      ? async () => {
          try {
            return await rawSource();
          } catch (error) {
            googleSheetsError = error;
            throw error;
          }
        }
      : undefined;

    const { projects, source: usedSource } = await loadProjects(source);

    if (googleSheetsError) {
      console.log("[GOOGLE SHEETS ERROR]", googleSheetsError);
    }

    console.log(
      usedSource === "sheet"
        ? `[DATA SOURCE] Google Sheets (${projects.length} projects)`
        : `[DATA SOURCE] Fallback CSV (${projects.length} projects)`,
    );

    return Response.json(
      { projects },
      {
        headers: {
          "X-Data-Source": usedSource,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    // loadProjects is designed not to throw, but stay defensive at the boundary
    // so the route always returns valid JSON instead of a 500 HTML page.
    console.warn("[api/projects] Unexpected failure while loading projects.", error);
    return Response.json(
      { projects: [] },
      { status: 200, headers: { "X-Data-Source": "error" } },
    );
  }
}
