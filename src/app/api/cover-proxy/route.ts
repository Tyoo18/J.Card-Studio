import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIXES = ["dzcdn.net", "deezer.com"];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const isAllowed = ALLOWED_HOST_SUFFIXES.some((suffix) =>
    parsed.hostname.endsWith(suffix),
  );
  if (!isAllowed) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const imageRes = await fetch(parsed.toString());
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil gambar" },
        { status: imageRes.status },
      );
    }
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imageRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal proxy gambar" }, { status: 500 });
  }
}
