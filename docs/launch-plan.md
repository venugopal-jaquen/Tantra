# Sevenwell: the launch plan for Tuesday 20 October 2026

Written 2026-10-16, a Friday: four days out. **The date is fixed** (the founder,
2026-10-16): the 20th is Dussehra, an auspicious day, and a chance to reach Indian players
on a day about the victory of good over evil. All times are India time (IST). "Founder",
"Claude" and "ChatGPT" say who does each step. Nothing goes public, and nothing is posted,
uploaded or merged, without the founder's own word, as always.

## 0. What a launch can win, and what it cannot

- **What itch.io rewards.** Its browse pages ("New & Popular", the HTML5 and mobile tags)
  rank a game by what happens in its first days: plays, how long people stay, ratings,
  comments, and people adding it to collections. So the first 72 hours after going public
  are the ones to fill with players, not the hours after.
- **The best feedback is free.** A free browser game with a feedback button is a
  playtest of the whole internet. The real gain of this launch is learning what
  strangers do: where they quit, what they say, whether they come back. Revenue
  is not the aim: the game is free, with no payments (decided 2026-10-16).
- **What will not happen.** Hundreds of thousands of plays in week one. A good result for
  a first free HTML5 game on itch.io is a few hundred to a few thousand plays and a
  handful of written comments. Plan for that and treat anything more as luck.
- **The strongest assets we have:**
  - it plays on a phone, one thumb, in the browser, with no install;
  - it belongs to the "survivors-like" genre (Vampire Survivors and its kind), which
    players already search for;
  - the stepwell setting, which no other game in the genre has;
  - a five-minute run.

## 1. Risks to settle before the 20th

| Risk | What to do | Who |
|---|---|---|
| **The boss bug (0.30) is not live yet.** A second Thirst in front of strangers is the worst first impression | Merge 0.29, then 0.30, by the 18th at the latest | Founder's word, Claude |
| **No mid-range Android has played it** (L8). Most Indian players and many others are on one | One full run on a ₹10–20k Android phone, any friend's will do: watch for stutter, heat and text size | Founder |
| **The five outside players (P11) have not played.** The agreed plan was five strangers before public | Shrink it to 48 hours: send the private link on the 17th, read answers on the 19th | Founder |
| **Generative-AI disclosure.** Some communities remove or attack games with AI-made art. itch.io lets players filter it out | Disclose honestly (`itch-page.md` §4). Choose subreddits that allow it; say it plainly in posts, never hide it | Founder, Claude checks each community's rules |
| **Store pictures are from 0.25.** Names and screens have changed since | New screenshots, GIF and a vertical clip from 0.30 | Claude |
| **The itch.io frame** (storage, fullscreen, security policy, feedback relay) is untested | `itch-page.md` §5 on the draft page, on a phone | Founder |

The date stays. So if the Android run or the five players turn up something serious,
it is fixed by the 19th or the launch goes out without what is unsafe: a feature can wait,
a run-ending bug cannot.

**The Dussehra angle.** The festival is about good winning over evil, and Sevenwell is a
hero taking back what a villain stole. Say that in the posts for Indian communities and
friends ("This Dussehra, go down the well and take the water back"). Keep it to the
festival's meaning: no gods, no Ravana, no effigies or sacred pictures in the posts, as
in the game itself (enemies are never revered beings). Indian players are online for the
festival in the morning and evening; the plan's 10:00 and 11:00 slots are for them.

## 2. Day by day

### Friday 16 October (today)

- [ ] Founder's word to merge 0.29 and then 0.30 (Claude: GitHub's tests made reliable on slow machines first; in progress).
- [ ] Claude: the pre-launch security checklist re-run on 0.30, only what changed since 2026-10-16 morning.
- [ ] Founder: pick the five outside players. Mix them: two who play phone games, one PC gamer, one who never games, one roguelite fan. Ask each now whether they can play on the 17th or 18th.
- [ ] Founder: find the Android phone for the 17th.

### Saturday 17 October: the draft page

- [ ] Claude: `python tools/build-itch.py`, quick checks and smoke test on the folder, then hand over `dist/sevenwell-0.30-itch.zip`.
- [ ] Claude: new store pictures from 0.30:
  - five screenshots (title, a level fight, a boss with anchors, the boon pick, The Thirst);
  - the cover (630×500);
  - the GIF;
  - a 20–30 second vertical clip of a run for Shorts, Reels and TikTok.

  All headless and muted; the founder chooses.
- [ ] Founder, about 45 minutes: create the itch.io page as a **draft** (`itch-page.md` §2: name *Sevenwell*, kind HTML, embed size, "mobile friendly", fullscreen button). Then:
  1. upload the zip;
  2. paste the text (§3);
  3. answer the AI disclosure (§4);
  4. pick the tags (below);
  5. set pricing to *No payments* (decided 2026-10-16).
- [ ] Founder, 20 minutes: `itch-page.md` §5 on the draft page, on your phone: one full run, one feedback message, fullscreen.
- [ ] Founder: Android run. Note anything slow, hot, small or broken; send it to Claude.
- [ ] Founder, evening: send the private link to the five. The message: "It's a five-minute phone game. Play two runs, then press Feedback and tell me where you got bored or confused. Be blunt."
- [ ] **Tags** (itch.io allows 10): survivors-like, roguelite, auto-battler, arcade, action, mobile, one-handed, fantasy, short, singleplayer. Genre: Action. Made with: Phaser.

### Sunday 18 October: fix what strangers find

- [ ] Founder: forward what comes in (feedback mails, itch.io comments, anything said in person).
- [ ] Claude: fix only what blocks or confuses. No new features. Each fix goes in as a build in Beta, with tests and a pull request at the founder's word, then a new zip to the same page.
- [ ] Claude: write the launch texts for the founder to edit and post:
  - the itch.io devlog "Sevenwell is out";
  - one Reddit post per community, each in that community's own format;
  - an X and Bluesky thread;
  - a short message for friends and WhatsApp;
  - a short email for press and curators.
- [ ] Founder, 30 minutes: create or warm up the accounts you will post from. Reddit removes posts from brand-new or silent accounts. Comment helpfully on a few posts in r/WebGames and r/roguelites today, so the account is not new on the 20th.
- [ ] Founder: a 2-line "about me" for the page and posts: who you are, why a stepwell. People share a person, not a product.

### Monday 19 October: ready, not public

- [ ] Founder + Claude: read the five players' answers. Go or move the date. The bar is that **nobody hit a bug that ended their run unfairly and nobody was lost in the first minute**.
- [ ] Claude: final zip if anything changed; the security checklist's last re-check; the store pictures replaced if screens changed.
- [ ] Founder: schedule nothing. Posting by hand on the day lets you answer replies within minutes, which is what keeps a Reddit post alive.
- [ ] Founder: an early night. The 20th is a long evening.

### Tuesday 20 October: launch day

| Time (IST) | Step | Who |
|---|---|---|
| 09:00 | One last full run on the itch.io page, on your phone | Founder |
| 09:30 | **Visibility: Public.** Publish the devlog "Sevenwell is out" on the page (itch.io shows devlogs to followers and in its feed) | Founder |
| 10:00 | Personal network first: WhatsApp, Instagram story, LinkedIn post, friends. Ask for a *play and an honest comment on the page*, not likes. Early real plays and comments are what itch.io ranks | Founder |
| 11:00 | Indian communities while India is awake: r/IndianGaming, r/developersIndia's showcase thread (if its rules allow), an IGDC or Indian game-dev Discord | Founder |
| 13:00 | Discord servers you belong to that have a "show your game" channel (the Phaser Discord, roguelite and indie servers) | Founder |
| 18:30 | **r/WebGames** (the largest audience for a free browser game), as the US wakes. Title: what it is in one line, nothing about AI or development. Stay 2 hours and answer every comment | Founder |
| 19:30 | r/playmygame and r/roguelites (if their rules allow a browser game that day). A different post for each, not a copy | Founder |
| 20:30 | X and Bluesky thread with the clip: #indiedev #indiegame #roguelite #gamedev | Founder |
| 21:00 | Short-form clip on YouTube Shorts and Instagram Reels (TikTok if you use it). Vertical, sound on, first second is action | Founder |
| 23:00 | Read the itch.io analytics (views, plays, time played); forward all feedback to Claude | Founder |

One rule all day: **answer every comment, thank every player, argue with no one.**

### Right after the launch: the repository goes private

Decided by the founder on 2026-10-16: the first thing after the launch on itch.io.

1. **Choose how to keep the test link working:** GitHub Pro (about $4 a month), or host the test link elsewhere for free (Cloudflare Pages or Netlify). Pro also keeps `main`'s protection; elsewhere, Claude keeps the PR-and-tests routine by hand. Founder's choice.
2. **Founder:** Settings, General, Danger Zone, Change visibility, Make private. Or say the word and Claude runs `gh repo edit --visibility private`.
3. **Claude:**
   - repoint `SECURITY.md` and the README at the new test link;
   - check that GitHub's tests still run and that `main`'s protection holds (with Pro);
   - check that the itch.io page is untouched.
4. The tests use the private allowance of 2,000 minutes a month, about 50 merges.

### Wednesday 21 to Friday 23 October: the first 72 hours

- [ ] Founder, daily 15 minutes: reply to comments; forward feedback.
- [ ] Claude: a small fix build each day if needed; each one a devlog line ("Fixed: …"). A changing game is ranked as alive.
- [ ] Wed 18:30 IST: r/IndieGaming (Wednesdays are self-promotion days there; check before).
- [ ] Sat 24: #ScreenshotSaturday on X and Bluesky, and the Saturday thread on r/gamedev, with one striking picture (a boss slam, the stepwell).
- [ ] Fri 23: write to a few curators of free browser and mobile games:
  - YouTubers who play "survivors-like" or itch.io games;
  - Indian gaming sites and newsletters, for the stepwell story.

  A two-line email, a link and the clip. Expect one answer in ten.

### Week 2 onward

- [ ] Read the numbers against §4. Decide with Claude what the next build is for.
- [ ] Turn on the reminders already pinned for after launch: the daily descent (P9), buying music (P10), the badges tab (P13), cosmetics (P12).
- [ ] Consider game jams on itch.io (a jam is the cheapest way to be seen there) and portals that pay for browser games, CrazyGames and Poki (they need their own SDK and review: a later build).
- [ ] A devlog every week or two: what changed, why, one picture.

## 3. Money ("gains")

- **Decided (2026-10-16): free, no payments.** On the page: Pricing, *No payments*.
  Payment can be added later; see "Can it be downloaded?" below.
- **Not now:** ads in the game, paid unlocks, a paid download. They cost goodwill and
  rankings at this size and add rules to follow.
- **Later, if players stay:** a paid "supporter pack" (cosmetics, P12, when they exist),
  and the browser-game portals above.

### Can it be downloaded?

- **On itch.io:** the zip uploaded for playing in the browser is, as far as itch.io's
  usual behaviour goes, played there and not listed as a download. Check it on the
  draft page: if a Download button shows, untick the file's download option.
- **But the game is free anyway, elsewhere.** The whole game, code and pictures, is in
  the public GitHub repository and playable at the GitHub Pages address. Anyone can copy
  it today. Any browser game can also be saved from the browser with some effort.
- **So if a price is ever added,** it should be for something new: a later build, a
  supporter pack, extra depths. Not for this game. Making the repository private would
  stop new copies, but it would also stop GitHub Pages on a free plan, which is the
  test link. That is a decision for later; nothing needs doing before the 20th.

## 4. How to read the first two weeks

itch.io's analytics give views, plays (browser games count a play on load), time played
and where visitors came from. Against each, the question to ask:

| Figure | Healthy for a first game | If it is low |
|---|---|---|
| Plays ÷ views | over 30% | the cover, title or first screenshot is not selling it |
| Time played, typical | over 5 minutes (a full run) | the first minute loses people: ask the five what happened |
| Comments | any, unprompted | ask for them in the devlog and on the end-of-run screen |
| Feedback messages | a few a day in the first week | none means the button is not seen |
| Where visitors came from | one source well above the rest | post more where it worked; stop where it did not |

## 5. What Claude prepares, ready for the founder's word

1. The 0.30 zip and its checks.
2. New store pictures, GIF and a vertical clip from 0.30.
3. Every launch text in §2, ready to edit: devlog, each Reddit post, the thread, the
   WhatsApp message, the curator email.
4. A one-page press kit on the itch.io page: what it is, pictures, the clip, who made it,
   a contact through the feedback form.
5. A short daily summary after launch: what came in, what is broken, what to fix.
