/* ==========================================================
   boneca.js — Helena chibi: o botão flutuante do site.
   Ela É o botão de contato: clicar nela abre o popup "Vamos conversar?"
   (o <dialog> criado pelo components.js). Não existe mais o botão
   "Fale comigo".

   O components.js carrega este arquivo sozinho em todas as páginas.
   NÃO precisa de imagem, NÃO precisa mexer em CSS nem em HTML.

   Como ela se mexe: pelo próprio JavaScript (element.animate).
   Por isso a regra "prefers-reduced-motion" do main.css, que
   desliga animações de CSS, não consegue parar a boneca.
   ========================================================== */
(() => {

  if (window.__bonecaOk) return;   // evita duplicar se o arquivo for incluído 2 vezes
  window.__bonecaOk = true;

  /* ---------- CONFIGURAÇÃO (só mexa aqui) ---------- */
  const CONFIG = {
    // frases do balãozinho: passam uma de cada vez, em rodízio
    frases: [
      "Oi! Vamos conversar?",
      "Por que suas dietas não duram?",
      "Dúvida sobre o Raio-X? Me pergunta!",
      "Conta seu objetivo, sem compromisso.",
      "Respondo em até 1 dia útil.",
      "Dúvida sobre os planos? Clica em mim!"
    ],
    corBalao: "#6B7A4B",             // cor do balão (verde oliva, a mesma das falas da Helena no chat)
    corTexto: "#FFFBF4",             // cor do texto do balão (creme claro)
    cicloMs: 4500,                   // tempo entre um pulinho/aceno e o próximo
    primeiraFraseMs: 1500,           // quanto espera até a primeira frase aparecer
    fraseDuracaoMs: 5000,            // quanto tempo cada frase fica na tela
    fraseIntervaloMs: 4000,          // pausa (sem balão) entre uma frase e a próxima
    // false = ela se mexe SEMPRE (bom para apresentar em aula).
    // true  = respeita quem desligou animações no computador (mais correto no site real).
    respeitarMovimentoReduzido: false
  };

  /* ---------- O DESENHO (SVG) ---------- */
  const DESENHO = `
  <svg viewBox="0 0 200 228" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">

    <!-- cabelo de trás -->
    <path d="M30 92 C26 18 174 18 170 92 C178 132 172 172 166 196 L34 196 C28 172 22 132 30 92 Z" fill="#4a2a1e"/>

    <!-- braço parado (esquerdo) + mãozinha -->
    <path d="M58 160 C46 172 44 196 46 208 L63 208 C63 192 65 174 69 160 Z" fill="#fffdf8" stroke="#e3d9c6" stroke-width="1.5"/>
    <circle cx="54.5" cy="212" r="6.5" fill="#f6cfae" stroke="#e8b794" stroke-width=".8"/>

    <!-- jaleco -->
    <path d="M52 218 L57 160 C59 149 77 145 100 145 C123 145 141 149 143 160 L148 218 Q100 226 52 218 Z" fill="#fffdf8" stroke="#e3d9c6" stroke-width="1.5"/>
    <!-- blusa oliva -->
    <path d="M85 146 L100 180 L115 146 Z" fill="#6B7A4B"/>
    <!-- pescoço -->
    <path d="M91 138 H109 V150 Q100 160 91 150 Z" fill="#f6cfae"/>
    <!-- lapelas -->
    <path d="M85 147 L98 190 L74 172 L71 156 Z" fill="#f5f0e6" stroke="#ddd2bd" stroke-width="1.2"/>
    <path d="M115 147 L102 190 L126 172 L129 156 Z" fill="#f5f0e6" stroke="#ddd2bd" stroke-width="1.2"/>
    <!-- botão -->
    <circle cx="100" cy="204" r="2.2" fill="#e3d9c6"/>
    <!-- logozinho bordado -->
    <circle cx="124" cy="194" r="5.5" fill="none" stroke="#6B7A4B" stroke-width="1.4"/>
    <path d="M121 196 Q122 188 129 189 Q128 195 121 196 Z" fill="#6B7A4B"/>
    <circle cx="127" cy="190.5" r="1.1" fill="#C4674A"/>

    <!-- CABEÇÃO -->
    <ellipse cx="100" cy="90" rx="60" ry="54" fill="#f6cfae"/>

    <!-- franja repartida no meio + mechas laterais -->
    <path d="M40 94 C32 6 168 6 160 94 C152 68 130 54 100 52 C70 54 48 68 40 94 Z" fill="#4a2a1e"/>
    <path d="M100 34 C66 36 44 64 41 102 C54 78 74 64 100 60 Z" fill="#5a3426"/>
    <path d="M100 34 C134 36 156 64 159 102 C146 78 126 64 100 60 Z" fill="#5a3426"/>
    <path d="M41 90 C34 120 40 150 34 172 C54 160 62 128 58 98 Z" fill="#4a2a1e"/>
    <path d="M159 90 C166 120 160 150 166 172 C146 160 138 128 142 98 Z" fill="#4a2a1e"/>

    <!-- brincos de argola -->
    <circle cx="45" cy="118" r="5.5" fill="none" stroke="#d9a441" stroke-width="2"/>
    <circle cx="155" cy="118" r="5.5" fill="none" stroke="#d9a441" stroke-width="2"/>

    <!-- sobrancelhas -->
    <path d="M65 78 Q77 71 90 76" stroke="#3a2118" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M110 76 Q123 71 135 78" stroke="#3a2118" stroke-width="3.2" fill="none" stroke-linecap="round"/>

    <!-- olhos grandes (piscam) -->
    <g class="hb-olho">
      <ellipse cx="78" cy="98" rx="11" ry="12.5" fill="#fff"/>
      <ellipse cx="78" cy="99" rx="9" ry="11" fill="#6a3d26"/>
      <ellipse cx="78" cy="100" rx="5" ry="6.5" fill="#1e0f09"/>
      <circle cx="82" cy="94" r="3.4" fill="#fff"/>
      <circle cx="74" cy="104" r="1.7" fill="#fff"/>
    </g>
    <g class="hb-olho">
      <ellipse cx="122" cy="98" rx="11" ry="12.5" fill="#fff"/>
      <ellipse cx="122" cy="99" rx="9" ry="11" fill="#6a3d26"/>
      <ellipse cx="122" cy="100" rx="5" ry="6.5" fill="#1e0f09"/>
      <circle cx="126" cy="94" r="3.4" fill="#fff"/>
      <circle cx="118" cy="104" r="1.7" fill="#fff"/>
    </g>
    <!-- cílios -->
    <path d="M66 94 Q78 83 90 94" stroke="#2b1710" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M66 94 L62 90" stroke="#2b1710" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M110 94 Q122 83 134 94" stroke="#2b1710" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M134 94 L138 90" stroke="#2b1710" stroke-width="2.2" stroke-linecap="round"/>

    <!-- bochechas, sardinhas, nariz, boquinha -->
    <ellipse cx="63" cy="116" rx="9" ry="5.5" fill="#f08a7a" opacity=".45"/>
    <ellipse cx="137" cy="116" rx="9" ry="5.5" fill="#f08a7a" opacity=".45"/>
    <g fill="#c68a68">
      <circle cx="70" cy="113" r="1"/><circle cx="76" cy="116" r="1"/><circle cx="82" cy="114" r="1"/>
      <circle cx="118" cy="114" r="1"/><circle cx="124" cy="116" r="1"/><circle cx="130" cy="113" r="1"/>
    </g>
    <path d="M97 112 Q100 115 103 112" stroke="#d79a7c" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M91 121 Q100 130 109 121" stroke="#b85a48" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M95 123 Q100 127 105 123" stroke="#e9887a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>

    <!-- braço que acena (direito): por cima de tudo -->
    <g class="hb-braco">
      <path d="M137 164 L137 128 C137 119 155 119 155 128 L155 164 Z" fill="#fffdf8" stroke="#e3d9c6" stroke-width="1.5"/>
      <circle cx="146" cy="116" r="10" fill="#f6cfae" stroke="#e8b794" stroke-width=".8"/>
      <ellipse cx="136" cy="118" rx="3.6" ry="5.5" transform="rotate(-25 136 118)" fill="#f6cfae" stroke="#e8b794" stroke-width=".8"/>
      <ellipse cx="141" cy="106" rx="3" ry="6" fill="#f6cfae" stroke="#e8b794" stroke-width=".8"/>
      <ellipse cx="147" cy="104" rx="3" ry="6.5" fill="#f6cfae" stroke="#e8b794" stroke-width=".8"/>
      <ellipse cx="153" cy="106" rx="3" ry="6" fill="#f6cfae" stroke="#e8b794" stroke-width=".8"/>
      <circle cx="146" cy="116" r="8" fill="#f6cfae"/>
    </g>
  </svg>`;

  /* ---------- OS ESTILOS (só posição e aparência; o movimento é feito pelo JS) ---------- */
  const css = `
    /* a boneca é um <button> fixo no canto da tela */
    .fab-boneca {
      --w: clamp(104px, 17svh, 150px);          /* largura da boneca: mude aqui para aumentar/diminuir */
      position: fixed;
      right: max(1rem, env(safe-area-inset-right));
      bottom: max(0.5rem, env(safe-area-inset-bottom));
      z-index: 60;
      width: var(--w);
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      color: inherit;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      -webkit-tap-highlight-color: transparent;
      transform-origin: 50% 100%;
      transition: transform 0.25s ease;
    }
    .fab-boneca:hover { transform: scale(1.06); }
    .fab-boneca:active { transform: scale(0.98); }
    .fab-boneca:focus-visible {
      outline: 3px solid var(--terra, #C4674A);
      outline-offset: 4px;
      border-radius: 18px;
    }

    /* na home, a faixa amarela fica colada no pé da primeira tela:
       a boneca sobe para ficar em cima dela */
    body[data-page="index.html"] .fab-boneca {
      bottom: calc(var(--h-marquee, 2.6rem) + 0.5rem);
    }

    /* o leitor de PDF ocupa a tela: a boneca sai da frente */
    body.reader-open .fab-boneca { display: none; }

    .hb-corpo { display: block; pointer-events: none; }
    .hb-corpo svg { display: block; width: 100%; height: auto; overflow: visible; }

    .fab-balao {
      position: absolute;
      right: calc(var(--w, 130px) * 0.86);
      bottom: calc(var(--w, 130px) * 0.72);
      width: max-content;
      max-width: min(230px, 56vw);
      padding: 0.55rem 0.9rem;
      border-radius: 16px 16px 4px 16px;
      background: ${CONFIG.corBalao};
      color: ${CONFIG.corTexto};
      font: 700 0.95rem/1.25 var(--serif, Georgia, serif);
      text-align: left;
      pointer-events: none;
      opacity: 0;                                /* o JS faz ele aparecer */
      /* sombra em duas camadas (ampla + de contato). Usa filter em vez de
         box-shadow para a sombra também contornar o rabinho do balão. */
      filter: drop-shadow(0 8px 12px rgba(46, 42, 36, 0.38))
              drop-shadow(0 2px 3px rgba(46, 42, 36, 0.28));
    }
    .fab-balao::after {                          /* rabinho do balão, apontando para ela */
      content: "";
      position: absolute;
      right: -7px;
      bottom: 0;
      width: 14px;
      height: 14px;
      background: inherit;
      clip-path: polygon(0 0, 100% 100%, 0 100%);
    }

    @media (max-width: 820px) {
      /* no celular a faixa amarela rola junto com a página */
      body[data-page="index.html"] .fab-boneca {
        bottom: max(0.5rem, env(safe-area-inset-bottom));
      }
    }

    @media (max-width: 560px) {
      .fab-boneca { --w: 92px; }
      .fab-balao { font-size: 0.8rem; padding: 0.4rem 0.7rem; }
    }
  `;
  const estilo = document.createElement("style");
  estilo.textContent = css;
  document.head.appendChild(estilo);

  /* ---------- OS MOVIMENTOS (element.animate) ---------- */
  function animarCorpo(corpo) {
    const c = CONFIG.cicloMs;

    // 1) pulinhos: dois pulos e descansa
    corpo.animate([
      { transform: "translateY(0)",     offset: 0 },
      { transform: "translateY(-16px)", offset: 0.06 },
      { transform: "translateY(0)",     offset: 0.12 },
      { transform: "translateY(-9px)",  offset: 0.18 },
      { transform: "translateY(0)",     offset: 0.24 },
      { transform: "translateY(0)",     offset: 1 }
    ], { duration: c, iterations: Infinity, easing: "ease-in-out" });

    // 2) braço acenando (gira em volta do ombro) — 3 abanadas, junto com os pulos
    const braco = corpo.querySelector(".hb-braco");
    braco.style.transformBox = "view-box";
    braco.style.transformOrigin = "146px 162px";
    braco.animate([
      { transform: "rotate(34deg)", offset: 0 },
      { transform: "rotate(64deg)", offset: 0.05 },
      { transform: "rotate(22deg)", offset: 0.10 },
      { transform: "rotate(64deg)", offset: 0.15 },
      { transform: "rotate(22deg)", offset: 0.20 },
      { transform: "rotate(64deg)", offset: 0.25 },
      { transform: "rotate(34deg)", offset: 0.32 },
      { transform: "rotate(34deg)", offset: 1 }
    ], { duration: c, iterations: Infinity, easing: "ease-in-out" });

    // 3) piscadinha
    corpo.querySelectorAll(".hb-olho").forEach(olho => {
      olho.style.transformBox = "fill-box";
      olho.style.transformOrigin = "50% 55%";
      olho.animate([
        { transform: "scaleY(1)",   offset: 0 },
        { transform: "scaleY(1)",   offset: 0.92 },
        { transform: "scaleY(0.1)", offset: 0.95 },
        { transform: "scaleY(1)",   offset: 0.98 },
        { transform: "scaleY(1)",   offset: 1 }
      ], { duration: 4000, iterations: Infinity });
    });
  }

  /* ---------- O BALÃO: uma frase de cada vez, em rodízio ---------- */
  function rodizioDeFrases(balao, animado) {
    const frases = CONFIG.frases;
    let i = 0;

    function proxima() {
      balao.textContent = frases[i % frases.length];
      i++;

      if (animado) {
        // aparece, fica um pouco e some; ao terminar, espera e chama a próxima
        const anim = balao.animate([
          { opacity: 0, transform: "translateY(8px) scale(.85)",  offset: 0 },
          { opacity: 1, transform: "translateY(0) scale(1)",      offset: 0.08 },
          { opacity: 1, transform: "translateY(0) scale(1)",      offset: 0.88 },
          { opacity: 0, transform: "translateY(-4px) scale(.95)", offset: 1 }
        ], { duration: CONFIG.fraseDuracaoMs, easing: "ease-out" });
        anim.onfinish = () => setTimeout(proxima, CONFIG.fraseIntervaloMs);
      } else {
        // sem movimento: o balão fica fixo e só troca o texto
        balao.style.opacity = 1;
        setTimeout(proxima, CONFIG.fraseDuracaoMs + CONFIG.fraseIntervaloMs);
      }
    }

    setTimeout(proxima, CONFIG.primeiraFraseMs);
  }

  /* ---------- A MONTAGEM ---------- */
  function montar() {
    if (document.querySelector(".fab-boneca")) return;

    // o [data-open-contact] faz o components.js abrir o popup ao clicar
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "fab-boneca";
    botao.setAttribute("data-open-contact", "");
    botao.setAttribute("aria-label", "Falar com a Helena: abrir o formulário de contato");

    const corpo = document.createElement("span");
    corpo.className = "hb-corpo";
    corpo.setAttribute("aria-hidden", "true");
    corpo.innerHTML = DESENHO;

    const balao = document.createElement("span");
    balao.className = "fab-balao";
    balao.setAttribute("aria-hidden", "true");

    botao.appendChild(corpo);
    botao.appendChild(balao);
    document.body.appendChild(botao);

    const semMovimento = CONFIG.respeitarMovimentoReduzido &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!semMovimento) animarCorpo(corpo);
    rodizioDeFrases(balao, !semMovimento);
  }

  if (document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();