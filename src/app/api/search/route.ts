import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // [INIT]: Ambil query parameter 'q' dari URL request frontend
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // [VALIDATE]: Pastikan parameter pencarian tidak kosong
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 },
    );
  }

  try {
    // [FETCH]: Tembak Deezer Search Album API dengan query yang sudah di-encode
    const targetUrl = `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=25`;
    const response = await fetch(targetUrl);

    if (!response.ok) {
      throw new Error("Gagal mengambil data dari Deezer API");
    }

    const data = await response.json();

    // [VALIDATE]: Cek jika data hasil pencarian kosong
    if (!data.data) {
      return NextResponse.json([]);
    }

    // [FORMAT]: Petakan format JSON Deezer ke struktur data minimalis untuk frontend
    const cleanedAlbums = data.data.map((item: any) => ({
      albumId: item.id.toString(),
      artistName: item.artist?.name || "Unknown Artist",
      albumName: item.title,
      // [UTIL]: Ambil cover ukuran XL (1000x1000px) biar mika 3D lu kelihatan high-end dan tajam
      coverUrl: item.cover_xl || item.cover_big || item.cover_medium,
    }));

    return NextResponse.json(cleanedAlbums);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
