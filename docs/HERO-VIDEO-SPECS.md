# Hero Video — Original Reference Specs

**Source file:** `public/videos/elite-builders-hero-loop.mp4` (pre-replace backup)

| Property | Value |
|----------|-------|
| Resolution | **1920 × 804** (display aspect ~160:67, cinematic) |
| Frame rate | **24 fps** |
| Video codec | H.264 High, level 4.0 |
| Video bitrate | ~**2.83 Mbps** |
| Pixel format | yuv420p |
| Color | bt709 |
| Audio | AAC LC, **44.1 kHz** stereo, ~133 kbps |
| Duration | ~25.3 s |
| File size | ~9.4 MB |
| Total bitrate | ~2.97 Mbps |

New hero encodes should match resolution, fps, and bitrate tier. Full source content is preserved (letterbox/pillarbox inside 1920×804 if needed — no clip trims).

---

## Current Hero File

**File:** `public/videos/elite-builders-hero.mp4`  
**Source:** `Elite Builders Video Final.mp4` (Desktop)

| Property | Value |
|----------|-------|
| Resolution | 1920 × 804 |
| Frame rate | 24 fps |
| Video bitrate | ~2.66 Mbps |
| Audio | AAC 48 kHz stereo, ~192 kbps (copied from source) |
| Duration | ~47.3 s |
| File size | ~16.1 MB |

**Encode notes:** Clipchamp exports with **140px letterbox** top/bottom. Encode strips that (`crop=1920:800:0:140`) then scales to 1920×804 — matches original loop (cropdetect `1920:800:0:2`). Audio copied from source.
