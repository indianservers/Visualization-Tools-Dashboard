/* Subject diagrams: motion follows the process represented by each icon. */
(() => {
  const line = (d, extra = '') => `<path class="diagram-line ${extra}" d="${d}"/>`;
  const flow = (d, delay = 0) => `${line(d)}<path class="signal" d="${d}" pathLength="1" style="--delay:${delay}s"/>`;
  const node = (x, y, delay = 0, r = 4) => `<circle class="data-node" cx="${x}" cy="${y}" r="${r}" style="--delay:${delay}s"/>`;
  const label = text => `<text class="diagram-label" x="80" y="94" text-anchor="middle">${text}</text>`;
  function chart() {
    return line('M22 18V78H143', 'axis') + [28,47,66,85,104,123].map((x,i) => `<rect class="live-bar" x="${x}" y="${[47,32,42,21,36,14][i]}" width="12" height="${[31,46,36,57,42,64][i]}" rx="2" style="--delay:${-i*.53}s;--duration:${2.8+i*.31}s"/>`).join('') + flow('M27 53L47 43L66 47L86 31L105 36L130 22', -.8) + label('LIVE ANALYTICS');
  }
  function network(deep) {
    const layers = deep ? [[24,[23,48,73]],[60,[16,38,60,80]],[98,[23,48,73]],[136,[37,61]]] : [[28,[25,49,73]],[80,[18,40,62,82]],[132,[34,65]]];
    let out='';
    layers.slice(0,-1).forEach(([x,ys],i) => ys.forEach((y,j) => layers[i+1][1].forEach((ny,k) => {out += flow(`M${x} ${y}L${layers[i+1][0]} ${ny}`, -(i*.7+j*.29+k*.47));})));
    layers.forEach(([x,ys],i) => ys.forEach((y,j) => out += node(x,y,-i*.6-j*.3)));
    return out + label(deep?'DEEP NEURAL NETWORK':'INFERENCE STREAM');
  }
  function circuit() {
    let out='<rect class="chip-body" x="56" y="27" width="48" height="46" rx="8"/>' + line('M65 38H95V62H65Z') + '<text class="chip-label" x="80" y="53" text-anchor="middle">01</text>';
    [35,49,65].forEach((y,i)=>{out+=flow(`M12 ${y-9}H34V${y}H56`,-i*.7)+flow(`M104 ${y}H126V${y+9}H148`,-i*.7-1.2)+node(12,y-9,-i*.7,2)+node(148,y+9,-i*.7-1.2,2)});
    out+=flow('M70 8V27',-.4)+flow('M90 73V85',-1.1);
    return out + label('SIGNAL PROCESSING');
  }
  function atom() {
    return ['M130 49C130 65 30 65 30 49S130 33 130 49','M105 8C120 16 70 98 55 90S90 0 105 8','M55 8C70 0 120 82 105 90S40 16 55 8'].map((d,i)=>flow(d,-i*.8)).join('')+node(80,49,0,8)+label('QUANTUM ORBITALS');
  }
  function dna() {
    return flow('M58 9C115 26 45 38 58 50S115 73 58 86',0)+flow('M102 9C45 26 115 38 102 50S45 73 102 86',-1.3)+[16,27,38,50,61,72,82].map((y,i)=>line(`M${[70,62,66,79,91,95,85][i]} ${y}H${[90,98,94,81,69,65,75][i]}`,'dna-rung')+node([70,62,66,79,91,95,85][i],y,-i*.22,2)).join('')+label('GENETIC SEQUENCE');
  }
  function chemistry() {
    return line('M65 10H95M69 10V36L45 73Q41 83 53 83H107Q119 83 115 73L91 36V10')+'<path class="lab-liquid" d="M56 59H104L113 74Q116 80 107 80H53Q44 80 47 74Z"/>'+[[-12,-.3],[0,-1.4],[13,-2.3]].map(([x,t])=>`<circle class="lab-bubble" cx="${80+x}" cy="73" r="3" style="--delay:${t}s"/>`).join('')+line('M102 22H121M108 31H134','axis')+node(121,22,-.5,2)+label('REACTION ACTIVE');
  }
  function plot() {
    return line('M20 49H145M80 10V84','axis')+flow('M20 49C35 5 50 5 65 49S95 93 110 49S135 5 145 49',0)+'<path class="wave-trace" d="M20 49C35 5 50 5 65 49S95 93 110 49S135 5 145 49" pathLength="1"/>'+label('FUNCTION SPACE');
  }
  function graph(tree) {
    const edges=tree?['M80 15L44 43','M80 15L116 43','M44 43L24 74','M44 43L64 74','M116 43L96 74','M116 43L136 74']:['M27 51L64 21','M27 51L69 77','M64 21L107 30','M69 77L107 30','M107 30L137 66','M69 77L137 66'];
    const nodes=tree?[[80,15],[44,43],[116,43],[24,74],[64,74],[96,74],[136,74]]:[[27,51],[64,21],[69,77],[107,30],[137,66]];
    return edges.map((d,i)=>flow(d,-i*.45)).join('')+nodes.map(([x,y],i)=>node(x,y,-i*.45,5)).join('')+label(tree?'TREE TRAVERSAL':'PATH EXPLORATION');
  }
  function vision() {
    return line('M32 28V15H48M112 15H128V28M32 67V80H48M112 80H128V67')+'<rect class="vision-object" x="60" y="27" width="40" height="41" rx="6"/>'+line('M60 27L100 68M100 27L60 68','axis')+'<path class="scan-line" d="M37 18H123"/>'+[[60,27],[100,27],[60,68],[100,68]].map(([x,y],i)=>node(x,y,-i*.4,2)).join('')+label('OBJECT DETECTED');
  }
  function database() {
    return '<ellipse class="database-shell" cx="80" cy="22" rx="31" ry="10"/>'+line('M49 22V68C49 82 111 82 111 68V22M49 39C49 53 111 53 111 39M49 56C49 70 111 70 111 56')+flow('M10 41H35V31H49',0)+flow('M111 60H129V45H151',-1.2)+node(17,41,-.2,3)+node(145,45,-1.2,3)+label('QUERY PIPELINE');
  }
  function lock() {
    return line('M64 39V26C64 5 96 5 96 26V39')+'<rect class="chip-body" x="53" y="39" width="54" height="39" rx="7"/>'+node(80,54,0,4)+line('M80 58V67')+flow('M8 29H31V53H53',0)+flow('M107 53H129V29H152',-1.4)+label('ENCRYPTED CHANNEL');
  }
  function radar() {
    return '<circle class="diagram-line axis" cx="80" cy="46" r="34"/><circle class="diagram-line axis" cx="80" cy="46" r="20"/>'+line('M42 46H118M80 8V84','axis')+'<path class="radar-sweep" d="M80 46L80 12A34 34 0 0 1 114 46Z"/>'+node(94,25,-.4,3)+node(62,56,-1.6,3)+node(93,65,-2.4,3)+label('DISCOVERY SCAN');
  }
  window.subjectIcon = s => {
    const scenes={0:plot,1:atom,2:dna,3:chemistry,4:()=>network(true),5:()=>network(false),6:circuit,7:()=>network(false),8:()=>graph(false),9:()=>graph(true),10:vision,11:circuit,12:circuit,13:circuit,14:radar,15:()=>network(false),16:lock,17:chart,18:chart,19:database,20:circuit};
    return `<svg class="card-img science-icon" viewBox="0 0 160 100" aria-hidden="true" focusable="false" style="--phase:${-(s.id%7)*.31}s"><path class="diagram-grid" d="M20 20H140M20 40H140M20 60H140M20 80H140M40 10V85M60 10V85M80 10V85M100 10V85M120 10V85"/>${(scenes[s.id]||radar)()}</svg>`;
  };
})();
