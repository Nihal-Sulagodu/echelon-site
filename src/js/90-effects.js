/* 90 · the Effects switch -----------------------------------------------------------------
 * One button turns every effect off or back on, and the choice is remembered.
 * It starts "off" for visitors who have "reduce motion" set on their device.
 */

function setEffects(on, remember) {
  html.classList.toggle('fx-off', !on);
  if (remember) local.set('echelon-fx', on ? 'on' : 'off');
  const btn = $('[data-fx-toggle]');
  if (btn) btn.setAttribute('aria-pressed', String(on));
  if (on) {
    initLens();
    initScroll();
    if (orb) orb.start();
    if (dots) dots.play();
  } else {
    if (lens) lens.destroy();
    destroyScroll();
    if (orb) orb.still();
    if (dots) dots.still();
    if (well) well.still();
  }
}

function initEffectsToggle() {
  const btn = $('[data-fx-toggle]');
  if (!btn || !SITE.effects) return;
  btn.hidden = false;
  btn.setAttribute('aria-pressed', String(fxOn()));
  btn.addEventListener('click', () => setEffects(!fxOn(), true));
  // Follow the device's "reduce motion" setting if it changes, unless the
  // visitor already chose for themselves.
  media('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (!local.get('echelon-fx')) setEffects(!e.matches, false);
  });
}
