/* ==========================================================================
   pages.js — recursos dinâmicos das páginas

   Este arquivo precisa ser carregado DEPOIS do components.js, porque usa
   o objeto SITE (vagas) que nasce lá.

   ÍNDICE
   1. Cenários do Programa (os textos)          -> programa.html
   2. Seletor de cenário (os botões)            -> programa.html
   3. Vagas do mês (números e bolinhas)         -> index, raio-x e turma

   COMO EDITAR
   - Quer mudar o texto de um cenário? Vá na seção 1 e altere só o que está
     entre aspas. Não apague as vírgulas nem os colchetes.
   - Quer mudar o número de vagas? Não é aqui: edite SITE.vagas (Raio-X)
     e SITE.turma (Turma) no começo do components.js.
   ========================================================================== */


/* ==========================================================================
   1. CENÁRIOS DO PROGRAMA — os textos

   Cada cenário tem 4 partes:
   titulo   nome que aparece no botão e no título do cartão
   abertura frase que descreve a situação
   itens    lista de [momento, o que fazer]. Mantenha 4 itens em cada
            cenário para o cartão ter sempre um tamanho parecido
   planoB   o que fazer quando o plano não sai como o previsto

   Importante: são exemplos do que entra no plano. No Programa, cada cenário
   é montado com os seus horários, o que você gosta de comer e o que o Raio-X
   mostrou. Por isso não há quantidades nem calorias aqui.
   ========================================================================== */
const CENARIOS = {

  corrido: {
    titulo: 'Dia corrido',
    abertura: 'Reunião atrás de reunião, almoço na mesa de trabalho e nenhuma energia para decidir o que comer. Aqui o plano pede menos decisões, e não mais tempo.',
    itens: [
      ['Café da manhã em 5 minutos', 'Pão integral com ovo mexido e uma fruta. Se não der tempo de sentar, vira um sanduíche para comer no caminho.'],
      ['Almoço', 'Marmita montada no domingo, em cerca de uma hora: uma base (arroz, feijão ou macarrão), uma proteína e legumes. Um domingo resolve vários almoços.'],
      ['Lanche da tarde', 'Iogurte com castanhas, ou fruta com queijo, guardado no trabalho. A ideia é comer antes de a fome ficar urgente.'],
      ['Jantar', 'Omelete com salada, ou uma sopa feita em lote. Rápido, leve e sem exigir fogão às nove da noite.']
    ],
    planoB: 'A marmita não aconteceu? Num restaurante por quilo, monte o prato com uma base, uma proteína e legumes. O plano já conta com o dia em que ele falha.'
  },

  social: {
    titulo: 'Fim de semana social',
    abertura: 'Aniversário, churrasco, happy hour. O problema quase nunca é a festa: é chegar com muita fome, ou decidir à noite que a segunda-feira vai consertar tudo.',
    itens: [
      ['Antes de sair', 'Faça uma refeição leve, sem pular nenhuma. Chegar com muita fome é o que mais costuma empurrar para o exagero.'],
      ['Na festa', 'Dê uma volta antes de se servir, escolha o que você mais quer e coma sentada. Repetir o que gostou é permitido.'],
      ['Se tiver bebida', 'Coma antes do primeiro copo e alterne com um copo de água. Fica mais fácil perceber quando você já está satisfeita.'],
      ['No dia seguinte', 'Volte ao horário normal na refeição seguinte. Sem jejum de compensação e sem treino de castigo.']
    ],
    planoB: 'Comeu além do que queria? O Kit SOS tem o roteiro "Escorreguei": registrar o que aconteceu, sem julgamento, e seguir com a próxima refeição.'
  },

  tpm: {
    titulo: 'TPM',
    abertura: 'Muitas mulheres sentem mais fome, mais vontade de doce e menos energia nessa fase. O plano não luta contra isso: ele se organiza em volta.',
    itens: [
      ['Horários regulares', 'Evite intervalos longos entre as refeições. Passar muitas horas sem comer costuma aumentar a vontade de doce.'],
      ['Carboidratos nas refeições', 'Inclua carboidratos integrais e frutas, como aveia, arroz integral, batata-doce e banana, para a refeição render mais.'],
      ['O doce que você quer', 'Reserve um doce de que você realmente goste, depois de uma refeição, em uma porção que você escolheu. Sem proibir, a vontade perde força.'],
      ['Conforto sem culpa', 'Uma sopa quente, um chá ou um bolo de caneca de chocolate, feito na hora, resolvem a vontade de aconchego (veja as Receitas).']
    ],
    planoB: 'A vontade bateu forte fora de hora? O Kit SOS tem o roteiro de fome emocional: pausa de 5 minutos, nomear o que você sente e só então decidir.'
  },

  viagem: {
    titulo: 'Viagem',
    abertura: 'Horários diferentes, comida diferente e nenhuma cozinha. Dá para aproveitar a viagem sem voltar com a sensação de ter perdido o controle.',
    itens: [
      ['No aeroporto e na estrada', 'Leve um kit de lanches portáteis: uma fruta que aguenta a bolsa, castanhas e um lanche simples, como sanduíche ou barra de cereal.'],
      ['No destino', 'Escolha uma refeição de comida local por dia, sem restrição, e aproveite de verdade. As outras seguem a sua rotina possível.'],
      ['Horários', 'Mantenha horários aproximados e não pule o café da manhã para "render" o passeio. Fome tardia, longe de um bom lugar para comer, costuma sair caro.'],
      ['Água e movimento', 'Leve uma garrafa e beba ao longo do dia, principalmente em voo e em clima quente. Caminhar pela cidade já conta como movimento.']
    ],
    planoB: 'O hotel não tem opção boa? Pão, ovos e frutas do café da manhã viram o lanche do dia. No retorno, a primeira refeição é a de sempre, sem "detox".'
  }

};


/* ==========================================================================
   2. SELETOR DE CENÁRIO — os botões (programa.html)

   Quando você clica em um botão, o cartão #scen-out troca de conteúdo.
   O data-c de cada botão no HTML (corrido, social, tpm, viagem) precisa ser
   igual a uma chave de CENARIOS lá em cima.
   ========================================================================== */

/* monta o HTML de um cenário a partir dos dados */
const montaCenario = (cenario) => `
  <h3>${cenario.titulo}</h3>
  <p class="scen-lead">${cenario.abertura}</p>
  <ul class="scen-list">
    ${cenario.itens.map(([momento, texto]) => `<li><b>${momento}</b>${texto}</li>`).join('')}
  </ul>
  <p class="scen-tip"><strong>Plano B.</strong> ${cenario.planoB}</p>`;

/* onde o texto aparece na tela */
const containerSaida = document.querySelector('#scen-out');

if (containerSaida) {
  const botoesCenario = document.querySelectorAll('.scen button');

  /* mostra o cenário inicial (o botão que já vem marcado no HTML) */
  const botaoInicial = document.querySelector('.scen button[aria-pressed="true"]') || botoesCenario[0];
  containerSaida.innerHTML = montaCenario(CENARIOS[botaoInicial.dataset.c]);

  botoesCenario.forEach((botaoClicado) => {
    botaoClicado.onclick = () => {

      /* marca só o botão clicado (acessibilidade: aria-pressed) */
      botoesCenario.forEach((botao) => {
        botao.setAttribute('aria-pressed', botao === botaoClicado);
      });

      /* troca o conteúdo do cartão */
      containerSaida.innerHTML = montaCenario(CENARIOS[botaoClicado.dataset.c]);

      /* reinicia a animação de entrada (fade) */
      containerSaida.classList.remove('pop');
      void containerSaida.offsetWidth; /* força o navegador a "perceber" a remoção */
      containerSaida.classList.add('pop');
    };
  });
}


/* ==========================================================================
   3. VAGAS DO MÊS

   Os números vêm do objeto SITE (components.js):
   SITE.vagas = [restantes, total]  -> vagas para começar o Raio-X no mês
   SITE.turma = [restantes, total]  -> lugares da Turma no ciclo

   No HTML, escreva o número assim e ele é preenchido sozinho:
   <span data-restam></span>        vagas restantes (Raio-X)
   <span data-total></span>         total de vagas (Raio-X)
   <span data-turma-restam></span>  lugares restantes (Turma)
   <span data-turma-total></span>   total de lugares (Turma)

   Para as bolinhas, use <div id="dots" class="dots"></div> (turma.html).
   Bolinha preenchida = lugar já ocupado.
   ========================================================================== */

/* preenche todos os elementos que tenham o atributo informado */
const preencheNumero = (atributo, valor) => {
  document.querySelectorAll(`[${atributo}]`).forEach((elemento) => {
    elemento.textContent = valor;
  });
};

if (typeof SITE !== 'undefined') {
  const [vagasRestam, vagasTotal] = SITE.vagas;
  const [turmaRestam, turmaTotal] = SITE.turma;

  preencheNumero('data-restam', vagasRestam);
  preencheNumero('data-total', vagasTotal);
  preencheNumero('data-turma-restam', turmaRestam);
  preencheNumero('data-turma-total', turmaTotal);

  /* bolinhas da Turma (turma.html) */
  const containerPontos = document.querySelector('#dots');

  if (containerPontos) {
    containerPontos.innerHTML = Array.from({ length: turmaTotal }, (_, indice) => {
      const ocupada = indice < (turmaTotal - turmaRestam);
      return `<i class="${ocupada ? 'on' : ''}"></i>`;
    }).join('');
  }
}