/* ==========================================================================
   quiz.js — Motor do Quiz "Qual é a sua relação com a comida?"
   --------------------------------------------------------------------------
   Cada resposta soma 1 ponto para um perfil específico (c, p, e, r). 
   O perfil com a maior pontuação acumulada vence no final do teste.
   Ao encerrar, gera um cartão compartilhável em um <canvas> para download.
   ========================================================================== */

// Banco de dados dos Perfis Alimentares com as descrições de resultado
const PERFIS = {
  c: { 
    nome: 'A Controladora', 
    txt: 'Você segue regras com disciplina, mas o medo de errar pesa. O trabalho é flexibilizar sem perder a segurança.' 
  },
  p: { 
    nome: 'A Compensadora', 
    txt: 'Você vive o ciclo culpa e compensação. O trabalho é quebrar o oito ou oitenta.' 
  },
  e: { 
    nome: 'A Emocional', 
    txt: 'A comida acolhe o que a rotina pesa. O trabalho é achar outros apoios sem brigar com o prato.' 
  },
  r: { 
    nome: 'A Corrida', 
    txt: 'Sua agenda decide o que você come. O trabalho é montar um plano que caiba na correria.' 
  }
};

// Estrutura de Perguntas e Respostas [ Pergunta, [[Texto da Opção, Chave do Perfil]] ]
const PERGUNTAS = [
  [
    'Quando você foge do planejado, o que acontece?', 
    [
      ['Volto às regras ainda mais rígida', 'c'], 
      ['Compenso no dia seguinte', 'p'], 
      ['Me sinto mal e como mais', 'e'], 
      ['Nem percebo, o dia passa', 'r']
    ]
  ],
  [
    'Qual é o seu maior obstáculo hoje?', 
    [
      ['Medo de sair do plano', 'c'], 
      ['Ciclos de muito e pouco', 'p'], 
      ['Estresse e ansiedade', 'e'], 
      ['Falta de tempo', 'r']
    ]
  ],
  [
    'Como você decide o que comer?', 
    [
      ['Pelo que é permitido', 'c'], 
      ['Pelo que compensa depois', 'p'], 
      ['Pelo meu humor', 'e'], 
      ['Pelo que está mais à mão', 'r']
    ]
  ],
  [
    'Um fim de semana social é...', 
    [
      ['Um risco ao plano', 'c'], 
      ['Dia de exagerar e recomeçar na segunda', 'p'], 
      ['Um alívio depois da semana pesada', 'e'], 
      ['Mais uma correria', 'r']
    ]
  ],
  [
    'O que você mais quer mudar?', 
    [
      ['A rigidez', 'c'], 
      ['A culpa', 'p'], 
      ['A fome emocional', 'e'], 
      ['A falta de organização', 'r']
    ]
  ],
  [
    'Sua rotina alimentar em uma frase:', 
    [
      ['Regras demais', 'c'], 
      ['Oito ou oitenta', 'p'], 
      ['Como quando sinto', 'e'], 
      ['Como quando dá', 'r']
    ]
  ]
];

// Captura a div do quiz na página HTML
const containerQuiz = document.querySelector('#quiz');

// Se o container existir na página (quiz.html), inicia a aplicação
if (containerQuiz) {
  let indicePerguntaAtual = 0;
  
  // Objeto acumulador de pontos por perfil
  const pontuacao = { c: 0, p: 0, e: 0, r: 0 };

  /**
   * Controla a renderização do passo a passo das perguntas
   */
  const renderizarPasso = () => {
    // Se o índice atingir o limite de perguntas, encerra o teste e mostra o resultado
    if (indicePerguntaAtual >= PERGUNTAS.length) {
      return renderizarResultadoFinal();
    }

    const [perguntaTexto, opcoes] = PERGUNTAS[indicePerguntaAtual];
    const progressoPercentual = (indicePerguntaAtual / PERGUNTAS.length) * 100;

    // Constrói a barra de progresso, contador e pergunta com suas opções
    containerQuiz.innerHTML = `
      <div class="qbar">
        <i style="width: ${progressoPercentual}%"></i>
      </div>
      <p>Pergunta ${indicePerguntaAtual + 1} de ${PERGUNTAS.length}</p>
      <h2>${perguntaTexto}</h2>
    ` + opcoes.map(([textoOpcao, chavePerfil]) => `
      <button class="qopt" data-k="${chavePerfil}">${textoOpcao}</button>
    `).join('');
  };

  // Monitora cliques usando Event Delegation no container pai do quiz
  containerQuiz.addEventListener('click', evento => {
    const botaoClicado = evento.target.closest('.qopt');
    if (!botaoClicado) return; // Ignora cliques fora de botões de opção

    // Registra o ponto na chave correspondente, avança o índice e atualiza a tela
    pontuacao[botaoClicado.dataset.k]++;
    indicePerguntaAtual++;
    renderizarPasso();
  });

  /**
   * Finaliza o quiz, calcula o vencedor e gera a tela de download do cartão
   */
  function renderizarResultadoFinal() {
    // Ordena as chaves do objeto de pontuação pelo maior valor para achar o perfil vencedor
    const perfilVencedorChave = Object.keys(pontuacao).sort((a, b) => pontuacao[b] - pontuacao[a])[0];
    const perfilVencedor = PERFIS[perfilVencedorChave];

    // Injeta a estrutura básica de resultado na tela
    containerQuiz.innerHTML = `
      <div class="qres">
        <h2>Seu perfil: ${perfilVencedor.nome}</h2>
        <p>${perfilVencedor.txt}</p>
        <div id="cv"></div>
        <button class="btn" id="baixar">Baixar meu cartão</button> 
        <a class="btn btn--ghost" href="raio-x.html">Quero meu Raio-X</a>
      </div>
    `;

    // Aguarda o carregamento completo das fontes customizadas do Google antes de desenhar o Canvas
    document.fonts.ready.then(() => {
      const canvasGerado = criarCartaoCanvas(perfilVencedor);
      document.querySelector('#cv').append(canvasGerado);

      // Configura o evento de download da imagem em formato PNG ao clicar no botão
      document.querySelector('#baixar').onclick = () => {
        canvasGerado.toBlob(blobObjeto => {
          const linkDownload = document.createElement('a');
          linkDownload.href = URL.createObjectURL(blobObjeto);
          linkDownload.download = 'meu-perfil-alimentar.png';
          linkDownload.click();
        });
      };
    });
  }

  /**
   * Desenha o cartão gráfico compartilhável utilizando a API nativa Canvas do navegador
   */
  function criarCartaoCanvas(perfil) {
    const elementoCanvas = document.createElement('canvas');
    elementoCanvas.width = 700;
    elementoCanvas.height = 900;
    
    const contexto2d = elementoCanvas.getContext('2d');

    // Fundo do cartão (Creme)
    contexto2d.fillStyle = '#F6EFE3';
    contexto2d.fillRect(0, 0, 700, 900);

    // Círculo Externo (Verde Oliva)
    contexto2d.fillStyle = '#6B7A4B';
    contexto2d.beginPath();
    contexto2d.arc(350, 300, 190, 0, 7);
    contexto2d.fill();

    // Círculo Interno (Dourado/Amarelo)
    contexto2d.fillStyle = '#F2D784';
    contexto2d.beginPath();
    contexto2d.arc(350, 300, 130, 0, 7);
    contexto2d.fill();

    // Título do Perfil (Fraunces)
    contexto2d.fillStyle = '#2E2A24';
    contexto2d.textAlign = 'center';
    contexto2d.font = '700 54px Fraunces, Georgia, serif';
    contexto2d.fillText(perfil.nome, 350, 560);

    // Corpo de Texto Descritivo (DM Sans)
    contexto2d.font = '400 26px "DM Sans", sans-serif';
    quebrarTextoCanvas(contexto2d, perfil.txt, 350, 620, 560, 36);

    // Rodapé de Assinatura (Terracota)
    contexto2d.fillStyle = '#C4674A';
    contexto2d.font = '700 24px "DM Sans", sans-serif';
    contexto2d.fillText('Helena Vidigal | Nutrição Comportamental', 350, 840);

    return elementoCanvas;
  }

  /**
   * Função utilitária para quebrar automaticamente o texto do Canvas em várias linhas 
   * baseado na largura máxima permitida
   */
  function quebrarTextoCanvas(contexto, texto, centroX, inicialY, larguraMaxima, alturaLinha) {
    let linhaAtual = '';
    const palavras = texto.split(' ');

    palavras.forEach(palavra => {
      const linhaTestada = linhaAtual + palavra + ' ';
      const larguraTestada = contexto.measureText(linhaTestada).width;

      if (larguraTestada > larguraMaxima) {
        contexto.fillText(linhaAtual, centroX, inicialY);
        inicialY += alturaLinha;
        linhaAtual = palavra + ' ';
      } else {
        linhaAtual = linhaTestada;
      }
    });

    contexto.fillText(linhaAtual, centroX, inicialY);
  }

  // Executa a primeira renderização do Quiz ao carregar a página
  renderizarPasso();
}
