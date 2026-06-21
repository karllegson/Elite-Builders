# Hero Video — Reference Specs

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
