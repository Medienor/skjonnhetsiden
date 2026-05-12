"""Regenerate copyright-clean homepage images using OpenAI DALL-E 3.

Usage:
  set OPENAI_API_KEY=sk-...   (Windows cmd)
  $env:OPENAI_API_KEY="sk-..." (PowerShell)
  python scripts/generateImages.py

The script reads the IMAGE_TASKS list, generates one image per task with
DALL-E 3, converts the PNG output to JPEG with Pillow, and writes it into
the public/ folder with the same filename used by the site (so the swap is
transparent).
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image

API_URL = "https://api.openai.com/v1/images/generations"
MODEL = "dall-e-3"

PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"

STYLE_SUFFIX = (
    " Photorealistic editorial photography, modern Scandinavian beauty clinic"
    " aesthetic, soft diffused natural daylight, calm spa atmosphere,"
    " neutral pastel palette of pale beige, cream, soft pink and off-white,"
    " minimalist composition, shallow depth of field, premium magazine look."
    " No text, no captions, no logos, no watermarks, no brand names."
)

# (filename, size, quality, prompt)
# size must be one of 1024x1024, 1024x1792, 1792x1024 for DALL-E 3.
IMAGE_TASKS: list[tuple[str, str, str, str]] = [
    (
        "bg.jpg",
        "1792x1024",
        "hd",
        "Wide cinematic interior of a serene modern Scandinavian beauty clinic"
        " with a softly lit minimalist treatment room, large window with warm"
        " diffused daylight, a neatly made treatment bed with crisp white"
        " linen, fresh white orchids in a slim ceramic vase, blurred"
        " background, a faint hint of stainless steel skincare tools on a"
        " pale wood side table. No people in the frame.",
    ),
    (
        "botox.jpg",
        "1024x1024",
        "hd",
        "Macro close-up of a clean unbranded fine cosmetic syringe lying on a"
        " soft folded pale beige linen cloth next to a small clear glass"
        " vial. Subtle reflections, very shallow depth of field. No hands,"
        " no faces.",
    ),
    (
        "hifu.jpg",
        "1024x1024",
        "hd",
        "Sleek modern ultrasound HIFU handheld beauty device with a smooth"
        " white body resting on a folded white cotton towel, neutral cream"
        " surface, blurred clinic background. No people.",
    ),
    (
        "leppefiller.jpg",
        "1024x1024",
        "hd",
        "Soft macro beauty crop of natural-looking dewy soft pink lips with a"
        " subtle gloss, only the mouth region visible against a smooth pale"
        " peach background. No other facial features, no nose, no chin"
        " visible.",
    ),
    (
        "fjerning-av-fillers.jpg",
        "1024x1024",
        "hd",
        "Top-down flatlay of a small clear unbranded vial, a clean fine"
        " syringe, and a few round white cotton pads arranged on a pale"
        " linen cloth. Soft shadows. No people.",
    ),
    (
        "muskelavslappende.jpg",
        "1024x1024",
        "hd",
        "Minimal flatlay of two tiny clear glass vials, a slim unbranded"
        " syringe, and a folded soft cream cotton cloth on a smooth pale"
        " neutral surface. Negative space, calm composition. No people.",
    ),
    (
        "hudforbedrende.jpg",
        "1024x1024",
        "hd",
        "Modern professional cosmetic skin laser handpiece with smooth"
        " matte white body resting on a folded white towel, soft pastel"
        " clinic interior blurred in the background. No people.",
    ),
    (
        "em.jpg",
        "1024x1024",
        "hd",
        "Modern body sculpting muscle stimulation device with rounded"
        " white pads and a sleek control unit, in a bright minimalist"
        " Scandinavian clinic, pale wood and soft beige tones. No people.",
    ),
    (
        "profhilo.jpg",
        "1024x1024",
        "hd",
        "Close-up of one small clear glass ampoule next to a clean unbranded"
        " fine syringe on a soft pale linen background, single fresh white"
        " botanical sprig beside them. No hands, no faces.",
    ),
    (
        "ansiktsskulpturering.jpg",
        "1024x1024",
        "hd",
        "Artistic side-lit close-up emphasising a smooth defined cheekbone"
        " and jawline of a person, cropped to show only the lower side of"
        " the face from cheek to jaw, eyes and mouth fully out of frame,"
        " soft cream backdrop, sculptural editorial feel.",
    ),
    (
        "tear.jpg",
        "1024x1024",
        "hd",
        "Soft macro beauty crop showing only the smooth under-eye area of a"
        " person with calm radiant skin and one closed relaxed eye with"
        " delicate lashes, no eyebrows, no nose, no mouth in frame, soft"
        " pastel background.",
    ),
    (
        "fettfjerning.jpg",
        "1024x1024",
        "hd",
        "Sleek modern non-invasive body contouring device with rounded white"
        " applicator pads attached by soft tubing to a clean control unit,"
        " resting on a folded white cotton towel beside a small glass of"
        " water and a green sprig, in a bright minimalist Scandinavian"
        " beauty clinic, blurred warm wood background. No people.",
    ),
    (
        "nese.jpg",
        "1024x1024",
        "hd",
        "Tight macro side profile crop of only a person's nose against a"
        " soft pale pastel background, smooth skin, gentle natural light,"
        " no eyes, no mouth, no chin visible in the frame.",
    ),
    (
        "hydrafacial.jpg",
        "1024x1024",
        "hd",
        "Modern hydrafacial-style suction wand with transparent tip resting"
        " on a folded white towel beside a small clear glass bottle of"
        " clear serum, pale neutral surface. No people.",
    ),
    (
        "prp-behandling.jpg",
        "1024x1024",
        "hd",
        "Small unbranded glass test tube of golden plasma-like liquid"
        " standing in a stainless steel holder next to a fine cosmetic"
        " syringe on a pale linen cloth, very clean editorial composition."
        " No people, no blood, no needles in skin.",
    ),
    (
        "biostimulatorer.jpg",
        "1024x1024",
        "hd",
        "Two small clear glass vials with subtle silver foil tops and one"
        " slim unbranded syringe arranged diagonally on a folded soft cream"
        " linen cloth, gentle highlights. No people.",
    ),
    (
        "medisinsk-hudpleie.jpg",
        "1024x1024",
        "hd",
        "Top-down flatlay of three plain unbranded skincare items: a matte"
        " white cream jar, a slim dropper bottle with clear glass, and a"
        " soft tube, arranged with a folded white cotton cloth and a fresh"
        " green leaf on a pale beige surface. No text, no labels.",
    ),
    (
        "dermapen.jpg",
        "1024x1024",
        "hd",
        "Sleek modern microneedling pen device with a disposable tip"
        " resting on a folded white towel, blurred soft pastel clinic"
        " background. No people.",
    ),
    (
        "vanityshape.jpg",
        "1024x1024",
        "hd",
        "Modern smooth white handheld massage and contouring device with"
        " rounded rollers resting on a folded white towel, beside a small"
        " unbranded jar of pale cream and a dried botanical sprig, on a"
        " pale linen surface, soft natural light. No people.",
    ),
    (
        "tatoveringsfjerning.jpg",
        "1024x1024",
        "hd",
        "Sleek modern cosmetic laser handpiece with a softly glowing red"
        " emitter tip, lying on a folded white towel next to a pair of dark"
        " protective goggles on a pale neutral surface, blurred minimalist"
        " clinic in the background. No people, no skin in frame.",
    ),
    (
        "pluryal-elixir.jpg",
        "1024x1024",
        "hd",
        "A clean unbranded glass syringe and a small clear ampoule of pale"
        " liquid lying on a folded soft cream linen cloth, a single dried"
        " botanical sprig beside them. Editorial beauty still life. No"
        " people.",
    ),
    (
        "harfjerning.jpg",
        "1024x1024",
        "hd",
        "Modern laser hair removal handpiece with a smooth white body"
        " resting on a folded white towel next to a pair of dark"
        " protective goggles, pale neutral surface. No people.",
    ),
    (
        "visia.jpg",
        "1024x1024",
        "hd",
        "Modern facial skin analysis device with a sleek white dome and a"
        " soft warm glow inside the imaging area, set against a blurred"
        " minimalist Scandinavian beauty clinic background. No people.",
    ),
    (
        "ipl.jpg",
        "1024x1024",
        "hd",
        "Modern IPL beauty handpiece emitting a soft cool blue glow at the"
        " tip, resting on a folded white towel, pale neutral background."
        " No people.",
    ),
    (
        "tannbleking.jpg",
        "1024x1024",
        "hd",
        "Soft beauty macro crop showing only a relaxed gentle smile with"
        " naturally bright white teeth and soft pink lips, no other facial"
        " features in the frame, soft pastel background.",
    ),
    (
        "green-peel.jpg",
        "1024x1024",
        "hd",
        "Top-down flatlay of fresh green herbs, a small natural stone bowl"
        " filled with finely ground green herbal powder, and a soft natural"
        " bristle facial brush on a pale linen cloth, organic editorial"
        " beauty still life. No people.",
    ),
    (
        "akne.jpg",
        "1024x1024",
        "hd",
        "Soft beauty close-up showing only a smooth healthy cheek of a"
        " person with clear hydrated skin and a few subtle freckles, no"
        " eyes, no nose, no mouth visible, soft pastel background.",
    ),
]


def generate_one(prompt: str, size: str, quality: str, api_key: str) -> bytes:
    """Call DALL-E 3 and return raw PNG bytes."""
    body = json.dumps(
        {
            "model": MODEL,
            "prompt": prompt + STYLE_SUFFIX,
            "n": 1,
            "size": size,
            "quality": quality,
            "response_format": "b64_json",
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=180) as resp:
        payload = json.loads(resp.read().decode("utf-8"))

    import base64

    return base64.b64decode(payload["data"][0]["b64_json"])


def save_as_jpeg(png_bytes: bytes, out_path: Path, quality: int = 88) -> None:
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, format="JPEG", quality=quality, optimize=True, progressive=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--only",
        nargs="*",
        help="Only generate the listed filenames (e.g. --only bg.jpg botox.jpg)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List planned tasks without calling the API",
    )
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key and not args.dry_run:
        print("ERROR: OPENAI_API_KEY environment variable is not set.", file=sys.stderr)
        return 2

    tasks = IMAGE_TASKS
    if args.only:
        wanted = set(args.only)
        tasks = [t for t in tasks if t[0] in wanted]
        missing = wanted - {t[0] for t in tasks}
        if missing:
            print(f"WARNING: unknown filenames ignored: {sorted(missing)}", file=sys.stderr)

    print(f"Planning {len(tasks)} image(s) -> {PUBLIC_DIR}")
    for filename, size, quality, _ in tasks:
        print(f"  - {filename}  ({size}, {quality})")

    if args.dry_run:
        return 0

    failures: list[tuple[str, str]] = []
    for idx, (filename, size, quality, prompt) in enumerate(tasks, 1):
        out_path = PUBLIC_DIR / filename
        print(f"\n[{idx}/{len(tasks)}] {filename}  ({size}, {quality})")
        attempt = 0
        while True:
            attempt += 1
            try:
                t0 = time.time()
                png_bytes = generate_one(prompt, size, quality, api_key)
                save_as_jpeg(png_bytes, out_path)
                dt = time.time() - t0
                size_kb = out_path.stat().st_size / 1024
                print(f"  OK in {dt:0.1f}s -> {out_path}  ({size_kb:0.0f} KB)")
                break
            except urllib.error.HTTPError as e:  # noqa: PERF203
                body = e.read().decode("utf-8", "ignore")
                print(f"  HTTP {e.code} on attempt {attempt}: {body[:400]}", file=sys.stderr)
                if e.code in {429, 500, 502, 503, 504} and attempt < 3:
                    time.sleep(5 * attempt)
                    continue
                failures.append((filename, f"HTTP {e.code}: {body[:200]}"))
                break
            except Exception as e:  # noqa: BLE001
                print(f"  ERR on attempt {attempt}: {e}", file=sys.stderr)
                if attempt < 3:
                    time.sleep(3)
                    continue
                failures.append((filename, str(e)))
                break

    print("\nDone.")
    if failures:
        print(f"{len(failures)} failure(s):", file=sys.stderr)
        for name, msg in failures:
            print(f"  - {name}: {msg}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
