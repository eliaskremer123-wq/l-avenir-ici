export const runtime = "nodejs";

/**
 * Extract a Google Drive file id from a raw id or common Drive URL formats.
 */
export function extractDriveFileId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Raw file id passed directly (not a URL).
  if (/^[\w-]{10,}$/.test(trimmed) && !trimmed.includes("://")) {
    return trimmed;
  }

  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc(?:\?[^#]*)?[?&]id=([^&]+)/,
    /[?&]id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Server-side proxy for Google Drive images.
 *
 * Drive URLs are unreliable as direct <img src> in the browser; this route
 * fetches the file on the server and streams it back with cache headers.
 *
 * Query: ?fileId=FILE_ID  OR  ?fileId=<full Google Drive URL>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileIdParam = searchParams.get("fileId");

  if (!fileIdParam) {
    return new Response("Missing fileId", { status: 400 });
  }

  const fileId = extractDriveFileId(fileIdParam);
  if (!fileId) {
    return new Response("Invalid fileId", { status: 400 });
  }

  const driveUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;

  try {
    const response = await fetch(driveUrl, { redirect: "follow" });

    if (!response.ok) {
      return new Response("Image not found", { status: response.status });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.warn("[api/image] Failed to fetch Drive image.", { fileId, error });
    return new Response("Failed to fetch image", { status: 502 });
  }
}
