/* A single realistic icon; animated highlights stay inside its alpha silhouette. */
(() => {
  const stream = (d, delay = 0) => `<path class="art-stream" d="${d}" pathLength="1" style="--delay:${delay}s"/>`;
  const signals = () => [
    'M24 48L45 35L65 57L86 38L108 51',
    'M26 80L45 65L66 85L87 64L105 76',
    'M45 35V65M65 57V85M86 38V64'
  ].map((d,i)=>stream(d,-i*.8)).join('');
  const orbit = () => [
    'M107 64C107 83 21 83 21 64S107 45 107 64',
    'M88 22C104 31 53 113 39 105S72 14 88 22',
    'M39 22C54 14 105 97 89 105S23 31 39 22'
  ].map((d,i)=>stream(d,-i*.7)).join('');
  const strands = () => stream('M42 18C96 35 32 51 42 64S97 90 42 110') + stream('M86 18C31 35 95 51 86 64S31 90 86 110',-1.4);
  const reaction = () => [52,65,78].map((x,i)=>`<circle class="art-bubble" cx="${x}" cy="91" r="${2+i%2}" style="--delay:${-i*.9}s"/>`).join('');
  const chart = () => [35,49,63,77,91].map((x,i)=>`<rect class="art-bar" x="${x}" y="${53-i*5}" width="8" height="${43+i*5}" rx="2" style="--delay:${-i*.61}s;--duration:${2.7+i*.27}s"/>`).join('');
  const circuits = () => ['M18 40H41V52H64V33H107','M20 82H46V66H80V87H108','M51 17V40H78V108'].map((d,i)=>stream(d,-i*.9)).join('');
  const scan = () => '<path class="art-scan" d="M20 28H108"/>';
  const records = () => ['M30 42H98','M30 65H98','M30 87H98'].map((d,i)=>stream(d,-i*.75)).join('');
  const glow = () => '<ellipse class="art-core" cx="64" cy="64" rx="26" ry="32"/>';
  window.subjectIcon = s => {
    const effects = {0:()=>stream('M39 28H91L68 40V103',0),1:orbit,2:strands,3:reaction,4:signals,5:signals,6:circuits,7:signals,8:signals,9:records,10:scan,11:circuits,12:circuits,13:circuits,14:glow,15:signals,16:()=>stream('M43 55H86V93H43Z'),17:chart,18:chart,19:records,20:circuits};
    const image = `<image href="${s.icon}" x="10" y="10" width="108" height="108"/>`;
    return `<svg class="realistic-icon" viewBox="0 0 128 128" aria-hidden="true" focusable="false" style="--phase:${-(s.id%7)*.31}s"><defs><mask id="art-mask-${s.id}" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128" style="mask-type:alpha">${image}</mask></defs>${image}<g class="art-effects" mask="url(#art-mask-${s.id})">${(effects[s.id]||signals)()}</g></svg>`;
  };
})();
