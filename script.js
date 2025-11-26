/* script.js — sistema front-end completo
   - Autenticação (localStorage)
   - Perfil (xp, coins, items)
   - Loja, Lootbox
   - Multiplayer fake (20 bots)
   - Minigames (football, fps, race, boss)
   - Helpers simples
*/

/* ---------- UTIL ---------- */
function _rand(a,b){ return Math.floor(a + Math.random()*(b-a+1)); }
function _usersKey(){ return 'gx_users_v2'; }
function _profileKey(u){ return 'gx_profile_' + u; }

/* ---------- AUTH (registro/login) ---------- */
function doRegister(){
  const u = document.getElementById('regUser')?.value?.trim();
  const p = document.getElementById('regPass')?.value || '';
  if(!u || !p) return alert('Preencha usuário e senha');
  const users = JSON.parse(localStorage.getItem(_usersKey()) || '{}');
  if(users[u]) return alert('Usuário já existe');
  const salt = Math.random().toString(36).slice(2,9);
  users[u] = { salt: salt, hash: btoa(p + salt) };
  localStorage.setItem(_usersKey(), JSON.stringify(users));
  // create profile
  const profile = { xp:0, level:1, coins:300, gems:2, items:[], titles:[], achievements:[], bp:0, skillPoints:0, gallery:[] };
  localStorage.setItem(_profileKey(u), JSON.stringify(profile));
  localStorage.setItem('gx_logged', u);
  alert('Conta criada! Bem-vindo, ' + u);
  window.location = 'main.html';
}
function doLogin(){
  const u = document.getElementById('loginUser')?.value?.trim();
  const p = document.getElementById('loginPass')?.value || '';
  const users = JSON.parse(localStorage.getItem(_usersKey()) || '{}');
  if(!users[u]) return alert('Usuário não encontrado');
  const rec = users[u];
  if(btoa(p + rec.salt) === rec.hash){ localStorage.setItem('gx_logged', u); // stat
    const stats = JSON.parse(localStorage.getItem('gx_stats')||'{"logins":0}'); stats.logins = (stats.logins||0)+1; localStorage.setItem('gx_stats', JSON.stringify(stats));
    window.location = 'main.html';
  } else alert('Senha incorreta');
}
function logout(){ localStorage.removeItem('gx_logged'); window.location='index.html'; }

/* ---------- PROFILE HELPERS ---------- */
function getProfile(){
  const u = localStorage.getItem('gx_logged');
  if(!u) return null;
  return JSON.parse(localStorage.getItem(_profileKey(u)) || 'null');
}
function saveProfile(p){
  const u = localStorage.getItem('gx_logged'); if(!u) return;
  localStorage.setItem(_profileKey(u), JSON.stringify(p));
}
function addCoins(n){ const p = getProfile(); if(!p) return; p.coins = (p.coins||0) + n; saveProfile(p); }
function addXP(n){ const p = getProfile(); if(!p) return; p.xp = (p.xp||0) + n; while(p.xp >= p.level * 200){ p.xp -= p.level * 200; p.level++; p.coins += 50; p.skillPoints = (p.skillPoints||0) + 1; } saveProfile(p); }

/* ---------- SHOP & LOOT ---------- */
function buyItem(id, price){
  const p = getProfile(); if(!p) return alert('Faça login');
  if(p.coins < price) return alert('Moedas insuficientes');
  p.coins -= price; p.items = p.items||[]; if(!p.items.includes(id)) p.items.push(id);
  saveProfile(p); alert('Compra realizada: ' + id);
}
function openLootbox(){
  const p = getProfile(); if(!p) return alert('Faça login');
  const r = Math.random(); let res='';
  if(r < 0.5){ const c = _rand(10,80); addCoins(c); res = `${c} coins`; }
  else if(r < 0.85){ const x = _rand(10,60); addXP(x); res = `${x} XP`; }
  else if(r < 0.98){ const s = 'skin_loot_' + _rand(1,6); p.items = p.items||[]; if(!p.items.includes(s)) p.items.push(s); saveProfile(p); res = 'Skin: ' + s; }
  else { p.gems = (p.gems||0)+1; saveProfile(p); res = '1 gem'; }
  const el = document.getElementById('lootResult'); if(el) el.innerText = 'Você ganhou: ' + res;
}

/* ---------- MULTIPLAYER FAKE (C: 20 bots) ---------- */
function initFakeMultiplayer(opts){
  const bots = opts.bots || 20;
  const arenaId = opts.arenaId || 'mpArena';
  const rankingId = opts.rankingId || 'mpRanking';
  const onlineId = opts.onlineId || 'mpOnline';
  const profileId = opts.profileId || 'mpProfile';
  const ARENA = document.getElementById(arenaId);
  if(!ARENA) return;
  ARENA.innerHTML = ''; ARENA.style.position='relative';
  const W = ARENA.clientWidth || 900, H = ARENA.clientHeight || 420;
  ARENA.style.width = W + 'px'; ARENA.style.height = H + 'px';
  const players = [];
  // player
  const name = localStorage.getItem('gx_logged') || 'Você';
  const me = { id:'me', name, x:W/2, y:H/2, size:30, color:'#2ecc71', elem:null, speed:4 };
  function makeElem(p){
    const e = document.createElement('div'); e.className='mp-player'; e.style.width = p.size+'px'; e.style.height = p.size+'px';
    e.style.background = p.color; e.style.left = (p.x - p.size/2) + 'px'; e.style.top = (p.y - p.size/2) + 'px';
    const nm = document.createElement('div'); nm.className='mp-name'; nm.innerText = p.name; e.appendChild(nm);
    ARENA.appendChild(e); p.elem = e;
  }
  const NAMES = ["Aurora","Vega","Nova","Sirius","Orion","Lyra","Altair","Zeta","Kappa","Delta","Beta","Gamma","Eclipse","Comet","Stellar","Nebula","Quark","Flux","Pixel","Rex"];
  for(let i=0;i<bots;i++){
    const b = { id:'bot'+i, name: NAMES[i%NAMES.length]+_rand(1,999), x:_rand(40,W-40), y:_rand(40,H-40), size:22, color:`hsl(${_rand(0,360)},70%,55%)`, vx:(Math.random()*2-1), vy:(Math.random()*2-1), speed: 0.6+Math.random()*1.6, elem:null };
    makeElem(b); players.push(b); b.elem.style.transform='scale(0)'; setTimeout(()=> b.elem.style.transform='scale(1)', 120 + i*40);
  }
  makeElem(me); players.push(me);
  function updateOnline(){ const n = Math.max(8, 8 + Math.floor(Math.random()*35)); document.getElementById(onlineId).innerText = 'Jogadores online: ' + n; }
  updateOnline(); setInterval(updateOnline, 4000);
  function buildRanking(){ const arr=[]; for(let i=0;i<6;i++) arr.push({ user:NAMES[_rand(0,NAMES.length-1)]+_rand(1,999), score:_rand(300,2200) }); arr.splice(2,0,{ user:me.name, score:_rand(150,1700) }); arr.sort((a,b)=>b.score-a.score); const ol = document.getElementById(rankingId); ol.innerHTML=''; arr.forEach(it=>{ const li = document.createElement('li'); li.innerText = `${it.user} — ${it.score}`; ol.appendChild(li); }); }
  buildRanking(); setInterval(buildRanking,8000);
  function refreshProfile(){ const p = getProfile() || { xp:0, level:1, coins:0 }; document.getElementById(profileId).innerText = `Nível ${p.level} • XP ${p.xp} • Coins ${p.coins}`; }
  refreshProfile();
  function step(){
    players.forEach(pl=>{
      if(pl.id.startsWith('bot')){
        if(Math.random() < 0.03){ pl.vx = (Math.random()*2-1)*pl.speed; pl.vy = (Math.random()*2-1)*pl.speed; }
        pl.x += pl.vx; pl.y += pl.vy;
        if(pl.x < 12) pl.vx = Math.abs(pl.vx);
        if(pl.x > W-12) pl.vx = -Math.abs(pl.vx);
        if(pl.y < 12) pl.vy = Math.abs(pl.vy);
        if(pl.y > H-12) pl.vy = -Math.abs(pl.vy);
        pl.elem.style.left = (pl.x - pl.size/2) + 'px';
        pl.elem.style.top = (pl.y - pl.size/2) + 'px';
      }
    });
    me.elem.style.left = (me.x - me.size/2) + 'px'; me.elem.style.top = (me.y - me.size/2) + 'px';
    requestAnimationFrame(step);
  }
  step();
  const keys = {}; window.addEventListener('keydown', e=> keys[e.key.toLowerCase()] = true); window.addEventListener('keyup', e=> keys[e.key.toLowerCase()] = false);
  function playerLoop(){ let dx=0, dy=0; if(keys['arrowleft']||keys['a']) dx -= me.speed; if(keys['arrowright']||keys['d']) dx += me.speed; if(keys['arrowup']||keys['w']) dy -= me.speed; if(keys['arrowdown']||keys['s']) dy += me.speed; me.x = Math.max(12, Math.min(W-12, me.x + dx)); me.y = Math.max(12, Math.min(H-12, me.y + dy)); setTimeout(playerLoop,16); }
  playerLoop();
  ARENA.addEventListener('click', ev=>{
    const rect = ARENA.getBoundingClientRect(); const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
    const pulse = document.createElement('div'); pulse.style.position='absolute'; pulse.style.left=mx+'px'; pulse.style.top=my+'px'; pulse.style.width='8px'; pulse.style.height='8px'; pulse.style.borderRadius='50%'; pulse.style.background='rgba(255,255,255,0.7)'; pulse.style.transform='translate(-50%,-50%)';
    ARENA.appendChild(pulse); setTimeout(()=> { pulse.style.transition='all 700ms ease'; pulse.style.transform='translate(-50%,-50%) scale(18)'; pulse.style.opacity='0'; },10); setTimeout(()=> pulse.remove(),800);
  });
  setInterval(()=>{ addCoins(1); addXP(1); refreshProfile(); }, 9000);
}

/* ---------- MINIGAMES helpers (central) ---------- */
function startFootball(){ if(typeof window.startFootballInline === 'function'){ window.startFootballInline(); return; } alert('Abra football.html e clique em Iniciar'); }
function startFPS(){ if(typeof window.startFPSInline === 'function'){ window.startFPSInline(); return; } alert('Abra fps.html e clique em Iniciar'); }

/* ---------- AUTO INIT ---------- */
document.addEventListener('DOMContentLoaded', ()=> {
  if(!localStorage.getItem('gx_logged')) localStorage.setItem('gx_logged','Visitante');
});
