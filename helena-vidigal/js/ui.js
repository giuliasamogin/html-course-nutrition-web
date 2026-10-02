/* ==========================================================================
   ui.js — Comportamentos Gerais de Interface (UI)
   --------------------------------------------------------------------------
   Controla os recursos visuais compartilhados por várias páginas do site.
   Inclui: Barra de rolagem, efeitos no scroll, contadores e envios de formulário.
   ========================================================================== */

// Avisa o CSS que o JavaScript foi carregado com sucesso.
// Evita que elementos com animação de entrada fiquem invisíveis se o JS falhar.
document.documentElement.classList.add('js');



/* ==========================================================================
   TELA DE ABERTURA / PRELOADER (Apenas na Primeira Entrada no Site)
   ========================================================================== */
(function() {
  // Verifica se o navegador já registrou que a animação rodou nesta sessão
  const jaAssistiuAnimacao = sessionStorage.getItem('preloader-assistido');

  // Se o usuário já assistiu à animação nesta visita, interrompe o código e carrega o site direto
  if (jaAssistiuAnimacao === 'true') {
    return;
  }

  // Cria a tela de fundo creme
  const preloader = document.createElement('div');
  preloader.className = 'preloader-bg';

  // Cria o elemento de vídeo
  const video = document.createElement('video');
  video.src = 'midia/animação/abertura.mp4';
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.className = 'preloader-video';

  preloader.appendChild(video);
  document.body.prepend(preloader);

  // Função utilitária para encerrar a animação de forma limpa
  const encerrarAbertura = () => {
    // Registra na memória da sessão atual que o usuário já viu o vídeo
    sessionStorage.setItem('preloader-assistido', 'true');
    
    // Inicia a transição suave de fade-out do CSS
    preloader.classList.add('fade-out');
    
    // Remove completamente o elemento do HTML após o término da transição
    setTimeout(() => preloader.remove(), 600);
  };

  // 1. Aguarda o vídeo de 6 segundos rodar de ponta a ponta até o fim
  video.addEventListener('ended', encerrarAbertura);

  // 2. Backup de segurança: se o vídeo travar por qualquer falha de carregamento, libera o site
  setTimeout(() => {
    if (document.querySelector('.preloader-bg') && !preloader.classList.contains('fade-out')) {
      encerrarAbertura();
    }
  }, 6500);
})();

/* ==========================================================================
   1. BARRA DE PROGRESSO DE LEITURA
   --------------------------------------------------------------------------
   Cria dinamicamente uma barra no topo que cresce horizontalmente (scaleX)
   conforme o usuário rola a página para baixo.
   ========================================================================== */
const barraProgresso = document.createElement('div');
barraProgresso.className = 'progress';
document.body.prepend(barraProgresso);

window.addEventListener('scroll', () => {
  const raizHtml = document.documentElement;
  
  // Calcula o percentual de rolagem (recolhimento atual / área rolável total)
  const areaRolavelTotal = raizHtml.scrollHeight - raizHtml.clientHeight || 1;
  const percentualRolagem = raizHtml.scrollTop / areaRolavelTotal;
  
  barraProgresso.style.transform = `scaleX(${percentualRolagem})`;
}, { passive: true }); // 'passive: true' otimiza o desempenho da rolagem no celular


/* ==========================================================================
   2. REVELAÇÃO NO SCROLL (Animações de Entrada)
   --------------------------------------------------------------------------
   Utiliza a API IntersectionObserver para detectar quando um elemento aparece
   na tela, aplicando a classe de animação e disparando contadores.
   ========================================================================== */
const observadorScroll = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    // Ignora se o elemento ainda não estiver visível na tela
    if (!entrada.isIntersecting) return;
    
    // Ativa a animação de fade-in/subida via CSS
    entrada.target.classList.add('in');
    
    // Se o elemento possuir dados numéricos de contador, dispara a animação matemática
    if (entrada.target.dataset.count) {
      animarContador(entrada.target);
    }
    
    // Remove o observador para que a animação aconteça apenas uma vez por acesso
    observadorScroll.unobserve(entrada.target);
  });
}, { threshold: 0.25 }); // Dispara quando 25% do elemento estiver visível

// Aplica o observador em todas as seções animáveis e contadores cadastrados
document.querySelectorAll('.reveal, .steps, [data-count]').forEach(elemento => {
  observadorScroll.observe(elemento);
});


/* ==========================================================================
   3. CONTADOR ANIMADO
   --------------------------------------------------------------------------
   Faz números crescerem progressivamente de 0 até o valor estipulado no HTML,
   suportando casas decimais (ex: 9.8) com efeito suave de desaceleração.
   ========================================================================== */
function animarContador(elemento) {
  const valorFinal = parseFloat(elemento.dataset.count);
  
  // Identifica quantas casas decimais existem após o ponto (se houver)
  const casasDecimais = (elemento.dataset.count.split('.')[1] || '').length;
  const tempoInicial = performance.now();
  const duracaoAnimacao = 1400; // Tempo em milissegundos (1.4 segundos)

  // Função interna de atualização quadro a quadro (frame por frame)
  function atualizarQuadro(tempoAtual) {
    const progressoTempo = Math.min((tempoAtual - tempoInicial) / duracaoAnimacao, 1);
    
    // Aplicação da fórmula matemática de desaceleração (Ease-Out Cubic)
    const progressoSuave = 1 - Math.pow(1 - progressoTempo, 3);
    const valorAtual = valorFinal * progressoSuave;
    
    // Injeta o número formatado substituindo o ponto por vírgula padrão PT-BR
    elemento.textContent = valorAtual.toFixed(casasDecimais).replace('.', ',');
    
    // Se a animação não chegou ao fim, solicita o próximo frame ao navegador
    if (progressoTempo < 1) {
      requestAnimationFrame(atualizarQuadro);
    }
  }

  requestAnimationFrame(atualizarQuadro);
}


/* ==========================================================================
   4. FORMULÁRIOS SIMULADOS (.js-form)
   --------------------------------------------------------------------------
   Intercepta o envio de formulários (como captação de leads e contato) para
   exibir uma mensagem de sucesso na tela de forma amigável, sem dar recarga.
   ========================================================================== */
document.querySelectorAll('.js-form').forEach(formulario => {
  formulario.addEventListener('submit', evento => {
    evento.preventDefault(); // Impede a página de recarregar
    
    // Injeta o texto amigável de confirmação dentro do container do formulário
    formulario.innerHTML = '<p><strong>Pronto!</strong> Confira seu e-mail em instantes.</p>';
  });
});
