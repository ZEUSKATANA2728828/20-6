/* lang.js */
/* Sistema de múltiplos idiomas para o site GameVerse */

(function(){

  const LANG_KEY = "gv_lang";

  // Dic de traduções
  const translations = {
    pt: {
      home: "Início",
      store: "Loja",
      settings: "Configurações",
      profile: "Perfil",
      logout: "Sair",
      welcome: "Bem-vindo ao GameVerse!"
    },
    en: {
      home: "Home",
      store: "Store",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout",
      welcome: "Welcome to GameVerse!"
    },
    es: {
      home: "Inicio",
      store: "Tienda",
      settings: "Configuraciones",
      profile: "Perfil",
      logout: "Cerrar sesión",
      welcome: "¡Bienvenido a GameVerse!"
    }
  };

  function getLang(){
    return localStorage.getItem(LANG_KEY) || "pt";
  }

  function setLang(lang){
    localStorage.setItem(LANG_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang){
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if(translations[lang] && translations[lang][key])
        el.innerText = translations[lang][key];
    });
  }

  // Iniciar no carregamento
  document.addEventListener("DOMContentLoaded", ()=>{
    applyLang(getLang());
  });

  // Expor globalmente
  window.GV_LANG = {
    setLang,
    getLang
  };

})();
