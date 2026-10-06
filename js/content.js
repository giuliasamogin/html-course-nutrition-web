/* ==========================================================
   content.js — conteúdo vivo (dados + funções)

   ÍNDICE
   1. Utilitários
   2. Liberação de materiais
   3. Receitas
   4. Mito ou Ciência
   5. Glossário
   6. Blog e artigo
   7. Termômetro de fome

   Cada bloco só roda se a página tiver o elemento correspondente.
   ========================================================== */


/* ---------- 1. UTILITÁRIOS ---------- */
const $ = (seletor) => document.querySelector(seletor);
const $$ = (seletor) => [...document.querySelectorAll(seletor)];

/* localStorage com try/catch: não quebra se o navegador bloquear */
const store = {
  get(chave, padrao) {
    try {
      return JSON.parse(localStorage.getItem(chave)) ?? padrao;
    } catch (_) {
      return padrao;
    }
  },
  set(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (_) {}
  }
};

/* filtro de busca genérico: esconde os itens que não contêm o texto digitado */
function busca(input, itens) {
  const campo = $(input);
  if (!campo) return;

  campo.oninput = () => {
    const termo = campo.value.toLowerCase();
    $$(itens).forEach((el) => {
      el.hidden = !el.textContent.toLowerCase().includes(termo);
    });
  };
}


/* ---------- 2. LIBERAÇÃO DE MATERIAIS ----------
   O e-mail libera os downloads (simulado, salvo no navegador) */
const liberar = () => {
  $$('[data-locked]').forEach((el) => (el.hidden = false));
  $$('.gate').forEach((el) => (el.hidden = true));
};

if (store.get('lib-ok', false)) liberar();

$$('.gate').forEach((form) => {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    store.set('lib-ok', true);
    liberar();
  });
});


/* ---------- 3. RECEITAS ----------
   Filtro por cenário, busca e favoritos.

   Campos de cada receita:
   id       identificador único (usado nos favoritos)
   n        nome
   c        cenários (têm que bater com os data-cen dos botões do HTML)
   t        tempo de preparo
   porcoes  quantas porções rende
   kcal     calorias APROXIMADAS por porção
   nota     observação sobre as calorias (opcional)
   i        lista de ingredientes
   p        passo a passo (um item por passo) */
const RECEITAS = [

  /* ----- 15 minutos ----- */
  {
    id: 'omelete-legumes',
    n: 'Omelete de legumes com queijo',
    c: ['15 minutos'],
    t: '15 min',
    porcoes: '1 porção',
    kcal: 280,
    nota: 'Sem acompanhamento.',
    i: [
      '2 ovos',
      '1/4 de abobrinha pequena ralada (cerca de 50 g)',
      '1/2 tomate picado, sem sementes (cerca de 50 g)',
      '30 g de queijo minas frescal em cubinhos (2 fatias finas)',
      '1 colher de chá de azeite (4 g)',
      'Sal, pimenta-do-reino e orégano a gosto'
    ],
    p: [
      'Bata os ovos em uma tigela com uma pitada de sal e pimenta.',
      'Esprema a abobrinha ralada com as mãos para tirar o excesso de água. Misture aos ovos, junto com o tomate e o orégano.',
      'Aqueça o azeite em uma frigideira antiaderente pequena, em fogo médio.',
      'Despeje a mistura, espalhe o queijo por cima e tampe. Cozinhe por 4 a 5 minutos, até as bordas firmarem.',
      'Dobre ao meio, deixe mais 1 minuto e sirva. Combina com uma fatia de pão integral ou uma fruta.'
    ]
  },
  {
    id: 'arroz-feijao-ovo',
    n: 'Arroz, feijão e ovo mexido com salada',
    c: ['15 minutos', 'sem vontade'],
    t: '15 min',
    porcoes: '1 porção',
    kcal: 410,
    nota: 'Considera arroz branco e feijão carioca já prontos.',
    i: [
      '4 colheres de sopa de arroz cozido (100 g)',
      '1 concha pequena de feijão cozido, com um pouco de caldo (100 g)',
      '2 ovos',
      '1 colher de chá de azeite (4 g)',
      'Salada a gosto: alface, tomate e cenoura ralada (cerca de 100 g)',
      'Limão, sal e pimenta a gosto'
    ],
    p: [
      'Se o arroz e o feijão estiverem na geladeira, aqueça os dois no micro-ondas por 1 a 2 minutos, mexendo na metade do tempo.',
      'Bata os ovos com uma pitada de sal e pimenta.',
      'Aqueça o azeite em uma frigideira antiaderente em fogo médio. Despeje os ovos e mexa devagar com uma colher até ficarem cremosos, por cerca de 2 minutos.',
      'Monte o prato com o arroz, o feijão e o ovo. Tempere a salada com limão e uma pitada de sal.'
    ]
  },
  {
    id: 'bowl-grao-de-bico-atum',
    n: 'Bowl de grão-de-bico com atum (sem fogão)',
    c: ['15 minutos', 'sem vontade'],
    t: '10 min',
    porcoes: '1 porção',
    kcal: 330,
    i: [
      '100 g de grão-de-bico cozido, escorrido e lavado (cerca de 4 colheres de sopa)',
      '1 lata pequena de atum ao natural, escorrido (cerca de 80 g)',
      '1 tomate médio picado',
      '1/2 pepino picado',
      '1/4 de cebola roxa em fatias finas',
      '1 colher de chá de azeite (4 g)',
      'Suco de 1/2 limão, sal, pimenta e salsinha a gosto'
    ],
    p: [
      'Escorra o grão-de-bico e lave em água corrente.',
      'Em uma tigela, misture o grão-de-bico, o tomate, o pepino e a cebola.',
      'Acrescente o atum escorrido e misture com cuidado para não desmanchar demais.',
      'Tempere com o azeite, o limão, o sal e a pimenta. Finalize com a salsinha.',
      'Sirva na hora ou leve para a marmita.'
    ]
  },
  {
    id: 'overnight-oats',
    n: 'Overnight oats de banana e canela',
    c: ['15 minutos', 'sem vontade'],
    t: '5 min + 4 h na geladeira',
    porcoes: '1 porção',
    kcal: 430,
    i: [
      '40 g de aveia em flocos (4 colheres de sopa)',
      '150 ml de leite',
      '100 g de iogurte natural',
      '1 banana média',
      '1 colher de sopa de chia (10 g)',
      '1 pitada de canela'
    ],
    p: [
      'Em um pote com tampa, misture a aveia, o leite, o iogurte e a chia.',
      'Amasse metade da banana com um garfo e misture ao pote. Polvilhe a canela.',
      'Tampe e leve à geladeira por, no mínimo, 4 horas, ou de um dia para o outro.',
      'Na hora de servir, corte a outra metade da banana em rodelas e coloque por cima. Se ficar muito firme, acrescente um pouco de leite.'
    ]
  },

  /* ----- Marmita ----- */
  {
    id: 'marmita-frango-batata-doce',
    n: 'Marmita de frango com batata-doce e brócolis',
    c: ['marmita'],
    t: '50 min',
    porcoes: '4 porções',
    kcal: 450,
    nota: 'Cada porção leva cerca de 150 g de frango cru, 150 g de batata-doce e 100 g de brócolis.',
    i: [
      '600 g de peito de frango em cubos',
      '600 g de batata-doce em cubos',
      '400 g de brócolis em floretes',
      '2 colheres de sopa de azeite (26 g)',
      '3 dentes de alho amassados',
      '1 colher de chá de páprica (opcional)',
      'Sal, pimenta e limão a gosto'
    ],
    p: [
      'Preaqueça o forno a 200 °C.',
      'Tempere o frango com o alho, a páprica, o sal, a pimenta e o suco de limão. Deixe descansar por 10 minutos.',
      'Em uma assadeira grande, espalhe a batata-doce com metade do azeite e uma pitada de sal. Leve ao forno por 15 minutos.',
      'Retire a assadeira, junte o frango e os brócolis e regue com o azeite restante. Misture.',
      'Asse por mais 20 a 25 minutos, até o frango dourar e estar bem cozido por dentro.',
      'Espere esfriar e divida em 4 potes. Dura até 3 dias na geladeira.'
    ]
  },
  {
    id: 'marmita-carne-moida',
    n: 'Carne moída com legumes e arroz integral',
    c: ['marmita'],
    t: '35 min',
    porcoes: '4 porções',
    kcal: 370,
    nota: 'Já inclui 100 g de arroz integral cozido por porção.',
    i: [
      '500 g de carne moída magra (patinho)',
      '2 cenouras médias em cubinhos (200 g)',
      '1 chuchu em cubinhos (200 g)',
      '1 cebola picada',
      '2 dentes de alho picados',
      '2 tomates picados',
      '1 colher de sopa de azeite (13 g)',
      '400 g de arroz integral cozido (100 g por porção)',
      'Sal, pimenta, cominho e cheiro-verde a gosto'
    ],
    p: [
      'Em uma panela, aqueça o azeite e refogue a cebola e o alho por 2 minutos.',
      'Junte a carne moída e mexa para soltar os grumos. Cozinhe até perder a cor rosada, por cerca de 6 minutos.',
      'Acrescente a cenoura, o chuchu, o tomate, o sal, o cominho e a pimenta. Adicione meio copo de água.',
      'Tampe e cozinhe em fogo baixo por 15 a 20 minutos, até os legumes ficarem macios. Se secar demais, acrescente um pouco de água.',
      'Finalize com cheiro-verde e divida em 4 potes, com o arroz integral ao lado.'
    ]
  },

  /* ----- Fim de semana ----- */
  {
    id: 'strogonoff-frango-leve',
    n: 'Strogonoff de frango leve',
    c: ['fim de semana', 'marmita'],
    t: '40 min',
    porcoes: '4 porções',
    kcal: 360,
    nota: 'Já inclui 100 g de arroz branco cozido por porção.',
    i: [
      '500 g de peito de frango em tiras',
      '1 cebola picada',
      '200 g de champignon fatiado',
      '2 dentes de alho picados',
      '1 colher de sopa de azeite (13 g)',
      '2 colheres de sopa de extrato de tomate (30 g)',
      '1 colher de sopa de mostarda',
      '1 pote de iogurte natural integral (170 g), em temperatura ambiente',
      '400 g de arroz branco cozido (100 g por porção)',
      'Sal, pimenta e cheiro-verde a gosto'
    ],
    p: [
      'Tempere o frango com sal e pimenta.',
      'Aqueça o azeite em uma panela larga e doure o frango em fogo médio-alto por 5 minutos, mexendo de vez em quando. Retire e reserve.',
      'Na mesma panela, refogue a cebola e o alho por 2 minutos. Junte o champignon e cozinhe até secar a água que ele solta, por cerca de 4 minutos.',
      'Volte o frango à panela e acrescente o extrato de tomate, a mostarda e meio copo de água. Cozinhe em fogo baixo por 10 minutos.',
      'Desligue o fogo, espere 1 minuto e misture o iogurte aos poucos. Assim ele não talha.',
      'Finalize com cheiro-verde e sirva com o arroz.'
    ]
  },
  {
    id: 'peixe-assado-legumes',
    n: 'Peixe assado com batata e legumes',
    c: ['fim de semana'],
    t: '1 h',
    porcoes: '2 porções',
    kcal: 385,
    i: [
      '2 filés de tilápia (cerca de 300 g)',
      '400 g de batata inglesa em rodelas finas',
      '1 abobrinha em rodelas (200 g)',
      '1 tomate em rodelas (100 g)',
      '1 cebola em fatias (100 g)',
      '1 colher de sopa de azeite (13 g)',
      '1 limão',
      '2 dentes de alho picados',
      'Sal, pimenta e salsinha a gosto'
    ],
    p: [
      'Preaqueça o forno a 200 °C.',
      'Tempere os filés com o suco de meio limão, o alho, o sal e a pimenta. Deixe descansar por 10 minutos.',
      'Em uma assadeira, espalhe a batata e a cebola, regue com metade do azeite e uma pitada de sal. Asse por 20 minutos.',
      'Retire a assadeira, junte a abobrinha e o tomate e coloque os filés por cima. Regue com o azeite restante.',
      'Volte ao forno por mais 15 a 20 minutos, até o peixe se desfazer facilmente com o garfo e a batata estar macia.',
      'Finalize com a salsinha e o restante do limão.'
    ]
  },
  {
    id: 'panqueca-banana-aveia',
    n: 'Panqueca de banana e aveia',
    c: ['15 minutos', 'fim de semana', 'TPM'],
    t: '10 min',
    porcoes: '1 porção (cerca de 4 panquecas pequenas)',
    kcal: 290,
    nota: 'Sem cobertura.',
    i: [
      '1 banana madura média (cerca de 80 g sem casca)',
      '1 ovo',
      '3 colheres de sopa de aveia em flocos (30 g)',
      '1 pitada de canela',
      '1/2 colher de chá de óleo ou manteiga para untar a frigideira'
    ],
    p: [
      'Amasse bem a banana com um garfo em uma tigela.',
      'Junte o ovo, a aveia e a canela e misture até formar uma massa homogênea. Deixe descansar por 3 minutos para a aveia hidratar.',
      'Unte uma frigideira antiaderente e aqueça em fogo médio-baixo.',
      'Coloque porções de 2 colheres de sopa de massa e espalhe um pouco. Cozinhe por 2 a 3 minutos de cada lado e vire só quando as bordas estiverem firmes.',
      'Sirva com frutas fatiadas, iogurte ou um fio de mel.'
    ]
  },

  /* ----- TPM ----- */
  {
    id: 'sopa-abobora-gengibre',
    n: 'Sopa cremosa de abóbora com gengibre',
    c: ['TPM', 'sem vontade'],
    t: '35 min',
    porcoes: '2 porções',
    kcal: 165,
    nota: 'Sozinha. Com 1 fatia de pão integral e 1 ovo cozido, sobe para cerca de 300 kcal.',
    i: [
      '400 g de abóbora cabotiá em cubos',
      '1 cebola pequena picada',
      '2 dentes de alho picados',
      '1 pedaço de gengibre de 1 cm, ralado',
      '1 colher de sopa de azeite (13 g)',
      '500 ml de água ou caldo de legumes',
      '2 colheres de sopa de iogurte natural (opcional)',
      'Sal, pimenta e cheiro-verde a gosto'
    ],
    p: [
      'Em uma panela, aqueça o azeite e refogue a cebola, o alho e o gengibre por 3 minutos.',
      'Acrescente a abóbora e a água ou o caldo. Tampe e cozinhe por 20 minutos, até a abóbora desmanchar com o garfo.',
      'Deixe esfriar por 5 minutos e bata no liquidificador em duas vezes, com a tampa entreaberta. Líquido quente pode espirrar.',
      'Volte à panela e ajuste o sal.',
      'Sirva quente, com um fio de iogurte, pimenta e cheiro-verde.'
    ]
  },
  {
    id: 'bolo-caneca-chocolate',
    n: 'Bolo de caneca de chocolate',
    c: ['TPM'],
    t: '5 min',
    porcoes: '1 porção',
    kcal: 295,
    i: [
      '1 ovo',
      '1/2 banana madura amassada (cerca de 40 g)',
      '2 colheres de sopa de aveia em flocos (20 g)',
      '1 colher de sopa de cacau em pó',
      '1 colher de sopa de leite',
      '1 colher de chá de mel',
      '1/2 colher de chá de fermento em pó',
      '2 quadrados de chocolate 70% picados (cerca de 10 g)'
    ],
    p: [
      'Em uma caneca grande (cerca de 300 ml), bata o ovo com um garfo.',
      'Junte a banana, a aveia, o cacau, o leite e o mel e misture bem.',
      'Acrescente o fermento e metade do chocolate, mexendo só até incorporar.',
      'Salpique o chocolate restante por cima.',
      'Leve ao micro-ondas por 1 min 30 s a 2 min. O bolo deve crescer e ficar firme no centro. Cada micro-ondas é diferente, então comece pelo menor tempo.',
      'Espere 1 minuto antes de comer: o bolo continua cozinhando e a caneca esquenta.'
    ]
  }
];

const lista = $('#receitas');

if (lista) {
  let cen = 'todas';
  let favs = store.get('favs', []);
  let so = false; // "só favoritas" ligado?

  /* HTML de uma receita */
  const card = (r, aberta) => {
    const fav = favs.includes(r.id);
    return `
      <details data-id="${r.id}"${aberta ? ' open' : ''}>
        <summary>${r.n} <small>(${r.t} · ${r.kcal} kcal por porção)</small></summary>
        <p><strong>Rende:</strong> ${r.porcoes}</p>
        <p><strong>Ingredientes:</strong></p>
        <ul class="ing">${r.i.map((x) => `<li>${x}</li>`).join('')}</ul>
        <p><strong>Modo de preparo:</strong></p>
        <ol class="passos">${r.p.map((x) => `<li>${x}</li>`).join('')}</ol>
        <p class="kcal"><strong>Calorias:</strong> cerca de ${r.kcal} kcal por porção.${r.nota ? ' ' + r.nota : ''}</p>
        <button class="btn btn--ghost" data-fav="${r.id}">
          ${fav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        </button>
      </details>`;
  };

  /* aplica filtro, busca (nome ou ingrediente) e favoritas */
  const desenha = () => {
    const q = ($('#busca').value || '').toLowerCase();

    /* guarda quais receitas estavam abertas, para não fecharem ao favoritar */
    const abertas = $$('#receitas details[open]').map((d) => d.dataset.id);

    const achadas = RECEITAS.filter((r) =>
      (cen === 'todas' || r.c.includes(cen)) &&
      `${r.n} ${r.i.join(' ')}`.toLowerCase().includes(q) &&
      (!so || favs.includes(r.id))
    );

    const vazio = so && favs.length === 0
      ? '<p>Você ainda não salvou nenhuma receita. Abra uma receita e clique em "Salvar nos favoritos".</p>'
      : '<p>Nenhuma receita encontrada. Tente outro filtro.</p>';

    lista.innerHTML = achadas.map((r) => card(r, abertas.includes(r.id))).join('') || vazio;
  };

  /* botões de cenário */
  $$('.chips [data-cen]').forEach((botao) => {
    botao.onclick = () => {
      cen = botao.dataset.cen;
      so = false; // sair do modo "só favoritas" ao escolher um cenário
      $('#so-fav').setAttribute('aria-pressed', false);
      $$('.chips [data-cen]').forEach((x) => x.setAttribute('aria-pressed', x === botao));
      desenha();
    };
  });

  /* botão "só favoritas" */
  $('#so-fav').onclick = (ev) => {
    so = !so;
    ev.target.setAttribute('aria-pressed', so);
    desenha();
  };

  /* campo de busca */
  $('#busca').oninput = desenha;

  /* favoritar / desfavoritar */
  lista.onclick = (ev) => {
    const botao = ev.target.closest('[data-fav]');
    if (!botao) return;

    const id = botao.dataset.fav;
    favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    store.set('favs', favs);
    desenha();
  };

  desenha();
}


/* ---------- 4. MITO OU CIÊNCIA ----------
   Cartões que viram ao clicar (classe .on).

   Estrutura (o css/pages.css, seção 10, usa EXATAMENTE estes nomes):
   button.flip                 botão acessível (sobe no hover)
     span.flip-scene           cria a perspectiva 3D
       span.flip-in            peça que gira 180°
         span.f                frente: .tag + .txt + .hint
         span.b                verso:  .tag + .txt + .hint */
const MITOS = [
  ['Carboidrato à noite engorda.', 'O que pesa é o conjunto dos dias, não o horário em que você come.'],
  ['Comer de 3 em 3 horas acelera o metabolismo.', 'O melhor intervalo é o que você consegue manter sem ansiedade.'],
  ['Comer doce estraga o plano.', 'Doce cabe. Proibir costuma aumentar a vontade e a culpa.'],
  ['Suco detox limpa o corpo.', 'Fígado e rins já fazem esse trabalho todos os dias.'],
  ['Pular refeição ajuda a compensar.', 'Costuma trazer mais fome e exageros na refeição seguinte.'],
  ['Comida saudável é cara.', 'Feijão, ovos, frutas da estação e legumes formam uma base barata.'],
  ['Glúten faz mal para todo mundo.', 'Só precisa ser evitado por quem tem doença celíaca ou sensibilidade diagnosticada.'],
  ['Fruta engorda por causa do açúcar.', 'A fruta inteira vem com fibras e água, que dão saciedade. Ela cabe bem na rotina.'],
  ['Comer por emoção é falta de força de vontade.', 'É um comportamento comum e tem explicação. Não é falha de caráter.']
];

const flips = $('#flips');

if (flips) {
  /* o verso começa com aria-hidden (leitores de tela só leem a face visível) */
  flips.innerHTML = MITOS.map(([mito, ciencia]) => `
    <button class="flip" aria-pressed="false">
      <span class="flip-scene">
        <span class="flip-in">
          <span class="f">
            <span class="tag">Mito</span>
            <span class="txt">${mito}</span>
            <span class="hint" aria-hidden="true">↻ Ver a ciência</span>
          </span>
          <span class="b" aria-hidden="true">
            <span class="tag">Ciência</span>
            <span class="txt">${ciencia}</span>
            <span class="hint" aria-hidden="true">↻ Voltar</span>
          </span>
        </span>
      </span>
    </button>`).join('');

  flips.onclick = (ev) => {
    const carta = ev.target.closest('.flip');
    if (!carta) return;

    const virada = carta.classList.toggle('on');
    carta.setAttribute('aria-pressed', virada);
    carta.querySelector('.f').setAttribute('aria-hidden', virada);
    carta.querySelector('.b').setAttribute('aria-hidden', !virada);
  };
}



/* ---------- 5. GLOSSÁRIO ----------
   Termos com busca */
const TERMOS = [
  ['Nutrição comportamental', 'Abordagem que olha para emoções, hábitos e contexto, e não só para o cardápio.'],
  ['Fome física', 'Sinal do corpo que cresce aos poucos e passa ao comer qualquer alimento.'],
  ['Fome emocional', 'Vontade de comer que vem de um sentimento e costuma pedir algo específico.'],
  ['Saciedade', 'Sensação de satisfação que indica que já é hora de parar de comer.'],
  ['Comer intuitivo', 'Prática de ouvir os sinais de fome e saciedade, sem regras externas rígidas.'],
  ['Compensação', 'Restringir ou exagerar no exercício depois de comer mais, o que alimenta a culpa.'],
  ['Gatilho', 'Situação, horário ou emoção que costuma disparar um comportamento alimentar.'],
  ['Restrição', 'Proibir alimentos ou quantidades, o que muitas vezes aumenta a vontade.']
];

const gl = $('#glossario');

if (gl) {
  gl.innerHTML = TERMOS.map(([termo, definicao]) => `
    <div class="row">
      <div><b>${termo}</b><p>${definicao}</p></div>
    </div>`).join('');

  busca('#busca', '#glossario .row');
}




/* ---------- 6. BLOG E ARTIGO (artigo.html?id=...) ----------
 
   Como escrever um artigo novo. Cada item do POSTS tem:
   titulo   título do artigo
   resumo   texto curto que aparece na lista do blog
   corpo    lista de blocos, na ordem em que aparecem:
              'texto'            -> parágrafo
              { h: 'texto' }     -> subtítulo
              { ul: ['a', 'b'] } -> lista com marcadores
              { ol: ['a', 'b'] } -> lista numerada
   refs     referências bibliográficas (ordem alfabética)
 
   Dica: não use aspas retas dentro do texto. Use “ ” e ’ para não quebrar o código. */
const POSTS = {
 
  /* ===== 1 ===== */
  'dieta-nao-dura': {
    titulo: 'Por que a dieta não durou: o que a ciência do comportamento explica',
    resumo: 'A recuperação do peso e o abandono do plano são desfechos previsíveis, e não falta de disciplina. Entenda cinco mecanismos comportamentais e biológicos por trás disso.',
    corpo: [
      'Quase toda pessoa que já fez dieta conhece a sequência: começo motivado, resultados nas primeiras semanas, queda gradual da adesão e, por fim, retorno ao ponto de partida ou além dele. A explicação mais comum é falta de disciplina. A pesquisa em comportamento alimentar sustenta outra leitura: quando o plano ignora como o corpo, a mente e a rotina funcionam, esse desfecho é previsível.',
 
      { h: 'O que os dados mostram' },
      'Em uma revisão de referência sobre manutenção da perda de peso, Wing e Phelan (2005) citam a estimativa de que cerca de 20% das pessoas com excesso de peso conseguem manter, por um ano ou mais, uma perda de pelo menos 10% do peso inicial. Ao revisar estudos de seguimento, Mann e colaboradores (2007) concluíram que a maior parte das pessoas recupera o peso perdido ao longo de alguns anos e que, entre um terço e dois terços delas, recupera mais do que perdeu.',
      'Duas ressalvas são importantes. Primeiro, quem mantém a perda existe e foi estudado: as pessoas do Registro Nacional de Controle de Peso, nos Estados Unidos, costumam relatar padrão alimentar regular, atividade física frequente e automonitoramento, ou seja, hábitos mantidos por anos. Segundo, esses resultados não significam que perder peso seja irrelevante em contextos clínicos específicos. Significam que a dieta restritiva e temporária, sozinha, é uma estratégia frágil para a maioria das pessoas.',
 
      { h: 'Cinco mecanismos que se repetem' },
      'Na prática da nutrição comportamental, cinco padrões aparecem com frequência. Eles organizam o conteúdo do e-book gratuito desta página.',
 
      { h: '1. Regras que não cabem na rotina' },
      'Planos prescritivos costumam pressupor uma semana ideal: horários fixos, tempo para cozinhar, ausência de imprevistos. A adesão depende, em grande parte, do ajuste entre a prescrição e o contexto de vida: trabalho, renda, cultura e vida social. O Guia Alimentar para a População Brasileira (Brasil, 2014) parte dessa lógica ao tratar o comer como prática social e cultural, e não apenas como ingestão de nutrientes.',
 
      { h: '2. Restrição que vira exagero' },
      'No Experimento de Minnesota (Keys et al., 1950), 36 homens saudáveis passaram 24 semanas com cerca de 1.600 kcal por dia. Perderam aproximadamente um quarto do peso, passaram a pensar em comida de forma constante e, na fase de realimentação, vários tiveram episódios de ingestão descontrolada. Em outro plano, Herman e Mack (1975) mostraram que pessoas em restrição cognitiva, depois de tomar um milk-shake, comiam mais sorvete do que as que não restringiam. O fenômeno, chamado de contrarregulação, é popularmente conhecido como o efeito “já que estraguei, vou comer tudo”.',
      'A relação é probabilística: a maioria das pessoas que faz dieta não desenvolve transtorno alimentar. Ainda assim, a restrição rígida é descrita como um dos fatores que mantêm o ciclo restrição-exagero nos modelos cognitivo-comportamentais (Polivy e Herman, 1985; Fairburn et al., 2003). Pesquisas distinguem o controle rígido, associado a mais episódios de exagero, do controle flexível, que admite exceções e se associa a melhores resultados (Westenhoefer et al., 1999).',
 
      { h: '3. Comer no piloto automático' },
      'Grande parte das decisões alimentares é guiada por hábito, ambiente e emoção, e não por fome. Planos que dependem só de força de vontade e da contagem consciente de cada porção competem com esses automatismos e tendem a perder. Funciona melhor identificar em quais situações o comer acontece sem atenção (diante da tela, no trabalho, no fim do dia) e modificar o contexto ou desenvolver respostas alternativas. Intervenções de atenção plena para o comer, como o MB-EAT (Kristeller e Wolever, 2011), trabalham justamente a percepção de fome, saciedade e gatilhos.',
 
      { h: '4. Culpa como motivação' },
      'A culpa parece um bom combustível: se incomodou, vou me esforçar mais. A evidência experimental sugere o contrário. Adams e Leary (2007) observaram que mulheres que faziam restrição alimentar e receberam, depois de comer uma rosquinha, uma mensagem autocompassiva comeram menos doces em seguida do que as do grupo de comparação. A autocrítica tende a alimentar o ciclo de exagero e compensação; a autocompaixão tende a interrompê-lo.',
 
      { h: '5. Plano feito para outra pessoa' },
      'Cardápios padronizados ignoram preferências, cultura alimentar, orçamento, condições clínicas e história de dietas anteriores. Sem identificação com o plano, a adesão depende de motivação externa, que oscila. Na abordagem comportamental, a pessoa participa da construção das metas, que costumam ser formuladas como comportamentos (por exemplo, incluir uma fonte de proteína no café da manhã quatro dias por semana) e não apenas como números na balança.',
 
      { h: 'O que fazer de diferente' },
      {
        ul: [
          'Comece pelo diagnóstico do comportamento: registre por alguns dias o que, quando, onde e com qual fome ou emoção você come, antes de mudar qualquer coisa.',
          'Defina metas de processo, pequenas e mensuráveis, em vez de metas apenas de peso.',
          'Prefira regras flexíveis a regras rígidas: “na maior parte dos dias” funciona melhor do que “nunca”.',
          'Planeje os dias difíceis antes que eles aconteçam: o que fazer quando o plano falhar.',
          'Trate a culpa como informação sobre o que ajustar, e não como punição.'
        ]
      },
      'Se houver episódios frequentes de comer com sensação de perda de controle, ou comportamentos como jejuns prolongados, vômito autoinduzido ou uso de laxantes, procure avaliação com um profissional de saúde mental e com um nutricionista experiente em transtornos alimentares.'
    ],
    refs: [
      'Adams CE, Leary MR. Promoting self-compassionate attitudes toward eating among restrictive and guilty eaters. Journal of Social and Clinical Psychology. 2007;26(10):1120-1144.',
      'Brasil. Ministério da Saúde. Guia alimentar para a população brasileira. 2. ed. Brasília: Ministério da Saúde; 2014.',
      'Fairburn CG, Cooper Z, Shafran R. Cognitive behaviour therapy for eating disorders: a “transdiagnostic” theory and treatment. Behaviour Research and Therapy. 2003;41(5):509-528.',
      'Herman CP, Mack D. Restrained and unrestrained eating. Journal of Personality. 1975;43(4):647-660.',
      'Keys A, Brozek J, Henschel A, Mickelsen O, Taylor HL. The biology of human starvation. Minneapolis: University of Minnesota Press; 1950.',
      'Kristeller JL, Wolever RQ. Mindfulness-based eating awareness training for treating binge eating disorder: the conceptual foundation. Eating Disorders. 2011;19(1):49-61.',
      'Mann T, Tomiyama AJ, Westling E, Lew AM, Samuels B, Chatman J. Medicare’s search for effective obesity treatments: diets are not the answer. American Psychologist. 2007;62(3):220-233.',
      'Polivy J, Herman CP. Dieting and binging: a causal analysis. American Psychologist. 1985;40(2):193-201.',
      'Westenhoefer J, Stunkard AJ, Pudel V. Validation of the flexible and rigid control dimensions of dietary restraint. International Journal of Eating Disorders. 1999;26(1):53-64.',
      'Wing RR, Phelan S. Long-term weight loss maintenance. American Journal of Clinical Nutrition. 2005;82(1 Suppl):222S-225S.'
    ]
  },
 
  /* ===== 2 ===== */
  'fome-emocional': {
    titulo: 'Fome emocional: como reconhecer e o que fazer',
    resumo: 'Comer por emoção é comum e não é, por si só, um problema. Veja como distinguir fome fisiológica de fome emocional, o papel da restrição e quando buscar ajuda.',
    corpo: [
      'Comer em resposta a emoções é um comportamento humano comum. Celebramos com comida, buscamos conforto na comida, recompensamos um dia difícil com comida. Na literatura científica, o termo alimentação emocional (emotional eating) descreve a tendência de comer em resposta a estados emocionais, e não a sinais fisiológicos de fome. Ela se torna clinicamente relevante quando é a principal ou a única estratégia para lidar com emoções, quando causa sofrimento ou quando vem acompanhada de perda de controle.',
 
      { h: 'A relação entre emoção e apetite não é simples' },
      'Macht (2008) propôs cinco vias pelas quais a emoção influencia o comer, entre elas a mudança na escolha dos alimentos, o enfraquecimento dos controles cognitivos sobre a alimentação e o uso da comida para regular o próprio estado emocional. Um ponto central é que emoções não aumentam o apetite de todo mundo: algumas pessoas comem mais quando estão tristes ou estressadas, outras comem menos, e revisões de estudos experimentais, como a de Evers e colaboradores (2018), mostram que o efeito não é uniforme.',
 
      { h: 'Fome fisiológica e fome emocional: um mapa, não uma regra' },
      'Na clínica, usa-se uma distinção didática entre os dois tipos de fome. Ela ajuda a observar o próprio comportamento, e por isso escalas de comer intuitivo, como a de Tylka (2006), incluem a avaliação do comer por razões físicas e não emocionais.',
      {
        ul: [
          'Início: a fome fisiológica se instala de forma gradual, com sinais como vazio no estômago, queda de energia e dificuldade de concentração. A emocional costuma surgir de repente, ligada a um evento ou a um sentimento.',
          'Especificidade: a fome fisiológica aceita variedade de alimentos. A emocional tende a pedir algo específico, como um doce ou um alimento crocante.',
          'Saciedade: a fome fisiológica diminui quando você come o suficiente. A emocional pode continuar depois de satisfeito, porque a necessidade não é de alimento.',
          'Depois de comer: a fome fisiológica deixa alívio. A emocional costuma deixar culpa ou arrependimento.'
        ]
      },
      'Esse mapa é uma simplificação. Fome e emoção se misturam: quem está com fome de verdade fica mais irritado, e quem está ansioso também pode ter dormido mal e comido pouco. Há ainda a chamada fome hedônica (Lowe e Butryn, 2007), o desejo de comer por prazer, estimulado pelo ambiente, como cheiros, propagandas e comida à vista, sem que haja necessidade de energia. Isso não é falha de caráter: é a resposta esperada de um organismo em um ambiente cheio de alimentos palatáveis.',
 
      { h: 'Restrição e emoção: uma combinação que potencializa' },
      'Um ponto pouco discutido é que quem restringe a comida tem mais risco de comer por emoção. A privação aumenta o desejo pelos alimentos proibidos, enfraquece o controle e faz do comer a resposta mais rápida ao estresse (Polivy e Herman, 2002; Van Strien, 2018). Por isso, tratar a fome emocional sem tratar a restrição costuma falhar.',
 
      { h: 'Três perguntas antes de comer' },
      {
        ol: [
          'Quando foi minha última refeição? Se faz muitas horas ou se a refeição foi pequena, o corpo pode estar pedindo comida de verdade.',
          'O que estou sentindo agora, no corpo e no humor? Cansaço, tédio, ansiedade, solidão e frustração são respostas comuns.',
          'De que eu preciso agora, além de comida? Pode ser descanso, contato com alguém, uma pausa ou um limite no trabalho.'
        ]
      },
      'Não se trata de proibir. Se, depois das perguntas, a escolha for comer, coma com atenção e sem culpa. O objetivo é ampliar o repertório: quando a comida é uma entre várias respostas, e não a única, o comer emocional perde força. Nomear a emoção em palavras, prática conhecida como rotulagem afetiva, tem apoio em estudos experimentais como estratégia de regulação emocional (Lieberman et al., 2007).',
 
      { h: 'O que a pesquisa indica sobre o tratamento' },
      'Abordagens baseadas em atenção plena para o comer, como o MB-EAT (Kristeller e Wolever, 2011), a terapia cognitivo-comportamental e o treino de habilidades de regulação emocional têm apoio na literatura para reduzir episódios de comer descontrolado. O comer intuitivo, em que a alimentação responde a sinais internos e não a regras externas, associa-se a menor sofrimento psicológico e a menos comportamentos alimentares desordenados (Linardon et al., 2021), embora grande parte dos estudos seja observacional e não permita afirmar causa e efeito.',
 
      { h: 'Quando buscar ajuda' },
      'Procure avaliação profissional se houver episódios em que você come claramente mais do que o habitual, com sensação de perda de controle e sofrimento intenso depois. No DSM-5 (APA, 2014), o transtorno de compulsão alimentar exige episódios, em média, ao menos uma vez por semana durante três meses, mas sofrimento relevante merece atenção mesmo abaixo desse limiar. Ansiedade e depressão, que frequentemente acompanham o quadro, também têm tratamento.'
    ],
    refs: [
      'American Psychiatric Association. Manual diagnóstico e estatístico de transtornos mentais: DSM-5. Porto Alegre: Artmed; 2014.',
      'Evers C, Dingemans A, Junghans AF, Boevé A. Feeling bad or feeling good, does emotion affect your consumption of food? A meta-analysis of the experimental evidence. Neuroscience & Biobehavioral Reviews. 2018;92:195-208.',
      'Kristeller JL, Wolever RQ. Mindfulness-based eating awareness training for treating binge eating disorder: the conceptual foundation. Eating Disorders. 2011;19(1):49-61.',
      'Lieberman MD, Eisenberger NI, Crockett MJ, Tom SM, Pfeifer JH, Way BM. Putting feelings into words: affect labeling disrupts amygdala activity in response to affective stimuli. Psychological Science. 2007;18(5):421-428.',
      'Linardon J, Tylka TL, Fuller-Tyszkiewicz M. Intuitive eating and its psychological correlates: a meta-analysis. International Journal of Eating Disorders. 2021;54(7):1073-1098.',
      'Lowe MR, Butryn ML. Hedonic hunger: a new dimension of appetite? Physiology & Behavior. 2007;91(4):432-439.',
      'Macht M. How emotions affect eating: a five-way model. Appetite. 2008;50(1):1-11.',
      'Polivy J, Herman CP. Causes of eating disorders. Annual Review of Psychology. 2002;53:187-213.',
      'Tylka TL. Development and psychometric evaluation of a measure of intuitive eating. Journal of Counseling Psychology. 2006;53(2):226-240.',
      'Van Strien T. Causes of emotional eating and matched treatment of obesity. Current Diabetes Reports. 2018;18(6):35.'
    ]
  },
 
  /* ===== 3 ===== */
  'parar-de-compensar': {
    titulo: 'Como parar de compensar depois de exagerar',
    resumo: 'Pular refeições ou exagerar no treino para “pagar” o que foi comido sustenta o ciclo de restrição e exagero. Veja por que isso acontece e como sair dele.',
    corpo: [
      'Depois de uma refeição maior do que o planejado, é comum pensar: amanhã eu compenso. Pular o almoço, cortar carboidrato, treinar o dobro, fazer um dia de detox. A intenção é corrigir o erro. Na maior parte das vezes, o efeito é manter vivo o problema que se queria resolver.',
 
      { h: 'O ciclo da compensação' },
      'Os modelos cognitivo-comportamentais (Fairburn et al., 2003) descrevem uma sequência: regras alimentares rígidas, quebra da regra, interpretação da quebra como fracasso, compensação por restrição ou exercício excessivo e, com a fome acumulada, nova quebra. Cada volta reforça a crença de que é preciso se controlar mais, quando é justamente o excesso de controle que sustenta o ciclo.',
 
      { h: 'Por que a compensação costuma falhar' },
      {
        ul: [
          'Biologia: a restrição aumenta a fome e a atração por alimentos (Keys et al., 1950). Compensar hoje aumenta a chance de exagerar amanhã.',
          'Psicologia: o pensamento tudo ou nada (“estraguei o dia”) leva a abandonar o plano inteiro. É o efeito descrito por Herman e Mack (1975), em que a quebra de uma regra leva a comer ainda mais.',
          'Fisiologia: o peso corporal reflete o balanço de energia ao longo de semanas e meses, e não o de uma refeição. As oscilações de peso nos dias seguintes a uma refeição mais volumosa ou salgada refletem sobretudo retenção de líquidos e conteúdo do trato digestivo, e não gordura nova.',
          'Relação com o movimento: usar o exercício como punição o transforma em obrigação. A motivação autônoma, que vem do prazer ou do valor que a pessoa dá à atividade, prevê melhor a manutenção do exercício do que a motivação controlada, baseada em culpa ou pressão (Teixeira et al., 2012).'
        ]
      },
 
      { h: 'O que fazer no lugar' },
      {
        ol: [
          'Volte à rotina na próxima refeição. Mesmo horário, composição habitual, porção habitual. É a base das estratégias para interromper o ciclo.',
          'Mantenha refeições em intervalos regulares e não espere a fome ficar extrema. A alimentação regular é um componente central dos tratamentos cognitivo-comportamentais para transtornos alimentares (Fairburn, 2008).',
          'Troque a culpa pela curiosidade: o que levou ao exagero? Fome acumulada, restrição prévia, emoção, ambiente, álcool? A resposta indica o que ajustar. A autocompaixão ajuda: no estudo de Adams e Leary (2007), uma mensagem autocompassiva depois de comer reduziu a ingestão posterior de doces em mulheres que faziam restrição.',
          'Mantenha o movimento como cuidado, e não como pagamento. Escolha uma atividade que você faria mesmo sem ter comido nada de especial.',
          'Evite o “último jantar”: comer tudo porque a dieta recomeça na segunda-feira é a mesma lógica da compensação, apenas antecipada.'
        ]
      },
 
      { h: 'Quando é preciso ajuda' },
      'Compensar de vez em quando, com um dia mais leve ou um treino a mais, é comum e não configura transtorno. O alerta aparece quando episódios de comer com perda de controle se repetem e vêm acompanhados de comportamentos compensatórios, como jejuns, exercício excessivo, vômito autoinduzido ou uso de laxantes e diuréticos. Nesse caso, o quadro pode corresponder à bulimia nervosa, que no DSM-5 (APA, 2014) exige que episódios e compensações ocorram, em média, ao menos uma vez por semana por três meses.',
      'Esses comportamentos podem causar desequilíbrios de eletrólitos e outros danos graves, e exigem acompanhamento médico, psicológico e nutricional. Se você se reconhece nessa descrição, procurar ajuda é o passo mais importante.'
    ],
    refs: [
      'Adams CE, Leary MR. Promoting self-compassionate attitudes toward eating among restrictive and guilty eaters. Journal of Social and Clinical Psychology. 2007;26(10):1120-1144.',
      'American Psychiatric Association. Manual diagnóstico e estatístico de transtornos mentais: DSM-5. Porto Alegre: Artmed; 2014.',
      'Fairburn CG, Cooper Z, Shafran R. Cognitive behaviour therapy for eating disorders: a “transdiagnostic” theory and treatment. Behaviour Research and Therapy. 2003;41(5):509-528.',
      'Fairburn CG. Cognitive behavior therapy and eating disorders. New York: Guilford Press; 2008.',
      'Herman CP, Mack D. Restrained and unrestrained eating. Journal of Personality. 1975;43(4):647-660.',
      'Keys A, Brozek J, Henschel A, Mickelsen O, Taylor HL. The biology of human starvation. Minneapolis: University of Minnesota Press; 1950.',
      'Teixeira PJ, Carraça EV, Markland D, Silva MN, Ryan RM. Exercise, physical activity, and self-determination theory: a systematic review. International Journal of Behavioral Nutrition and Physical Activity. 2012;9:78.'
    ]
  },
 
  /* ===== 4 ===== */
  'rotulos-sem-neura': {
    titulo: 'Ler rótulo sem neura: o que olhar e o que ignorar',
    resumo: 'Como comparar produtos no supermercado com base nas normas brasileiras, na ordem de maior para menor utilidade, sem transformar o rótulo em fonte de ansiedade.',
    corpo: [
      'O rótulo é uma ferramenta de informação, não um teste moral. Bem usado, ajuda a comparar produtos parecidos e a identificar o grau de processamento de um alimento. Mal usado, vira fonte de ansiedade e de regras rígidas. Este texto organiza o que olhar, na ordem de maior para menor utilidade, com base nas normas brasileiras.',
 
      { h: 'Passo 1: comece pela lista de ingredientes' },
      'Pela norma de rotulagem de alimentos embalados (RDC 259/2002), os ingredientes aparecem em ordem decrescente de quantidade: o primeiro item é o que há mais no produto. Uma lista curta, com itens que você reconhece como alimentos (farinha, ovos, leite, tomate), costuma indicar menos processamento. Listas longas com substâncias de uso essencialmente industrial, como aromatizantes, corantes, emulsificantes, realçadores de sabor e adoçantes, caracterizam os alimentos ultraprocessados da classificação NOVA (Monteiro et al., 2019), que o Guia Alimentar para a População Brasileira recomenda evitar (Brasil, 2014).',
      'Um ensaio clínico controlado com 20 adultos internados (Hall et al., 2019) mostrou que, durante duas semanas de dieta ultraprocessada, os participantes consumiram cerca de 500 kcal por dia a mais e ganharam cerca de 1 kg, enquanto na dieta minimamente processada perderam peso. É um estudo pequeno e de curta duração, mas um dos poucos com delineamento experimental sobre o tema.',
      'O açúcar adicionado pode aparecer com vários nomes, como xarope de milho, xarope de glicose, dextrose, açúcar invertido e melado.',
 
      { h: 'Passo 2: compare pela coluna de 100 g' },
      'A tabela de informação nutricional foi reformulada pela RDC 429/2020 e pela IN 75/2020, da Anvisa, que passaram a exigir valores por 100 g ou 100 ml e por porção, além da separação entre açúcares totais e açúcares adicionados. Para comparar dois produtos, use a coluna de 100 g: o tamanho da porção varia entre marcas e pode fazer um produto parecer mais leve do que é. O percentual de valor diário (%VD) usa como referência uma dieta de 2.000 kcal, que não representa as necessidades de todas as pessoas.',
 
      { h: 'Passo 3: use a lupa como filtro rápido' },
      'A rotulagem frontal em forma de lupa sinaliza alto teor de açúcar adicionado, gordura saturada ou sódio. Para alimentos sólidos ou semissólidos, os limites são 15 g de açúcar adicionado, 6 g de gordura saturada e 600 mg de sódio por 100 g; para líquidos, 7,5 g, 3 g e 300 mg por 100 ml. No Chile, a combinação de rotulagem de advertência com restrições à publicidade e à venda em escolas foi associada a reduções na compra de bebidas com selo (Taillie et al., 2021). A lupa é um bom filtro, mas a ausência dela não torna o produto saudável.',
 
      { h: 'Passo 4: desconfie das alegações da frente da embalagem' },
      {
        ul: [
          '“Integral”: confira na lista se a farinha integral é o primeiro ingrediente. Se a farinha refinada vem primeiro, ela predomina.',
          '“Zero açúcar”: indica ausência de açúcar, mas o produto pode conter adoçantes, gordura e calorias.',
          '“Light” ou “reduzido”: indica redução mínima de 25% de um nutriente ou das calorias em relação a um produto de referência (Anvisa, RDC 54/2012). Um produto light ainda pode ser muito calórico.',
          '“Natural” e “fit”: não têm uma definição regulatória que garanta menor processamento. Confira a lista de ingredientes.'
        ]
      },
 
      { h: 'Quando ler rótulo vira problema' },
      'Se conferir rótulos gera ansiedade, toma muito tempo, leva você a evitar eventos sociais ou a recusar alimentos por regras cada vez mais rígidas, vale conversar com um profissional. A ortorexia nervosa, descrita como preocupação obsessiva com a qualidade da alimentação, não é um diagnóstico oficial do DSM-5, mas há critérios propostos na literatura (Dunn e Bratman, 2016).',
      'Um bom critério prático: o rótulo deve ajudar você a decidir em poucos segundos, e não ocupar sua cabeça o dia inteiro. Nenhum rótulo diz se você é uma pessoa certa ou errada por ter comido alguma coisa. Um produto com lupa não é proibido: é, em geral, um alimento para consumo mais ocasional.'
    ],
    refs: [
      'Brasil. Agência Nacional de Vigilância Sanitária. Resolução RDC nº 54, de 12 de novembro de 2012. Regulamento técnico sobre informação nutricional complementar.',
      'Brasil. Agência Nacional de Vigilância Sanitária. Resolução RDC nº 259, de 20 de setembro de 2002. Regulamento técnico para rotulagem de alimentos embalados.',
      'Brasil. Agência Nacional de Vigilância Sanitária. Resolução RDC nº 429, de 8 de outubro de 2020. Dispõe sobre a rotulagem nutricional dos alimentos embalados.',
      'Brasil. Agência Nacional de Vigilância Sanitária. Instrução Normativa nº 75, de 8 de outubro de 2020. Requisitos técnicos para declaração da rotulagem nutricional nos alimentos embalados.',
      'Brasil. Ministério da Saúde. Guia alimentar para a população brasileira. 2. ed. Brasília: Ministério da Saúde; 2014.',
      'Dunn TM, Bratman S. On orthorexia nervosa: a review of the literature and proposed diagnostic criteria. Eating Behaviors. 2016;21:11-17.',
      'Hall KD, Ayuketah A, Brychta R, et al. Ultra-processed diets cause excess calorie intake and weight gain: an inpatient randomized controlled trial of ad libitum food intake. Cell Metabolism. 2019;30(1):67-77.',
      'Monteiro CA, Cannon G, Levy RB, et al. Ultra-processed foods: what they are and how to identify them. Public Health Nutrition. 2019;22(5):936-941.',
      'Taillie LS, Bercholz M, Popkin B, Reyes M, Colchero MA, Corvalán C. Changes in food purchases after the Chilean policies on food labelling, marketing, and sales in schools: a before and after study. The Lancet Planetary Health. 2021;5(8):e526-e533.'
    ]
  }
};
 
/* ----- funções auxiliares dos artigos ----- */
 
/* transforma um bloco do corpo em HTML */
const blocoHtml = (b) => {
  if (typeof b === 'string') return `<p>${b}</p>`;
  if (b.h) return `<h2>${b.h}</h2>`;
  if (b.ul) return `<ul>${b.ul.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  if (b.ol) return `<ol>${b.ol.map((x) => `<li>${x}</li>`).join('')}</ol>`;
  return '';
};
 
/* extrai o texto de um bloco (para contar palavras) */
const blocoTexto = (b) => {
  if (typeof b === 'string') return b;
  if (b.h) return b.h;
  return (b.ul || b.ol || []).join(' ');
};
 
/* minutos de leitura (cerca de 200 palavras por minuto) */
const minutosDeLeitura = (post) => {
  const palavras = post.corpo.map(blocoTexto).join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(palavras / 200));
};
 
/* lista de posts (blog.html) */
const blog = $('#posts');
 
if (blog) {
  blog.innerHTML = Object.entries(POSTS).map(([id, post]) =>
    `<a class="post" href="artigo.html?id=${id}"><b>${post.titulo}</b>${post.resumo}</a>`
  ).join('');
 
  busca('#busca', '#posts .post');
}
 
/* página do artigo (artigo.html) */
const art = $('#artigo');
 
if (art) {
  const id = new URLSearchParams(location.search).get('id');
  const post = POSTS[id] || {
    titulo: 'Artigo não encontrado',
    corpo: ['Volte ao blog e escolha outro texto.'],
    refs: []
  };
 
  const referencias = post.refs.length
    ? `<h2>Referências</h2><ol class="refs">${post.refs.map((r) => `<li>${r}</li>`).join('')}</ol>`
    : '';
 
  document.title = post.titulo + ' | Helena Vidigal';
 
  art.innerHTML =
    `<h1>${post.titulo}</h1>` +
    `<p><small>${minutosDeLeitura(post)} min de leitura</small></p>` +
    post.corpo.map(blocoHtml).join('') +
    referencias +
    '<p class="aviso"><small>Este texto tem finalidade informativa e não substitui avaliação e acompanhamento individualizados com nutricionista ou médico.</small></p>' +
    '<p><a class="btn" href="quiz.html">Descobrir meu perfil</a></p>';
}
 
 

/* ---------- 7. TERMÔMETRO DE FOME E SATIEDADE ----------
   Slider de 1 a 10 */
const tm = $('#termo');

if (tm) {
  const mensagem = (v) =>
    v <= 3 ? 'Fome forte. Coma com calma e, da próxima vez, não espere chegar aqui.' :
    v <= 6 ? 'Bom momento para comer, com fome leve e sem pressa.' :
    v <= 8 ? 'Saciedade confortável. Dá para parar ou seguir devagar.' :
             'Muito cheia. Sem culpa: só observe para a próxima.';

  tm.oninput = () => {
    $('#termo-msg').textContent = `${tm.value}: ${mensagem(+tm.value)}`;
  };
  tm.oninput();
}