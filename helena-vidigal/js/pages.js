/* ==========================================================================
   pages.js — Comportamentos das Páginas Internas
   --------------------------------------------------------------------------
   Este script deve ser carregado obrigatorquialmente após o 'components.js'.
   Ele controla os recursos dinâmicos da página de Programa e de Turmas.
   
   Índice:
   1. Seletor de Cenários (programa.html)
   2. Sistema de Vagas Dinâmicas (turma.html)
   ========================================================================== */

/* ==========================================================================
   1. SELETOR DE CENÁRIO
   --------------------------------------------------------------------------
   Mapeia as ações dos botões na página do programa de 90 dias. Cada clique
   altera o título e a descrição exibida no card do "Cardápio por Cenário".
   ========================================================================== */

// Banco de dados interno dos cenários alimentares [Título, Texto Descritivo]
const CENARIOS = {
  corrido: [
    'Dia corrido', 
    'Café em 5 minutos: pão integral, ovo mexido e fruta. Almoço: marmita montada no domingo (base, proteína e legumes). Lanche: iogurte com castanhas. Jantar: omelete com salada ou sopa.'
  ],
  social: [
    'Fim de semana social', 
    'Antes: uma refeição leve, sem pular nenhuma. Na festa: monte o prato com o que mais gosta, sem culpa. Depois: volte à rotina na refeição seguinte, sem compensar.'
  ],
  tpm: [
    'TPM', 
    'Mais apetite nessa fase é esperado. Mantenha refeições regulares, inclua carboidratos integrais e frutas, e reserve espaço para o doce que você quer, sem drama.'
  ],
  viagem: [
    'Viagem', 
    'Aeroporto: kit de lanches portáteis. Destino: uma refeição de comida local por dia, sem restrição. Mantenha horários aproximados e beba água ao longo do dia.'
  ]
};

// Captura a div onde o texto do cenário deve ser impresso na tela
const containerSaida = document.querySelector('#scen-out');

// Se o container existir na página atual, ativa o monitoramento dos botões
if (containerSaida) {
  const botoesCenario = document.querySelectorAll('.scen button');

  botoesCenario.forEach(botaoClicado => {
    botaoClicado.onclick = () => {
      
      // Atualiza a acessibilidade (aria-pressed): true para o clicado, false para os outros
      botoesCenario.forEach(botao => {
        botao.setAttribute('aria-pressed', botao === botaoClicado);
      });
      
      // Desestrutura o array do cenário selecionado com base no atributo 'data-c' do botão
      const [titulo, descricao] = CENARIOS[botaoClicado.dataset.c];
      
      // Injeta o novo conteúdo estruturado com segurança no HTML
      containerSaida.innerHTML = `<h3>${titulo}</h3><p>${descricao}</p>`;
      
      // Truque de CSS para resetar e reiniciar a animação de transição (fade-in)
      containerSaida.classList.remove('pop');
      void containerSaida.offsetWidth; // Força o navegador a recalcular a largura (reflow)
      containerSaida.classList.add('pop');
    };
  });
}

/* ==========================================================================
   2. SISTEMA DE VAGAS DINÂMICAS
   --------------------------------------------------------------------------
   Lê as propriedades globais configuradas no objeto SITE (em 'components.js')
   para desenhar as bolinhas de vagas preenchidas e atualizar os contadores.
   ========================================================================== */

// Captura o elemento container dos círculos de status de vagas
const containerPontos = document.querySelector('#dots');

// Se o container existir na página (ex: turma.html), renderiza as bolinhas
if (containerPontos) {
  // Extrai a quantidade de vagas restantes e o total configurados globalmente
  const [restam, total] = SITE.vagas;
  
  // Cria a lista de elementos <i> baseado no total. 
  // Se o índice for menor que as vagas já ocupadas, a bolinha recebe a classe '.on' (preenchida)
  containerPontos.innerHTML = Array.from({ length: total }, (_, indice) => {
    const vagaOcupada = indice < (total - restam);
    return `<i class="${vagaOcupada ? 'on' : ''}"></i>`;
  }).join('');
  
  // Atualiza todos os textos que exibem o número de vagas restantes em tempo real
  document.querySelectorAll('[data-restam]').forEach(elemento => {
    elemento.textContent = restam;
  });
}
