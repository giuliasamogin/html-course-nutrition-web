/* ==========================================================
   components.js — WEB COMPONENTS
   Header, footer, popup de contato e cookies são escritos UMA vez aqui.
   Nas páginas basta usar as tags <site-header>, <site-footer>,
   <contact-popup> e <cookie-bar>.
   Mudou o menu ou o telefone? Edite abaixo e todas as páginas atualizam.
   (Script comum, sem módulos: funciona abrindo o HTML com duplo clique.)

   ÍNDICE
   1. Dados do site
   2. Logo
   3. Header
   4. Footer
   5. Popup de contato
   6. Barra de cookies
   7. Registro dos componentes
   8. Favicon
   9. Leitor de PDF (carrega js/reader.js)
   ========================================================== */


/* ---------- 1. DADOS DO SITE — única fonte da verdade ---------- */
const SITE = {
  nome: 'Helena Vidigal',
  sub: 'Nutrição Comportamental',
  crn: 'CRN-3 12345',
  tel: '(11) 90000-0000',
  wa: '5511900000000',
  end: [
    'Torre Comercial Pátio Osasco Open Mall, Sala 2712, 27º andar',
    'Av. dos Autonomistas, 964, Vila Yara, Osasco, SP'
  ],
  horario: 'Seg a sex, 8h às 19h · Sáb, 8h às 12h',
  vagas: [5, 8], // [restantes, total] vagas para começar o Raio-X no mês
  turma: [5, 8]  // [restantes, total] lugares da Turma no ciclo
};

const PAGES = [
  ['index.html', 'Início'],
  ['programa.html', 'Programa'],
  ['sobre.html', 'Sobre'],
  ['quiz.html', 'Quiz'],
  ['biblioteca.html', 'Biblioteca'],
  ['receitas.html', 'Receitas'],
  ['blog.html', 'Blog'],
  ['contato.html', 'Contato']
];


/* ---------- 2. LOGO ---------- */

/* Arquivo do logo. O "%20" é o espaço que existe no nome do arquivo. */
const LOGO_SRC = 'midia/logo/logo-simples-png%20.png';

/* Logo provisório (círculo + folha de oliveira).
   Aparece só se o arquivo acima não carregar. */
const LOGO_TEMP = 'data:image/svg+xml,' +
  "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E" +
  "%3Ccircle cx='32' cy='32' r='29' fill='none' stroke='%236B7A4B' stroke-width='3'/%3E" +
  "%3Cpath d='M20 44c0-14 8-22 24-24-1 14-9 22-24 24z' fill='%236B7A4B'/%3E" +
  "%3Cpath d='M20 44l16-16' stroke='%23F6EFE3' stroke-width='2'/%3E" +
  '%3C/svg%3E';


/* ---------- 3. HEADER ----------
   Barra de vagas + menu + botão de contato.
   Marca a página atual via <body data-page="..."> */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const atual = document.body.dataset.page;

    const links = PAGES.map(([href, texto]) => {
      const marca = href === atual ? ' class="on" aria-current="page"' : '';
      return `<li><a href="${href}"${marca}>${texto}</a></li>`;
    }).join('');

    this.innerHTML = `
      <div class="strip">
        Nutricionista ${SITE.crn} ·
        Vagas deste mês: <strong>${SITE.vagas[0]} de ${SITE.vagas[1]}</strong> ·
        Osasco e online
      </div>

      <nav class="nav" aria-label="Principal">
        <div class="wrap">
          <a class="brand" href="index.html">
            <img class="logo" src="${LOGO_SRC}" alt=""
                 onerror="this.onerror=null;this.src=LOGO_TEMP">
            <span>${SITE.nome}<small>${SITE.sub}</small></span>
          </a>

          <ul id="menu">${links}</ul>

          <a class="btn nav-cta" href="raio-x.html">Fazer meu Raio-X</a>
          <button class="burger" type="button" aria-label="Abrir menu" aria-controls="menu" aria-expanded="false">☰</button>
        </div>
      </nav>`;

    // menu hambúrguer (celular)
    const burger = this.querySelector('.burger');
    const menu = this.querySelector('#menu');

    burger.onclick = () => {
      const aberto = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', aberto);
    };
  }
}

/* ---------- 4. FOOTER ----------
   Endereço, horário e newsletter (Carta da Helena) */
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="foot">
        <div class="wrap foot-grid">

          <div class="foot-brand">
            <h3>${SITE.nome}</h3>
            <p>${SITE.sub} em Osasco e online. Primeiro o diagnóstico de 14 dias, depois o plano.</p>
            <a class="foot-wa" href="raio-x.html">Fazer meu Raio-X</a>
          </div>

          <div class="foot-col">
            <h3>Consultório</h3>
            <p>${SITE.end.join('<br>')}</p>
            <p>${SITE.horario}</p>
            <a class="foot-wa" href="https://wa.me/${SITE.wa}">WhatsApp ${SITE.tel}</a>
          </div>

          <div class="foot-col">
            <h3>Carta da Helena</h3>
            <p>Um e-mail por semana, sem spam.</p>
            <form class="foot-form js-form">
              <input type="email" required placeholder="seu@email.com" aria-label="E-mail">
              <button class="foot-btn" type="submit">Assinar</button>
            </form>
          </div>

          <small class="foot-bottom">
            © ${new Date().getFullYear()} ${SITE.nome}.
            Projeto fictício para fins didáticos. Endereço ilustrativo.
          </small>

        </div>
      </footer>`;
  }
}


/* ---------- 5. POPUP DE CONTATO ----------
   Botão flutuante + <dialog> nativo (Esc fecha, foco tratado pelo navegador).
   Qualquer elemento com [data-open-contact] abre o popup. */
class ContactPopup extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button class="btn fab" data-open-contact>Fale comigo</button>

      <dialog id="contato" aria-labelledby="ct">
        <form method="dialog">
          <button class="x" aria-label="Fechar">×</button>
        </form>

        <h3 id="ct">Vamos conversar?</h3>
        <p>Conte seu objetivo e eu respondo em até 1 dia útil.</p>

        <form id="fc" novalidate>
          <label for="n">Nome</label>
          <input id="n" required minlength="3" placeholder=" ">

          <label for="t">WhatsApp</label>
          <input id="t" required inputmode="tel" placeholder="(11) 99999-9999">

          <label for="o">Como prefere atendimento?</label>
          <select id="o">
            <option>Online</option>
            <option>Presencial em Osasco</option>
          </select>

          <p class="err" id="e" role="alert"></p>
          <button class="btn">Enviar mensagem</button>
        </form>

        <p style="margin-top:1rem">
          <a href="https://wa.me/${SITE.wa}">Ou chame direto no WhatsApp →</a>
        </p>
      </dialog>`;

    const dialog = this.querySelector('dialog');
    const form = this.querySelector('#fc');
    const nome = form.querySelector('#n');
    const tel = form.querySelector('#t');
    const erro = form.querySelector('#e');

    // abre o popup ao clicar em qualquer [data-open-contact]
    document.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-open-contact]')) dialog.showModal();
    });

    // o botão "Fale comigo" se recolhe ao rolar para baixo (para não cobrir
    // o texto) e volta ao rolar para cima, no topo e no fim da página
    const fab = this.querySelector('.fab');
    let ultimoY = window.scrollY;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const descendo = y > ultimoY + 4;
      const subindo = y < ultimoY - 4;
      const noTopo = y < 240;
      const noFim = window.innerHeight + y > document.documentElement.scrollHeight - 320;

      if (noTopo || noFim || subindo) fab.classList.remove('fab--hide');
      else if (descendo) fab.classList.add('fab--hide');

      ultimoY = y;
    }, { passive: true });

    // clique fora da caixa fecha
    dialog.addEventListener('click', (ev) => {
      if (ev.target === dialog) dialog.close();
    });

    // máscara de telefone: (11) 99999-9999
    tel.addEventListener('input', () => {
      const digitos = tel.value.replace(/\D/g, '').slice(0, 11);
      tel.value = digitos
        .replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
        .replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    });

    // validação e envio
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      erro.textContent = '';

      if (nome.value.trim().length < 3) {
        erro.textContent = 'Digite seu nome completo.';
        return;
      }
      if (tel.value.replace(/\D/g, '').length < 10) {
        erro.textContent = 'Digite um WhatsApp com DDD.';
        return;
      }

      const nomeDigitado = nome.value.trim();
      form.innerHTML = '<h3></h3><p>Em breve eu te chamo no WhatsApp.</p>';
      form.querySelector('h3').textContent = `Recebido, ${nomeDigitado}!`;

      setTimeout(() => dialog.close(), 2200);
    });
  }
}


/* ---------- 6. COOKIES (LGPD) ----------
   Lembra a escolha no localStorage; try/catch evita erro se o navegador bloquear */
class CookieBar extends HTMLElement {
  connectedCallback() {
    try {
      if (localStorage.getItem('cookies-ok')) return;
    } catch (_) {}

    this.innerHTML = `
      <div class="cookie" role="region" aria-label="Cookies">
        Uso cookies para melhorar sua experiência.
        <a href="privacidade.html">Saiba mais</a><br>
        <button class="btn">Entendi</button>
      </div>`;

    this.querySelector('button').onclick = () => {
      try {
        localStorage.setItem('cookies-ok', 1);
      } catch (_) {}
      this.innerHTML = '';
    };
  }
}


/* ---------- 7. REGISTRO DOS COMPONENTES ---------- */
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
customElements.define('contact-popup', ContactPopup);
customElements.define('cookie-bar', CookieBar);


/* ---------- 8. FAVICON ----------
   Injeta o favicon (logo na aba do navegador) em todas as páginas */
(function () {
  // remove qualquer favicon antigo para evitar conflito
  document.querySelectorAll("link[rel*='icon']").forEach((f) => f.remove());

  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';

  // o './' força o navegador a procurar a partir da pasta raiz do projeto
  favicon.href = './midia/logo/sublogo-png.png';

  document.head.appendChild(favicon);
})();


/* ---------- 9. LEITOR DE PDF ----------
   Carrega js/reader.js em todas as páginas. Qualquer link .pdf passa a abrir
   dentro do site, numa camada com a identidade visual (veja reader.js). */
(function () {
  const leitor = document.createElement('script');
  leitor.src = 'js/reader.js';
  document.body.appendChild(leitor);
})();