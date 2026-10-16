export function mergeLearning(base, local, remote) {
  const ids = key => [...new Set([...remote[key].filter(id => !base[key].includes(id) || local[key].includes(id)), ...local[key].filter(id => !base[key].includes(id))])].slice(0, 21);
  const recent = JSON.stringify(local.recent) === JSON.stringify(base.recent) ? remote.recent : local.recent.length === 0 && base.recent.length > 0 ? [] : [...local.recent, ...remote.recent].sort((a,b) => b.time-a.time).filter((r,i,all) => all.findIndex(x => x.type===r.type && x.id===r.id)===i).slice(0,8);
  return { favorites: ids('favorites'), pinned: ids('pinned'), recent };
}
