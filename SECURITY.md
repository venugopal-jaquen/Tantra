# Security

Sevenwell is a static browser game. It has no server of its own, no accounts, no
payments and no ads. Your progress is saved only in your own browser. The one thing that
ever leaves it is a message you choose to send with the Feedback button (see Privacy,
below).

## Telling us about a problem

If you find a way the game, its page or this repository could harm a player or be
misused, please tell us privately first, not in a public issue:

1. Open the game at <https://venugopal-jaquen.github.io/Tantra/> and press **Feedback**
   on the title screen.
2. Start the message with **SECURITY**, say what you found and how to see it happen.
3. Add a reply address if you would like an answer.

Please give a fix a chance to go live before you tell others.

## What this covers

- The game as served from this repository's `main` branch on GitHub Pages, and the copy
  uploaded to itch.io.
- The code and tools in this repository.

itch.io, GitHub and FormSubmit (the relay that carries feedback) are run by others:
report a problem with them to them.

Only the live build gets fixes. The build you are playing is shown at the foot of the
title screen.

## Privacy

- **Progress** is kept in your browser's local storage on your device. Clearing your
  browser's site data clears it. It is never sent anywhere.
- **Feedback** sends what you type, and with it the build number, how deep you have been,
  your screen size, your browser's own description of itself (its user agent) and the last
  few error messages the game hit, if any (only the error's words and where in the game's
  files it happened), to the developer's inbox through FormSubmit. A reply address goes
  only if you give one. Nothing is sent until you press Send.
- **Nothing else.** No analytics, no tracking, no cookies of the game's own, and nothing
  loaded from another site: the page's security policy refuses it.
- The sites that serve the game (GitHub Pages, itch.io) keep their own records under
  their own privacy policies.
