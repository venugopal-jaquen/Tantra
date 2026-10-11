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
// that needs no account. If the relay fails, the player is offered their own mail app.
// The address is assembled at run time only to keep the laziest scrapers off it; once
// the form is activated, replace it with the private alias FormSubmit emails you.
const Feedback = (() => {
  const $ = id => document.getElementById(id);
  const TO = ['vyjakhot', 'gmail.com'].join('@');
  const root = $('feedback'), text = $('fb-text'), email = $('fb-email'), note = $('fb-note'), send = $('fb-send');
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
  const mailto = msg => 'mailto:' + TO + '?subject=' + encodeURIComponent(GAME_TITLE + ' feedback') + '&body=' +
    encodeURIComponent(msg + '\n\n--\n' + Object.entries(details()).map(([k, v]) => k + ': ' + v).join('\n'));

  $('fb-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const msg = text.value.trim();
    if (msg.length < 3) { note.textContent = 'Type a few words first.'; note.className = 'fb-note fb-bad'; text.focus(); return; }
    busy = true; send.disabled = true; send.textContent = 'Sending';
    const reply = email.value.trim();
    const body = Object.assign({ _subject: GAME_TITLE + ' feedback', _template: 'table', _captcha: 'false',
                                 message: msg, reply_to: reply || '(not given)' }, details());
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
      text.value = '';
      note.textContent = 'Sent. Thank you!'; note.className = 'fb-note fb-good';
      send.textContent = 'Sent';
      setTimeout(close, 1500);
    } else {
      note.className = 'fb-note fb-bad';
      note.textContent = "Couldn't send it from here. ";
      const a = document.createElement('a');
      a.href = mailto(msg); a.textContent = 'Email it instead';
      note.appendChild(a);
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
  // Any script is welcome. Out go line breaks, control characters and angle brackets;
  // runs of spaces close up; the length is counted in whole characters.
  const clean = v => [...String(v || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim()].slice(0, MAX).join('').trim();
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
