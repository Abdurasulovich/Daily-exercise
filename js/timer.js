// Rest timer between sets. Based on an end timestamp, so it stays correct
// when the phone throttles timers in the background.
import { el, icon } from './ui.js';
import { fmtClock } from './logic.js';
import { notify } from './notify.js';

let node, tick, endAt = 0, total = 0, audio, finishedTimer;
const R = 24, C = 2 * Math.PI * R;

function ensureAudio() {
  // Must be created during a user gesture (the set checkbox tap) for iOS.
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch { /* no audio */ }
}

function beep() {
  if (!audio) return;
  const t = audio.currentTime;
  [0, 0.25, 0.5].forEach((d, i) => {
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = i === 2 ? 1320 : 880;
    g.gain.setValueAtTime(0.0001, t + d);
    g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
    o.connect(g).connect(audio.destination);
    o.start(t + d); o.stop(t + d + 0.2);
  });
}

function render() {
  const left = Math.max(0, (endAt - Date.now()) / 1000);
  node.querySelector('.time').textContent = fmtClock(Math.ceil(left));
  node.querySelector('.val').style.strokeDashoffset = String(C * (1 - left / total));
  if (left <= 0) finish();
}

function finish() {
  clearInterval(tick);
  tick = null;
  node.classList.add('finished');
  node.querySelector('.lbl').textContent = 'Dam olish tugadi — keyingi set!';
  node.querySelector('.time').textContent = '0:00';
  navigator.vibrate?.([250, 120, 250, 120, 400]);
  beep();
  if (document.visibilityState === 'hidden') notify('Dam olish tugadi', 'Keyingi setni boshlash vaqti!', 'rest-timer');
  finishedTimer = setTimeout(stop, 6000);
}

export function startRest(seconds, label = 'Dam olish') {
  if (!seconds || seconds <= 0) return;
  ensureAudio();
  clearTimeout(finishedTimer);
  stop();
  total = seconds;
  endAt = Date.now() + seconds * 1000;
  node = el(`<div class="rest-timer" role="timer" aria-live="off">
    <svg class="rest-ring" viewBox="0 0 56 56"><circle class="track" cx="28" cy="28" r="${R}"/><circle class="val" cx="28" cy="28" r="${R}" stroke-dasharray="${C}"/></svg>
    <div><div class="time">${fmtClock(seconds)}</div><div class="lbl"></div></div>
    <button class="btn btn-sm" data-add aria-label="15 soniya qo‘shish">+15</button>
    <button class="icon-btn" data-skip aria-label="O‘tkazib yuborish">${icon.skip}</button></div>`);
  node.querySelector('.lbl').textContent = label;
  node.querySelector('[data-add]').addEventListener('click', () => {
    if (!tick) return;
    endAt += 15000; total += 15; render();
  });
  node.querySelector('[data-skip]').addEventListener('click', stop);
  document.body.append(node);
  tick = setInterval(render, 250);
  render();
}

export function stop() {
  clearInterval(tick);
  tick = null;
  node?.remove();
  node = null;
}

document.addEventListener('visibilitychange', () => { if (node && tick) render(); });
