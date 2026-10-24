# Homepage Tidal Arc background

The homepage uses the original Neptlium Tidal Arc motion asset approved for production integration. This is decorative imagery, not a brand mark or a representation of financial activity.

- `/motion/tidal-arc.mp4`: H.264, 1920×1080, 30 fps, 10 seconds, silent, 784,692 bytes.
- `/motion/tidal-arc-poster.jpg`: still fallback and reduced-motion presentation.
- Original procedural artwork; no Mercury footage, interface, logo or third-party stock is included.

`components/home-background.tsx` owns playback. It attaches the video source only when motion is allowed, pauses outside the viewport or in a hidden document, and provides an explicit pause/play button. The static poster remains available without JavaScript or successful playback. Reduced motion prevents the initial video request. Theme-aware overlays consume existing semantic tokens; they do not establish another theme authority.

Only the homepage opening composition changes. Existing copy, destinations, subsequent content and shared theme behavior remain intact. The same CSS module is used by Investments, so background-specific layout is scoped with `motionHero` and `motionHeroGrid`.

Browser coverage: `tests/e2e/home-background.spec.ts` checks playback, pause/resume, offscreen suspension, overflow and reduced-motion network behavior across the configured release widths. A deployment still requires the repository's existing CI and release process.
