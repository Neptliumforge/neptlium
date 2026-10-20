# Public semantic surface refinement

## Discovery evidence, 2026-10-20

Reference inspected through the authorized cloud browser:
`https://agent.tinyfish.ai/sign-up`.
The actual reference rendered **Light**, not Dark, at a measured CSS viewport
of 1363 × 936. No dark reference variant was observed or manufactured.

Observed: two columns divided by a fine rule; a short headline and benefits
on the left; a bounded, raised signup form on the right; repeated control
geometry; one orange action; a clear secondary sign-in route. Computed styles
show Inter, a 36px/600 editorial heading, 13px form controls and 6px control
radii. These are reference observations, not Neptlium token prescriptions.
The signup form was not submitted; no account was created. A cookie dialog
was present. Reference mobile, hover, error and submitted states were not
verified; do not infer them from this desktop observation.

Transferable principles: controlled reading width, separation of context from
action, a small number of surface planes, consistent control spacing and a
clear primary decision. No reference assets, branding, auth providers, code,
claims or exact layout are imported.

Neptlium production `/infrastructure` was inspected separately. Its family
container and hero had zero padding, transparent backgrounds and block flow;
the supposed action controls rendered as inline links. Repository inspection
found no CSS definitions for the `family-*` class family. The same composition
is used by Infrastructure, Intelligence, Institutional and the product index.
The global closing conversion also lacked its outer layout and hierarchy.
This is a verified layout gap, not evidence that Neptlium needs a new palette.

## Authority and scope

Canonical baseline: `4c3481d6b560da5210a50f2ccce9f3db5dd8148f`.
This branch starts from canonical main, independently of unmerged content
PR #128. The content candidate and its acceptance are not modified or inherited.

Read: root/Web AGENTS, documentation router, product constitution and hierarchy,
canonical design system, shared token/NTS CSS, shared ThemeProvider, Button,
Card and Field, Web global styles, route compositions and browser QA.

The implementation adds scoped composition inside the existing consolidated
Web stylesheet. Canvas, panel, text, border, action, typography, spacing,
radius and motion values consume existing canonical tokens. It does not
redefine those tokens, add an appearance algorithm, change shared components,
force Dark, recolor assets or introduce gradients/glass/animated financial state.

Dark maps to existing canvas `#0B0C0E` and panel `#111214`.
Light uses the existing Light mappings. System follows the unchanged shared
media resolver. Actual Light sections elsewhere are preserved.

Capabilities are presented as ordered rows in one quiet plane, rather than
invented dashboard metrics or unrelated cards. Native links retain their
destinations and semantics; 48px minimum actions and explicit focus outlines
improve keyboard and touch access.

The existing dark pressed-accent/foreground pairing calculates below 4.5:1.
These scoped actions use the established primary pair with an inset pressed
cue instead of consuming that low-contrast pairing. Focus uses the canonical
primary accent, which contrasts on both theme canvases. Shared tokens are
unchanged; this does not certify every shared component's state contrast.

## Validation and visual regression

The new GitHub-hosted Ubuntu workflow builds the actual PR base separately
from the candidate and captures matched screenshots. It runs the same browser
spec at 360, 390, 768, 1280 and 1440px for Light, Dark and System across all four
family routes. Checks cover canvas/panel roles, reading gutters, overflow,
single H1, minimum action height, sampled text/action contrast, hover, pressed
and focus behavior, System switching and preference continuity.

Pixel regression snapshots cover Infrastructure and Intelligence in Light and
Dark at 390 and 1440px. Initial baselines must be generated on GitHub Ubuntu,
visually inspected and committed; remove the bootstrap update flag before
freezing the review candidate. Subsequent runs compare checked-in images and
must not regenerate them to hide failures. Before/after evidence is a separate
artifact from those regression expectations. No browser PASS follows from
source calculations or successful builds alone.

No deployment is authorized by this audit alone. Exact-head acceptance,
documented main governance and production gates remain required. Financial,
identity, provider, database and environment behavior is outside this change.
