// Decorative egg-yolk bubbles — animated drift via CSS custom properties.
(function () {
  const host = document.getElementById('bubbles');
  if (!host) return;
  const N = 20;
  let frag = '';
  for (let i = 0; i < N; i++) {
    const size  = 14 + Math.random() * 96;
    const left  = Math.random() * 100;
    const top   = Math.random() * 100;
    const op    = 0.10 + Math.random() * 0.28;
    const dur   = (6 + Math.random() * 9).toFixed(1);
    const delay = (Math.random() * 7).toFixed(1);
    frag += `<span style="width:${size}px;height:${size}px;left:${left}%;top:${top}%;opacity:${op.toFixed(2)};--dur:${dur}s;--delay:${delay}s"></span>`;
  }
  host.innerHTML = frag;
})();
