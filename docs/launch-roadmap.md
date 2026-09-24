# Loot Chase — Launch Roadmap & Cost Plan

Prepared for a solo, minimal-developer-intervention launch strategy.

## Launch Steps & Costs

| Phase | Step | Dev help needed | Estimated cost |
|---|---|---|---|
| **1. Finish the game** | Core gameplay completion (sectors, Capstone boss, balance) | None — Claude-assisted | $0 |
| | Visual polish (AI-generated art, or keep current vector style) | None | $0–150 (optional AI image tool) |
| | Music/SFX | None | $0 (royalty-free) to ~$150 |
| | Playtesting/QA | None | $0 (friends, Reddit, Discord communities) |
| **2. Package for platforms** | Web build (itch.io-ready) | None — Phaser is natively web | $0 |
| | Android wrap (Capacitor) | Low — AI-assisted; occasional freelance if store rejects a build | $0 tool + $50–150 contingency |
| | Steam wrap (Electron + Steamworks SDK) | Moderate — realistically where a freelancer earns their fee | $150–500 (Pune freelance rate) |
| **3. Store & legal setup** | itch.io account | None | Free |
| | Google Play Console | None | $25 one-time, no renewal |
| | Apple Developer Program (iOS only) | None | $99/year |
| | Steam Direct | None | $100, recoupable at $1,000 revenue; Valve takes 30% thereafter |
| | Privacy policy / ToS | None | $0 (generators) to ~$50–80 reviewed |
| | GST / business registration | None to file, but CA consult worthwhile | ~₹2,000–5,000 one-time consult |
| **4. Marketing & launch** | Store page copy + trailer | None | $0–100 |
| | Devlogs / community building | None | $0 (time) |
| | Steam wishlist campaign | None | $0, needs 3–6 months lead time |
| **5. Post-launch** | Content updates, balance patches | None — Claude-assisted | $0 |
| | Analytics | None | $0 (itch.io/Steam built-in, or free GA) |

## Three Launch Tiers

1. **Web-only (itch.io)** — $0 platform fees, zero packaging work since Phaser runs natively in-browser. The truest "launch it myself" path — start here.
2. **+ Android** — adds roughly $75–175. Mostly self-serviceable with AI assistance. Note: new personal Google Play accounts must run a closed test with at least 12 opted-in testers for 14 consecutive days before getting production access — budget the time, not just the money.
3. **+ Steam** — adds roughly $250–600. The one tier where hiring a developer for a few focused hours is the pragmatic choice, not a failure of the minimal-intervention goal — Electron/Steamworks integration has enough platform-specific quirks that self-service gets meaningfully harder here.

## Notes

- Google requires India-based developers to determine their own GST obligations on sales to Indian customers. Some solo devs report GST registration applying under OIDAR rules even below the usual ₹20 lakh threshold — worth a one-time CA consult before going live rather than guessing.
- Recommended sequencing: launch web-first on itch.io to validate whether people actually stay engaged before spending anything on Android or Steam packaging — the same "prove it, then invest" discipline used throughout this project.

*Compiled August 27, 2026 — platform fees verified via web search at time of writing. Recheck before final launch since platform terms can change.*

---

## Budget in INR (recalculated 2026-09-24)

Exchange rate used: **₹85/USD** — floats, so re-verify before committing money.

### Recurring, while actively building

| Item | Free option | Paid | Call |
|---|---|---|---|
| Claude access | Free tier | Pro ~$20/mo (₹1,700) | Start free; upgrade only when message limits actually bite |
| Code hosting | GitHub free | — | Free permanently at this scale |
| Deployment | GitHub Pages / Vercel free | — | Free permanently at this scale |
| Domain | Free `github.io` URL | ~₹850/yr | Skip until there is real traffic |

Active build before first launch: **2–3 months**. Recurring total: **₹0–5,100**.

### One-time, by scenario

| Scenario | One-time | + Claude Pro worst case | **Total** |
|---|---|---|---|
| **Web only (itch.io)** | ₹2,000–5,000 | ₹5,100 | **₹7,100–10,100** |
| **+ Android** | ₹4,125–11,375 | ₹5,100 | **₹9,225–16,475** |
| **+ Steam** | ₹25,375–49,625 | ₹5,100 | **₹30,475–54,725** |

Scenario 1 detail: itch.io account ₹0 · privacy policy ₹0 (generator) · **CA consult ₹2,000–5,000** · trailer capture ₹0 (OBS) · editing ₹0 (DaVinci Resolve) · music/SFX ₹0 (OpenGameArt, freesound).

Scenario 2 adds: Google Play Console $25 = ₹2,125 one-time · Capacitor ₹0 · **14-day closed test with 12 testers** (time, not money) · ₹0–4,250 contingency for store-rejection fixes.

Scenario 3 adds: Steam Direct $100 = ₹8,500 (recoupable at $1,000 revenue; Valve takes 30% after) · Electron + Steamworks packaging ₹12,750–25,500 — the one place a short freelance engagement is the pragmatic call · store key art ₹0–4,250.

### The number worth internalising

**A real, live itch.io launch is achievable for under ₹10,000 all-in**, Claude Pro buffer included. The Steam total is 4–5× that and only becomes relevant once the web version proves people actually play.

The **CA consult is the one non-negotiable** before any money changes hands — guessing wrong on GST/OIDAR is a worse outcome than spending ₹3,000 to know.

### Free things commonly assumed to cost money

All code tooling (VS Code, Git, Phaser) · hosting at this scale · privacy-policy generation · trailer production (OBS + DaVinci Resolve) · community building (r/indiegaming, Discord, itch.io devlogs) · store page copy · post-launch balance patches.

*Source: claude.ai chat, 2026-09-24. Supersedes the USD table above where the two disagree.*
