# Session Summary

## Session
- Date: 2026-08-01
- Version (if applicable): SnapTask v1.0.0 (website), pre-Google-Play-launch

## Objective
Audit and update the SnapTask marketing website (static HTML/CSS/JS, no framework) so it accurately reflects the current Android app implementation and complies with Google Play and Google AdMob requirements, ahead of Google Play publication. Content/legal/metadata pass only — no visual redesign.

## Completed Work
- Verified (did not author from scratch — found already staged in git index) a full content rewrite across `index.html`, `privacy.html`, `support.html`, `404.html`, `robots.txt`, `sitemap.xml`.
- Confirmed removal of all outdated claims ("No Ads", "No Internet Permission", etc.) — none remain anywhere on the site.
- Confirmed ad disclosure is accurate site-wide: Google AdMob **banner ads only**, explicitly no interstitial/rewarded/native/app-open, stated in hero trust strip, features, FAQ, privacy §7–8, support page.
- Confirmed Google UMP consent-management language is present (privacy.html §9–10, FAQ) with GDPR/UK GDPR/US state law framing.
- Confirmed permissions table (privacy.html §12, support.html) lists exactly 5 permissions matching user-provided spec: `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `INTERNET`, `ACCESS_NETWORK_STATE` — INTERNET/ACCESS_NETWORK_STATE correctly scoped to AdMob only, not OCR/screenshots/reminders.
- Confirmed three-email routing matches spec: `support@snaptask.site` (bugs/technical), `hello@snaptask.site` (feedback/feature requests), `contact@snaptask.site` (business/developer/footer identity, structured data author email).
- Verified all internal links resolve (no broken hrefs) and all referenced image assets (`favicon.png`, `logo.png`, `hero-image.png`) exist in `assets/`.
- Verified `robots.txt` / `sitemap.xml` are current, consistent, and point at the right canonical URLs.
- Verified `manifest.webmanifest` and `browserconfig.xml` have no stale claims.

## Architecture Changes
None — this was a content/copy/metadata pass only. Visual identity, layout, CSS, and JS behavior (`script.js`) were left untouched.

## Files Created
None this session (SESSION_SUMMARY.md itself is new, created per new standing instruction).

## Files Modified
(Already staged prior to this session's review; verified, not re-edited)
- `index.html` — hero, features, FAQ, footer, structured data (SEO/OG/Twitter meta)
- `privacy.html` — full 17-section rewrite covering data collection, OCR, local storage, advertising, AdMob, UMP, personalized/non-personalized ads, permissions table, children's privacy, international users
- `support.html` — contact section, FAQ, Android requirements, permissions list
- `404.html` — minor copy/meta consistency
- `robots.txt` — sitemap reference, disallow rules
- `sitemap.xml` — lastmod dates, priorities

## Current Project Status
Website content is accurate, internally consistent, and believed ready for Google Play submission from a content/legal standpoint. No stale claims, no broken links, no missing assets. This repo contains **only the static website** — no Android app source (`AndroidManifest.xml`, Kotlin) is present here, so permission claims were taken as authoritative from user-provided spec, not independently verified against real manifest.

## Known Issues
- `app-ads.txt` is **missing** from the site root. Required by Google once AdMob account is live, at `https://snaptask.site/app-ads.txt`, declaring the AdMob publisher ID (format: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`). Not created because the real publisher ID wasn't available — do not fabricate one.
- Permissions/manifest claims are unverified against actual `AndroidManifest.xml` (not in this repo). Should be cross-checked once available, especially for AdMob SDK auto-merged permissions (e.g. `com.google.android.gms.permission.AD_ID`, Privacy Sandbox `ACCESS_ADSERVICES_*`).
- Hero/CTA copy still says "Coming to Google Play" / "Available Soon" — intentionally left as pre-launch phrasing; needs updating to a real Play Store link once the listing is live.
- Play Console Data Safety form has not been cross-verified against privacy.html §12 — should be checked once that form is filled in.

## Next Step
Obtain the real AdMob publisher ID and add `app-ads.txt` to the site root. Then, once `AndroidManifest.xml` is accessible, do a line-by-line diff against the permissions table in `privacy.html` and `support.html` to confirm no permissions were missed or added by SDK manifest merging.

## Notes for ChatGPT
- This is a **static website only** (no build system, no framework) — plain HTML/CSS/JS files at repo root (`index.html`, `privacy.html`, `support.html`, `404.html`, `styles.css`, `script.js`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `browserconfig.xml`, `assets/`).
- The actual Android app (Kotlin + Jetpack Compose, Room DB, ML Kit OCR, AdMob banner ads, UMP consent) lives in a **separate repo/location** not present here — treat any permission/feature claims about the app itself as user-provided fact, not derivable from this codebase.
- Package name: `com.saadelfadil.snaptask`. Developer: Saad El Fadil. Domain: `https://snaptask.site`.
- Ad model is strictly banner-only via Google AdMob; do not introduce or imply interstitial/rewarded/native/app-open ads anywhere.
- Three-email contact scheme is deliberate and should be preserved: `support@` = bugs/technical, `hello@` = feedback/feature requests, `contact@` = business/partnerships/developer identity.
- User explicitly does not want redesigns — only content, legal wording, metadata, and small UI-text fixes are in scope unless told otherwise.
- Per standing instruction, this `SESSION_SUMMARY.md` should be regenerated/overwritten (not appended) at the end of every future session in this project.
