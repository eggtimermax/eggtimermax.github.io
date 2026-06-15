// Decorative egg-yolk bubbles in the page background (seeded, sparse).
(function () {
  const host = document.getElementById('bubbles');
  if (!host) return;
  const N = 16;
  let frag = '';
  for (let i = 0; i < N; i++) {
    const size = 16 + Math.random() * 90;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const op = 0.10 + Math.random() * 0.30;
    frag += `<span style="width:${size}px;height:${size}px;left:${left}%;top:${top}%;opacity:${op.toFixed(2)}"></span>`;
  }
  host.innerHTML = frag;
})();
