"use client";

const SAMPLE_SIZE = 10;

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Klem hasil extract biar tetep "kaset-able": gak terlalu terang/gelap/oversaturated
function clampForTapeShell(r: number, g: number, b: number): string {
  const rf = r / 255,
    gf = g / 255,
    bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rf:
        h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
        break;
      case gf:
        h = ((bf - rf) / d + 2) / 6;
        break;
      case bf:
        h = ((rf - gf) / d + 4) / 6;
        break;
    }
  }

  const clampedS = Math.min(Math.max(s, 0.25), 0.55);
  const clampedL = Math.min(Math.max(l, 0.14), 0.22);

  return hslToHex(h * 360, clampedS * 100, clampedL * 100);
}

export function extractDominantColor(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        let rSum = 0,
          gSum = 0,
          bSum = 0,
          count = 0;
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
          count++;
        }

        resolve(clampForTapeShell(rSum / count, gSum / count, bSum / count));
      } catch {
        resolve(null); // canvas tainted atau error lain
      }
    };

    img.onerror = () => resolve(null);
    img.src = `/api/cover-proxy?url=${encodeURIComponent(imageUrl)}`;
  });
}

export function randomFallbackColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return hslToHex(hue, 35, 16);
}
