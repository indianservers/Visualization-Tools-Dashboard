/* Subject-specific mechanisms; no generic moving highlights. */
(() => {
  const particle = (path, delay=0) => `<circle class="motion-electron" r="3" style="offset-path:path('${path}');animation-delay:${delay}s"/>`;
  const circuit = path => `<path class="motion-track" d="${path}"/>${particle(path)}`;
  const atom = () => `<circle cx="64" cy="64" r="10" fill="#f59e0b" stroke="#ffe7a0"/>${[0,60,120].map((angle,i)=>`<g transform="rotate(${angle} 64 64)"><ellipse class="atom-orbit" cx="64" cy="64" rx="47" ry="18"/>${particle('M111 64A47 18 0 1 1 17 64A47 18 0 1 1 111 64',-i*1.1)}</g>`).join('')}`;
  const bars = () => [35,51,67,83].map((x,i)=>`<rect class="motion-bar" x="${x}" y="${80-i*10}" width="10" height="${22+i*10}" rx="2" style="animation-delay:${-i*.6}s"/>`).join('');
  const neural = () => [38,64,90].map((y,i)=>`<path class="motion-track" d="M30 64L64 ${y}L98 64"/><circle class="motion-node" cx="64" cy="${y}" r="5" style="animation-delay:${-i*.6}s"/>`).join('');
  const effects = {
    0:()=>'<path class="motion-curve" d="M29 88Q54 91 65 63T101 30"/>',
    1:atom,
    2:()=>'<path d="M49 24C89 46 39 82 79 104M79 24C39 46 89 82 49 104"/>'+[35,49,64,79,93].map((y,i)=>`<path class="motion-rung" d="M51 ${y}H77" style="animation-delay:${-i*.4}s"/>`).join(''),
    3:atom,
    4:neural,
    5:()=>'<path class="motion-curve" d="M30 92L98 37"/><g fill="#fbbf24"><circle cx="40" cy="78" r="3"/><circle cx="57" cy="70" r="3"/><circle cx="73" cy="48" r="3"/><circle cx="91" cy="42" r="3"/></g>',
    6:()=>circuit('M22 46H47V64H83V85H107'),
    7:()=>neural()+particle('M30 64L64 38L98 64'),
    8:()=>circuit('M28 34H65V64H99M65 64V96H32'),
    9:()=>[43,64,85].map((y,i)=>`<rect class="motion-row" x="39" y="${y}" width="50" height="7" rx="3" style="animation-delay:${-i*.7}s"/>`).join(''),
    10:()=>'<g class="motion-focus"><path d="M36 47V36H47M81 36H92V47M92 81V92H81M47 92H36V81"/><circle cx="64" cy="64" r="13"/></g>',
    11:()=>circuit('M22 42H46V58H80V84H106'),
    12:()=>'<circle class="motion-logic" cx="31" cy="54" r="4"/><circle class="motion-logic" cx="98" cy="64" r="5" style="animation-delay:1.2s"/>',
    13:()=>circuit('M28 87V43H56V70H93V37'),
    14:()=>'<path class="motion-filament" d="M53 62L60 76H68L75 62M60 76V88M68 76V88"/>',
    15:()=>[47,64,81].map((x,i)=>`<circle class="motion-node" cx="${x}" cy="61" r="4" style="animation-delay:${-i*.3}s"/>`).join(''),
    16:()=>'<path class="motion-lock" d="M53 65V53A11 11 0 0 1 75 53V65"/>',
    17:bars,18:bars,
    19:()=>[45,64,83].map((y,i)=>`<path class="motion-rung" d="M40 ${y}Q64 ${y+10} 88 ${y}" style="animation-delay:${-i*.6}s"/>`).join(''),
    20:()=>[42,60,78].map((y,i)=>`<rect class="motion-row" x="${34+i*8}" y="${y}" width="${58-i*8}" height="7" rx="3" style="animation-delay:${-i*.7}s"/>`).join('')
  };
  window.subjectIcon = s => `<svg class="realistic-icon subject-motion" viewBox="0 0 128 128" aria-hidden="true" focusable="false">${[1,3].includes(s.id)?'':`<image href="${s.icon}" x="6" y="6" width="116" height="116"/>`}<g class="subject-mechanism">${effects[s.id]?.()||''}</g></svg>`;
})();
