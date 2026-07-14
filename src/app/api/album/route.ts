import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // [INIT]: Ambil parameter 'id' album dari URL request
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get("id");

  // [VALIDATE]: Cek ketersediaan ID album sebelum memproses
  if (!albumId) {
    return NextResponse.json(
      { error: 'Query parameter "id" is required' },
      { status: 400 },
    );
  }

  try {
    // [FETCH]: Ambil detail data album beserta tracklist lengkap dari Deezer
    const targetUrl = `https://api.deezer.com/album/${albumId}`;
    const response = await fetch(targetUrl);

    if (!response.ok) {
      throw new Error("Gagal melakukan lookup data ke Deezer API");
    }

    const data = await response.json();

    // [VALIDATE]: Pastikan data albumnya valid dan ditemukan
    if (data.error) {
      return NextResponse.json(
        { error: "Album tidak ditemukan" },
        { status: 404 },
      );
    }

    // [FORMAT]: Saring daftar lagu dari objek tracks.data milik Deezer
    const rawTracks = data.tracks?.data || [];
    const tracks = rawTracks.map((track: any, index: number) => {
      // [CALC]: Hitung durasi detik mentah dari Deezer menjadi format string mm:ss
      const durationSeconds = track.duration || 0;
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const formattedDuration = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      return {
        // [UTIL]: Gunakan track_position bawaan atau fallback ke index loop + 1
        trackNumber: track.track_position || index + 1,
        title: track.title,
        duration: formattedDuration,
      };
    });

    // [RENDER]: Kembalikan payload data super bersih ke frontend
    return NextResponse.json({
      albumId: data.id.toString(),
      artistName: data.artist?.name || "Unknown Artist",
      albumName: data.title,
      coverUrl: data.cover_xl || data.cover_big,
      releaseDate: data.release_date
        ? data.release_date.split("-")[0]
        : "Unknown",
      tracks: tracks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
