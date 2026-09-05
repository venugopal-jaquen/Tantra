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
