/*
 * dialogs.js: the two forms that are the page's own: sending feedback, and naming the hero.
 *
 * Declares  Feedback (open, close, isOpen) and Namer.
 * Needs     config.js (the build goes with a message), persistence.js (the nickname).
 * State     their own DOM. Feedback posts to the one outside address the game may name
 *           (tools/build-itch.py holds the list).
 */

// Feedback (requirements 2.21): a text box whose contents are emailed to the developer.
// A static page cannot send mail, so the message goes through FormSubmit, a free relay
// that needs no account. Since build 0.24 it goes to the private alias FormSubmit issued
// when the form was activated, so no address of the founder's is anywhere in the game
// (pre-launch security checklist, line 1). That is also why a failed send offers no mail
// app to fall back on: it would need the address. The message stays in the box to try again.
const Feedback = (() => {
  const $ = id => document.getElementById(id);
  const TO = 'a821312a06dc6b970adddda4e0a29f57';        // FormSubmit's alias for the founder's inbox
  const root = $('feedback'), text = $('fb-text'), email = $('fb-email'), note = $('fb-note'), send = $('fb-send'), honey = $('fb-honey');
  // At most LIMIT messages in WINDOW from one browser (pre-launch security checklist, line 11).
  const LIMIT = 3, WINDOW = 10 * 60 * 1000, SENT = 'loot-chase-feedback-sent';
  const recent = () => { try { return (JSON.parse(STORE.read(SENT)) || []).filter(t => Date.now() - t < WINDOW); } catch (e) { return []; } };
  const NOTE = note.textContent;
  let busy = false;
  // Phaser claims W, A, S, D, E, P, Space and the arrows, and would swallow them as typed.
  const gameKeys = on => { try { game.input.keyboard.enabled = on; } catch (e) { /* game not up */ } };
  const details = () => {
    let best = 0; try { best = session.bestSector || 0; } catch (e) { /* game not up */ }
    return { build: BUILD, best_sector: best, screen: innerWidth + 'x' + innerHeight, device: navigator.userAgent };
  };
  const close = () => { root.hidden = true; gameKeys(true); };
  const open = () => {
    note.textContent = NOTE; note.className = 'fb-note';
    send.disabled = false; send.textContent = 'Send';
    root.hidden = false; gameKeys(false);
    setTimeout(() => text.focus(), 50);
  };
  $('fb-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const msg = text.value.trim();
    if (msg.length < 3) { note.textContent = 'Type a few words first.'; note.className = 'fb-note fb-bad'; text.focus(); return; }
    if (recent().length >= LIMIT) { note.textContent = 'That is a lot of messages at once. Try again in a few minutes.'; note.className = 'fb-note fb-bad'; return; }
    busy = true; send.disabled = true; send.textContent = 'Sending';
    const reply = email.value.trim();
    const body = Object.assign({ _subject: GAME_TITLE + ' feedback', _template: 'table', _captcha: 'false',
                                 _honey: honey.value, message: msg, reply_to: reply || '(not given)' }, details());
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reply)) body._replyto = reply;
    let ok = false;
    try {
      const res = await fetch('https://formsubmit.co/ajax/' + TO, { method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      ok = res.ok && String(data.success) === 'true';
    } catch (err) { ok = false; }
    busy = false;
    if (ok) {
      try { STORE.write(SENT, JSON.stringify(recent().concat(Date.now()))); } catch (e) { /* no storage: no limit */ }
      text.value = '';
      note.textContent = 'Sent. Thank you!'; note.className = 'fb-note fb-good';
      send.textContent = 'Sent';
      setTimeout(close, 1500);
    } else {
      note.className = 'fb-note fb-bad';
      note.textContent = "Couldn't send it from here. Check your connection and try again: your message is kept.";
      send.disabled = false; send.textContent = 'Try again';
    }
  });
  $('fb-cancel').addEventListener('click', close);
  root.addEventListener('click', e => { if (e.target === root) close(); });
  root.addEventListener('keydown', e => { if (e.key === 'Escape') close(); e.stopPropagation(); });
  return { open, close, get isOpen() { return !root.hidden; } };
})();

// Naming yourself (requirements 2.32). The hero has no name of their own: the player
// gives one here. A plain text field, because the engine has none and a phone's keyboard
// only comes up for a real one.
const Namer = (() => {
  const $ = id => document.getElementById(id);
  const root = $('namer'), text = $('nm-text'), MAX = 14;
  let done = null;
  const gameKeys = on => { try { game.input.keyboard.enabled = on; } catch (e) { /* game not up */ } };
  // Any script is welcome. Out go line breaks, control characters and angle brackets; and
  // (build 0.28) the invisible characters that make a name blank or turn its text backwards:
  // zero-width spaces, direction marks, overrides and isolates. The joiners that Indian
  // scripts and emoji families need stay. Runs of spaces close up. The length is counted in
  // characters as they are seen, so a flag or a family is never cut in half; a name of
  // nothing visible is no name.
  const INVISIBLE = /[\u0000-\u001f\u007f<>\u200B\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
  const whole = s => typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter().segment(s)].map(x => x.segment) : [...s];
  const clean = v => {
    const s = whole(String(v || '').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim()).slice(0, MAX).join('').trim();
    return /[^\s\u200C\u200D]/.test(s) ? s : '';
  };
  const close = () => { root.hidden = true; gameKeys(true); };
  const open = (current, onSave) => {
    done = onSave; text.value = current || '';
    root.hidden = false; gameKeys(false);
    setTimeout(() => { text.focus(); text.select(); }, 50);
  };
  $('nm-form').addEventListener('submit', e => { e.preventDefault(); const name = clean(text.value); close(); if (done) done(name); });
  $('nm-cancel').addEventListener('click', close);
  root.addEventListener('click', e => { if (e.target === root) close(); });
  root.addEventListener('keydown', e => { if (e.key === 'Escape') close(); e.stopPropagation(); });
  return { open, close, clean, get isOpen() { return !root.hidden; } };
})();
