/* ==========================================================================
   reader.js — Leitor de PDF dentro do próprio site (usa PDF.js)
   --------------------------------------------------------------------------
   Como funciona: qualquer link que termine em .pdf abre numa camada
   (.reader) logo ABAIXO do header do site, com barra de título, zoom,
   contador de páginas, botão Baixar e botão Fechar. O visitante não sai
   da página e o menu continua visível.

   - Para NÃO usar o leitor em um link: adicione o atributo data-no-reader.
   - Para dar nome ao material na barra: adicione data-title="Nome".
     Sem data-title, o título vem da linha da biblioteca (.row), do
     aria-label, do texto do link ou do nome do arquivo.
   - O PDF.js só é baixado na primeira vez que alguém abre um PDF.

   SERVIDOR: o leitor completo (PDF.js) precisa de servidor (Live Server do
   VS Code, GitHub Pages etc.). Se o site for aberto com duplo clique
   (endereço começando com file://), o navegador bloqueia a leitura do PDF
   pelo PDF.js. Nesse caso o leitor usa o MODO SIMPLES: o PDF abre no
   visualizador do próprio navegador, dentro da mesma camada.

   DIAGNÓSTICO: se algum PDF não abrir, aperte F12 e olhe a aba Console.
   Toda falha é registrada lá com o prefixo [reader], e arquivo que não
   existe aparece na tela com o caminho que foi tentado.

   PLANO B: se o PDF.js falhar por outro motivo (CDN bloqueado, por
   exemplo), também cai no modo simples.

   Carregue DEPOIS do components.js (o components.js já faz isso sozinho).
   ========================================================================== */
(() => {
  const LIB = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 2.4;
  const LARGURA_MAX = 900; // largura da página em zoom 100%, em px
  const MARGEM = 32;       // padding lateral do .reader__pages (1rem de cada lado)

  let pdf = null;
  let zoom = 1;
  let token = 0;          // muda a cada novo desenho; cancela desenhos antigos
  let observador = null;
  let gatilho = null;     // link que abriu o leitor (o foco volta para ele)
  let rolagemAnterior = 0; // posição da página antes de abrir (volta ao fechar)
  let nativo = false;     // true = modo simples (iframe) em uso
  let promessaLib = null; // evita carregar o PDF.js duas vezes


  /* ---------- estrutura da camada ---------- */
  const leitor = document.createElement('div');
  leitor.className = 'reader';
  leitor.hidden = true;
  leitor.setAttribute('role', 'dialog');
  leitor.setAttribute('aria-modal', 'true');
  leitor.setAttribute('aria-label', 'Leitor de PDF');
  leitor.innerHTML = `
    <div class="reader__bar">
      <strong class="reader__title"></strong>
      <span class="reader__page" aria-live="polite"></span>
      <div class="reader__tools">
        <button class="reader__btn" data-a="menos" aria-label="Diminuir zoom">−</button>
        <button class="reader__btn" data-a="mais" aria-label="Aumentar zoom">+</button>
        <a class="reader__btn" data-a="baixar" download>Baixar</a>
        <button class="reader__btn reader__btn--x" data-a="fechar" aria-label="Fechar leitor">×</button>
      </div>
    </div>
    <div class="reader__body">
      <div class="reader__pages"></div>
      <div class="reader__native" hidden></div>
    </div>`;
  document.body.appendChild(leitor);

  const corpo = leitor.querySelector('.reader__body');
  const paginas = leitor.querySelector('.reader__pages');
  const caixaNativa = leitor.querySelector('.reader__native');
  const titulo = leitor.querySelector('.reader__title');
  const indicador = leitor.querySelector('.reader__page');
  const botaoBaixar = leitor.querySelector('[data-a="baixar"]');
  const botaoFechar = leitor.querySelector('[data-a="fechar"]');
  const botaoMais = leitor.querySelector('[data-a="mais"]');
  const botaoMenos = leitor.querySelector('[data-a="menos"]');


  /* ---------- título do material ----------
     Ordem: data-title → título da linha da biblioteca → aria-label →
     texto do link (se não for genérico, como "Baixar") → nome do arquivo */
  const GENERICO = /^(baixar|download|ver|abrir|clique aqui|acessar)$/i;

  const nomeDoArquivo = (href) => {
    try {
      const arquivo = decodeURIComponent(new URL(href, location.href).pathname.split('/').pop())
        .replace(/\.pdf$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      return arquivo ? arquivo.charAt(0).toUpperCase() + arquivo.slice(1) : 'Material';
    } catch (_) {
      return 'Material';
    }
  };

  const tituloDe = (link) => {
    const direto = link.dataset.title || link.closest('[data-title]')?.dataset.title;
    if (direto) return direto;

    const linha = link.closest('.row, .card, li, article');
    const daLinha = linha?.querySelector('b, h2, h3, strong')?.textContent.trim();
    if (daLinha) return daLinha;

    const aria = (link.getAttribute('aria-label') || '').trim();
    if (aria && !GENERICO.test(aria)) return aria;

    const texto = link.textContent.trim();
    if (texto && !GENERICO.test(texto)) return texto;

    return nomeDoArquivo(link.href);
  };


  /* ---------- posição da camada: logo abaixo do header ---------- */
  const ajustarTopo = () => {
    const menu = document.querySelector('.nav');
    const topo = menu ? Math.max(0, Math.round(menu.getBoundingClientRect().bottom)) : 0;
    leitor.style.setProperty('--reader-top', `${topo}px`);
  };


  /* ---------- carrega o PDF.js só quando precisa ---------- */
  const carregarLib = () => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
      return Promise.resolve();
    }
    if (promessaLib) return promessaLib;

    promessaLib = new Promise((ok, erro) => {
      const s = document.createElement('script');
      s.src = LIB;
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
        ok();
      };
      s.onerror = () => {
        s.remove();
        promessaLib = null; // permite tentar de novo na próxima vez
        erro(new Error('Não foi possível baixar o PDF.js (CDN bloqueado ou sem internet).'));
      };
      document.head.appendChild(s);
    });

    return promessaLib;
  };


  /* ---------- "Página X de Y" ---------- */
  const atualizarIndicador = () => {
    if (!pdf || nativo) return;

    const linha = corpo.getBoundingClientRect().top + corpo.clientHeight / 3;
    let atual = 1;

    for (const caixa of paginas.children) {
      if (!caixa.dataset.n) continue;
      if (caixa.getBoundingClientRect().top <= linha) atual = +caixa.dataset.n;
      else break;
    }

    indicador.textContent = `Página ${atual} de ${pdf.numPages}`;
  };

  let agendado = false;
  corpo.addEventListener('scroll', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      atualizarIndicador();
    });
  }, { passive: true });


  /* ---------- desenha uma página (só quando ela chega perto da tela) ---------- */
  async function renderizarPagina(caixa) {
    const { pagina, viewport } = caixa._dados;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // nítido sem pesar

    const tela = document.createElement('canvas');
    tela.width = Math.floor(viewport.width * dpr);
    tela.height = Math.floor(viewport.height * dpr);
    caixa.appendChild(tela);

    try {
      await pagina.render({
        canvasContext: tela.getContext('2d'),
        viewport,
        transform: dpr === 1 ? null : [dpr, 0, 0, dpr, 0, 0]
      }).promise;
    } catch (erro) {
      /* desenho cancelado (fechou o leitor ou mudou o zoom) é normal; o resto vai para o console */
      if (erro?.name !== 'RenderingCancelledException') {
        console.error('[reader] Erro ao desenhar a página:', erro);
      }
    }
  }


  /* ---------- monta todas as páginas (vazias) e desenha as visíveis ---------- */
  async function desenhar() {
    const meu = ++token;

    if (observador) observador.disconnect();
    paginas.innerHTML = '';

    const largura = Math.min(corpo.clientWidth - MARGEM, LARGURA_MAX) * zoom;

    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        renderizarPagina(e.target);
      });
    }, { root: corpo, rootMargin: '800px 0px' });
    observador = obs;

    for (let n = 1; n <= pdf.numPages; n++) {
      const pagina = await pdf.getPage(n);
      if (meu !== token) return; // fechou ou deu zoom no meio do caminho

      const base = pagina.getViewport({ scale: 1 });
      const viewport = pagina.getViewport({ scale: largura / base.width });

      const caixa = document.createElement('div');
      caixa.className = 'reader__pg';
      caixa.dataset.n = n;
      caixa.style.width = `${viewport.width}px`;
      caixa.style.height = `${viewport.height}px`;
      caixa._dados = { pagina, viewport };

      paginas.appendChild(caixa);
      obs.observe(caixa);
    }

    atualizarIndicador();
  }


  /* ---------- mensagens e modo simples ---------- */

  /* mensagem de erro na tela, com o caminho que foi tentado (ajuda no diagnóstico) */
  function mostrarErro(texto, caminho, href) {
    paginas.innerHTML = '';

    const p = document.createElement('p');
    p.className = 'reader__msg';

    const forte = document.createElement('strong');
    forte.textContent = texto;
    p.appendChild(forte);

    if (caminho) {
      const code = document.createElement('code');
      code.textContent = caminho;
      p.appendChild(code);
    }

    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Abrir em nova aba';
    p.appendChild(a);

    paginas.appendChild(p);
  }

  /* modo simples: mostra o PDF no visualizador nativo do navegador */
  function abrirNativo(href, nome, aviso) {
    nativo = true;
    pdf = null;

    paginas.hidden = true;
    paginas.innerHTML = '';
    caixaNativa.hidden = false;
    corpo.classList.add('reader__body--nativo');

    caixaNativa.innerHTML = '';
    const quadro = document.createElement('iframe');
    quadro.src = href;
    quadro.title = nome;
    caixaNativa.appendChild(quadro);

    botaoMais.disabled = true;
    botaoMenos.disabled = true;
    indicador.textContent = aviso || 'Visualizador do navegador';
  }

  /* volta o leitor ao modo normal (PDF.js) */
  function resetarModo() {
    nativo = false;
    paginas.hidden = false;
    caixaNativa.hidden = true;
    caixaNativa.innerHTML = '';
    corpo.classList.remove('reader__body--nativo');
    botaoMais.disabled = false;
    botaoMenos.disabled = false;
  }


  /* ---------- abrir e fechar ---------- */
  async function abrir(href, nome, origem) {
    gatilho = origem;
    rolagemAnterior = window.scrollY;
    zoom = 1;
    pdf = null;
    resetarModo();
    const meu = ++token;

    titulo.textContent = nome;
    botaoBaixar.href = href;
    indicador.textContent = '';
    paginas.innerHTML = '<p class="reader__msg">Carregando…</p>';

    /* volta ao topo para o header (faixa + menu) aparecer inteiro, e
       a camada começa logo abaixo dele */
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.style.overflow = 'hidden';
    document.body.classList.add('reader-open');
    leitor.hidden = false;
    ajustarTopo();
    botaoFechar.focus();

    /* 0) site aberto com duplo clique (file://): o PDF.js não consegue ler
          o PDF, então vai direto para o visualizador do navegador */
    if (location.protocol === 'file:') {
      console.warn(
        '[reader] O site está aberto direto do arquivo (file://). ' +
        'O PDF.js não consegue ler PDF assim; usando o modo simples. ' +
        'Para o leitor completo, abra o site pelo Live Server.'
      );
      abrirNativo(href, nome, 'Modo simples: abra pelo Live Server para o leitor completo');
      return;
    }

    /* 1) PDF.js */
    try {
      await carregarLib();
    } catch (erro) {
      console.error('[reader] Falha ao carregar o PDF.js:', LIB, erro);
      if (!leitor.hidden && meu === token) abrirNativo(href, nome);
      return;
    }

    /* 2) abre e desenha o documento */
    try {
      const documento = await window.pdfjsLib.getDocument({ url: href }).promise;
      if (leitor.hidden || meu !== token) return; // fechou enquanto carregava

      pdf = documento;
      await desenhar();
    } catch (erro) {
      console.error('[reader] Erro ao abrir o PDF:', href, erro);
      if (leitor.hidden || meu !== token) return;

      if (erro && erro.name === 'MissingPDFException') {
        /* servidor respondeu "não existe": o iframe não ajudaria, então mostra o caminho */
        const caminho = decodeURIComponent(new URL(href, location.href).pathname);
        mostrarErro('Não encontrei esse arquivo no site. Confira o nome na pasta:', caminho, href);
      } else {
        abrirNativo(href, nome);
      }
    }
  }

  function fechar() {
    token++;
    if (observador) observador.disconnect();

    pdf = null;
    leitor.hidden = true;
    paginas.innerHTML = '';
    resetarModo();

    document.body.style.overflow = '';
    document.body.classList.remove('reader-open');
    window.scrollTo({ top: rolagemAnterior, left: 0, behavior: 'instant' });

    if (gatilho) gatilho.focus({ preventScroll: true });
  }


  /* ---------- zoom ---------- */
  async function mudarZoom(passo) {
    if (!pdf || nativo) return;

    const novo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + passo));
    if (novo === zoom) return;

    zoom = novo;
    const posicao = corpo.scrollTop / (corpo.scrollHeight || 1);
    await desenhar();
    corpo.scrollTop = posicao * corpo.scrollHeight;
  }


  /* ---------- eventos ---------- */
  leitor.addEventListener('click', (ev) => {
    const acao = ev.target.closest('[data-a]')?.dataset.a;

    if (acao === 'fechar') fechar();
    if (acao === 'mais') mudarZoom(0.25);
    if (acao === 'menos') mudarZoom(-0.25);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && !leitor.hidden) fechar();
  });

  /* ao redimensionar: recalcula a posição da camada e, se a largura mudou
     (girar o celular, redimensionar), redesenha as páginas */
  let larguraAnterior = window.innerWidth;
  let espera;
  window.addEventListener('resize', () => {
    if (leitor.hidden) return;

    ajustarTopo();

    if (!pdf || nativo || window.innerWidth === larguraAnterior) return;

    larguraAnterior = window.innerWidth;
    clearTimeout(espera);
    espera = setTimeout(desenhar, 250);
  });

  /* intercepta qualquer link para .pdf da página */
  document.addEventListener('click', (ev) => {
    const link = ev.target.closest('a[href]');

    if (!link || link.closest('.reader') || link.hasAttribute('data-no-reader')) return;
    if (ev.defaultPrevented || ev.button !== 0) return;
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return; // deixa abrir em nova aba

    if (!/\.pdf($|[?#])/i.test(link.getAttribute('href'))) return;

    ev.preventDefault();
    abrir(link.href, tituloDe(link), link);
  });
})();