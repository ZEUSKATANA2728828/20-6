// app.js
// Arquivo JS global com funções comuns: particles, auth fake, nav helpers,
// termos obrigatórios, helpers de UI, e inicialização central.

(function(){
  // UTIL HELPERS
  function $(s){ return document.querySelector(s); }
  function $all(s){ return Array.from(document.querySelectorAll(s)); }
  function escapeHtml(s){ return String(s).replace(/[&<>"'`]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'})[c]); }
  function toast(s){ try{ alert(s); }catch(e){ console.log(s);} }

  // AUTH (fake local)
  const USERS_KEY = 'gv_users';
  const LOGGED_KEY = 'gv_logged_user';
  function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }catch(e){return []} }
  function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function registerUser(obj){
    const u = getUsers();
    if(u.some(x=> x.email === obj.email)) return { ok:false, error:'Email já cadastrado'};
    u.push(obj); saveUsers(u); return { ok:true };
  }
  function loginUser(email, pass){
    const u = getUsers().find(x=> x.email===email && x.senha===pass);
    if(!u) return { ok:false };
    localStorage.setItem(LOGGED_KEY, JSON.stringify(u));
    return { ok:true, user:u };
  }
  function currentUser(){ try{ return JSON.parse(localStorage.getItem(LOGGED_KEY) || 'null'); }catch(e){return null} }
  function logout(){ localStorage.removeItem(LOGGED_KEY); location.href='login.html'; }

  // PARTICLES (simple canvas background)
  function startParticles(canvasId, opts){
    try{
      const canvas = document.getElementById(canvasId);
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = innerWidth; canvas.height = innerHeight;
      const particles = [];
      const max = opts && opts.count || 60;
      for(let i=0;i<max;i++){
        particles.push({
          x: Math.random()*canvas.width,
          y: Math.random()*canvas.height,
          r: 1 + Math.random()*3,
          vy: 0.2 + Math.random()*1,
          alpha: 0.2 + Math.random()*0.7
        });
      }
      function loop(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p=>{
          p.y -= p.vy;
          if(p.y < -10) p.y = canvas.height + 10;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(0,200,255,'+p.alpha+')';
          ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fill();
        });
        requestAnimationFrame(loop);
      }
      loop();
      window.addEventListener('resize', ()=>{ canvas.width=innerWidth; canvas.height=innerHeight; });
    }catch(e){ console.warn('particles failed',e); }
  }

  // TERMS — show modal if not accepted
  const TERMS_KEY = 'gv_terms_accepted';
  function ensureTerms(){
    const accepted = localStorage.getItem(TERMS_KEY);
    if(accepted) return;
    const html = `
      <div id="termsModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999">
        <div style="background:#0b0f18;color:#fff;padding:18px;border-radius:12px;max-width:720px;width:92%">
          <h2>Termos de Uso (Obrigatório)</h2>
          <div style="height:220px;overflow:auto;background:#071023;border-radius:8px;padding:10px;margin:8px 0;border:1px solid rgba(255,255,255,0.03)">
            <!-- 20 linhas de termo exemplo -->
            <p>1. Bem-vindo ao GameVerse. Ao usar este site, você concorda com estes termos.</p>
            <p>2. Este site é uma simulação de jogos e funcionalidades — não há serviços pagos reais.</p>
            <p>3. O conteúdo e os dados ficam armazenados localmente no seu navegador.</p>
            <p>4. Não é permitido usar este sistema para atividades ilegais.</p>
            <p>5. Você é responsável pelo uso da sua conta e dados locais.</p>
            <p>6. Os desenvolvedores não oferecem garantia de disponibilidade.</p>
            <p>7. Conteúdos criados por usuários são de responsabilidade do autor.</p>
            <p>8. Não fornecemos suporte financeiro ou transações reais.</p>
            <p>9. Respeite outros usuários: sem ofensas, assédio ou discriminação.</p>
            <p>10. Informações sensíveis não devem ser enviadas ao site.</p>
            <p>11. Os recursos online são apenas demonstrativos e locais (fake multiplayer).</p>
            <p>12. Suas preferências são salvas no navegador e podem ser apagadas.</p>
            <p>13. Conteúdo protegido por direitos autorais não deve ser carregado sem permissão.</p>
            <p>14. O site pode conter links externos; não nos responsabilizamos por eles.</p>
            <p>15. Reservamo-nos o direito de atualizar estes termos a qualquer momento.</p>
            <p>16. Ao clicar em aceitar, você confirma que leu e concordou com os termos.</p>
            <p>17. Menores devem ter consentimento dos responsáveis para usar o site.</p>
            <p>18. Dados de jogo (moedas/skins) são fictícios e podem ser redefinidos.</p>
            <p>19. Não use o site para roubar, burlar ou trapacear em serviços de terceiros.</p>
            <p>20. Em caso de dúvidas, contate o administrador (simulação).</p>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button id="declineTerms" class="btn small ghost">Recusar</button>
            <button id="acceptTerms" class="btn small">Aceitar</button>
          </div>
        </div>
      </div>
    `;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    document.getElementById('acceptTerms').addEventListener('click', ()=>{
      localStorage.setItem(TERMS_KEY,'1'); document.getElementById('termsModal').remove();
    });
    document.getElementById('declineTerms').addEventListener('click', ()=>{
      alert('Você precisa aceitar os termos para usar o site.'); 
    });
  }

  // expose to window
  window.GV = {
    startParticles,
    ensureTerms,
    registerUser,
    loginUser,
    currentUser,
    logout,
    toast
  };

  // auto-run when loaded on pages that include this script
  document.addEventListener('DOMContentLoaded', ()=>{
    // start particles if canvas with id 'particles' exists
    if(document.getElementById('particles')) startParticles('particles',{count:60});
    // show terms modal if not accepted
    ensureTerms();
  });

})();
