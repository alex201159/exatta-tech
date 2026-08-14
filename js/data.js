/**
 * Exatta Tech — camada de dados do front-end.
 * Centraliza o conteúdo dinâmico (apps, downloads, produtos, fabricantes,
 * manuais e FAQ) para que as páginas apenas leiam e renderizem.
 *
 * Em uma etapa futura, cada array abaixo pode ser substituído por uma
 * chamada `fetch()` a uma API real sem alterar o HTML/CSS das páginas —
 * basta manter o mesmo formato de objeto.
 */

const EXATTA_CONFIG = {
  brand: "Exatta Tech",
  whatsappNumber: "5537998466711",
  whatsappDefaultMsg: "Olá! Vim pelo site da Exatta Tech e gostaria de falar com o suporte.",
  email: "alexjunior201159@gmail.com",
  phone: "+55 (37) 99846-6711",
  address: "Atendimento remoto em todo o Brasil",
  // Preenchido depois de criar o repositório no GitHub — usado pelo painel admin (admin.html)
  // para saber onde gravar data/overrides.json. Pode ser preenchido aqui ou direto na tela do painel.
  github: {
    owner: "", // ex: "seu-usuario"
    repo: "", // ex: "exatta-tech"
    branch: "main",
  },
  // Chave da YouTube Data API v3, usada na Central dos Balanceiros para
  // buscar vídeos reais do YouTube ao pesquisar um equipamento. Fica
  // pública no código do site (todo visitante usa ela), então DEVE ser
  // restrita ao seu domínio no Google Cloud Console. Pode ser preenchida
  // aqui ou pelo painel admin (aba Configurações) — o painel tem
  // prioridade quando preenchida.
  youtubeApiKey: "",
};
// `const` no nível superior de um <script> não vira propriedade de `window`
// (ver nota mais abaixo) — main.js lê window.EXATTA_CONFIG para montar os
// links de WhatsApp, então essa atribuição precisa existir.
window.EXATTA_CONFIG = EXATTA_CONFIG;

/* ---------------------------------------------------------------------- */
/* Aplicativos                                                            */
/* ---------------------------------------------------------------------- */
const APPS = [
  {
    id: "lc-peso",
    name: "LC Peso",
    icon: "scale",
    category: "Balanças",
    filters: ["balancas", "tecnico"],
    shortDesc: "Controle de pesagem conectado a balanças e indicadores via Bluetooth, BLE e Serial.",
    fullDesc:
      "O LC Peso conecta o seu smartphone diretamente a balanças e indicadores comerciais, industriais e agrícolas, capturando o peso em tempo real e organizando cada pesagem em relatórios prontos para exportação. Criado para operações que não podem parar, funciona mesmo em campo, com pouca conectividade.",
    features: [
      "Leitura em tempo real via Bluetooth / BLE",
      "Suporte a comunicação Serial e RS-232",
      "Geração de relatórios em PDF",
      "Histórico completo de pesagens",
      "Modo offline com sincronização posterior",
      "Cadastro de produtos e clientes",
    ],
    tech: ["Flutter", "Bluetooth LE", "SQLite", "REST API"],
    compatibility: "Android 8.0 ou superior",
    version: "1.4.2",
    changelog: [
      { v: "1.4.2", d: "Correções de estabilidade na leitura Bluetooth." },
      { v: "1.4.0", d: "Novo layout de relatórios em PDF." },
      { v: "1.3.0", d: "Suporte a protocolo Serial adicionado." },
    ],
    hasDownload: true,
  },
  {
    id: "lc-agro",
    name: "LC Agro",
    icon: "leaf",
    category: "Gestão",
    filters: ["gestao", "producao"],
    shortDesc: "Gestão e pesagem para operações do setor agropecuário, do talhão ao silo.",
    fullDesc:
      "O LC Agro organiza a pesagem e a movimentação de safras, insumos e animais, integrando balanças rodoviárias e de plataforma com o controle de estoque e produção da propriedade. Pensado para operar em áreas rurais, com sincronização inteligente de dados.",
    features: [
      "Pesagem de cargas e talhões",
      "Integração com balanças rodoviárias",
      "Controle de estoque de insumos e safra",
      "Relatórios de produtividade",
      "Funciona sem sinal de internet",
      "Múltiplos usuários por propriedade",
    ],
    tech: ["Flutter", "Bluetooth LE", "Cloud Sync", "REST API"],
    compatibility: "Android 8.0 ou superior",
    version: "2.1.0",
    changelog: [
      { v: "2.1.0", d: "Novo módulo de relatórios de produtividade." },
      { v: "2.0.0", d: "Suporte a múltiplas propriedades na mesma conta." },
    ],
    hasDownload: true,
  },
  {
    id: "coletador-rbc",
    name: "Coletador RBC",
    icon: "database",
    category: "Técnico",
    filters: ["tecnico", "producao"],
    shortDesc: "Coleta de dados em campo para processos de pesagem e produção industrial.",
    fullDesc:
      "O Coletador RBC foi desenvolvido para técnicos e equipes de produção que precisam registrar dados de pesagem diretamente na linha, com leitura automática de indicadores e exportação estruturada para os sistemas da empresa.",
    features: [
      "Leitura automática de indicadores digitais",
      "Exportação em CSV e PDF",
      "Cadastro rápido de lotes e operadores",
      "Sincronização com sistemas internos",
      "Interface otimizada para uso em campo",
      "Alertas de leitura fora do padrão",
    ],
    tech: ["Flutter", "Serial / RS-232", "REST API"],
    compatibility: "Android 8.0 ou superior",
    version: "1.0.6",
    changelog: [
      { v: "1.0.6", d: "Ajustes de desempenho na leitura serial." },
      { v: "1.0.0", d: "Primeira versão pública." },
    ],
    hasDownload: true,
  },
];

/* ---------------------------------------------------------------------- */
/* Downloads                                                              */
/* ---------------------------------------------------------------------- */
const DOWNLOADS = [
  {
    id: "dl-lc-peso-apk",
    name: "LC Peso",
    platform: "Android",
    type: "android",
    version: "1.4.2",
    size: "24 MB",
    date: "10/07/2026",
    desc: "Aplicativo completo de pesagem com integração Bluetooth/BLE e Serial.",
    current: true,
    url: "", // ex: "https://exattatech.com.br/downloads/lc-peso-1.4.2.apk"
  },
  {
    id: "dl-lc-agro-apk",
    name: "LC Agro",
    platform: "Android",
    type: "android",
    version: "2.1.0",
    size: "31 MB",
    date: "02/07/2026",
    desc: "Gestão e pesagem para operações do agronegócio.",
    current: true,
    url: "",
  },
  {
    id: "dl-coletador-apk",
    name: "Coletador RBC",
    platform: "Android",
    type: "android",
    version: "1.0.6",
    size: "18 MB",
    date: "28/06/2026",
    desc: "Coleta de dados em campo para pesagem industrial.",
    current: true,
    url: "",
  },
  {
    id: "dl-driver-serial",
    name: "Driver de Comunicação Serial",
    platform: "Windows",
    type: "windows",
    version: "3.2.1",
    size: "6 MB",
    date: "14/05/2026",
    desc: "Driver para leitura de indicadores via porta serial/RS-232 em desktop.",
    current: false,
    url: "",
  },
  {
    id: "dl-manual-instalacao",
    name: "Manual de Instalação Exatta Tech",
    platform: "PDF",
    type: "pdf",
    version: "1.3",
    size: "2 MB",
    date: "20/04/2026",
    desc: "Guia completo de instalação e primeira configuração dos aplicativos.",
    current: false,
    url: "",
  },
  {
    id: "dl-config-tool",
    name: "Exatta Config Tool",
    platform: "Windows",
    type: "tool",
    version: "1.0.4",
    size: "9 MB",
    date: "03/03/2026",
    desc: "Ferramenta para configuração avançada de indicadores e protocolos.",
    current: false,
    url: "",
  },
];

/* ---------------------------------------------------------------------- */
/* Vendas / vitrine                                                       */
/* ---------------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: "prod-lc-peso-licenca",
    name: "LC Peso — Licença Anual",
    category: "Licença de software",
    icon: "scale",
    price: null,
    priceLabel: "Consultar preço",
    desc: "Licenciamento anual do aplicativo LC Peso com atualizações e suporte incluídos.",
    availability: "available",
  },
  {
    id: "prod-lc-agro-licenca",
    name: "LC Agro — Licença Anual",
    category: "Licença de software",
    icon: "leaf",
    price: null,
    priceLabel: "Consultar preço",
    desc: "Licenciamento anual do aplicativo LC Agro para propriedades e cooperativas.",
    availability: "available",
  },
  {
    id: "prod-kit-bluetooth",
    name: "Kit de Comunicação Bluetooth",
    category: "Equipamento",
    icon: "bluetooth",
    price: null,
    priceLabel: "Consultar preço",
    desc: "Módulo Bluetooth/BLE para conectar indicadores antigos aos aplicativos Exatta Tech.",
    availability: "low",
  },
  {
    id: "prod-instalacao",
    name: "Instalação e Configuração",
    category: "Serviço",
    icon: "wrench",
    price: null,
    priceLabel: "Solicitar orçamento",
    desc: "Instalação, configuração e treinamento inicial da equipe para uso dos aplicativos.",
    availability: "available",
  },
  {
    id: "prod-suporte-premium",
    name: "Suporte Técnico Premium",
    category: "Serviço",
    icon: "headset",
    price: null,
    priceLabel: "Consultar preço",
    desc: "Atendimento prioritário com SLA reduzido para operações críticas.",
    availability: "available",
  },
  {
    id: "prod-integracao-personalizada",
    name: "Integração Personalizada",
    category: "Sistema sob medida",
    icon: "cpu",
    price: null,
    priceLabel: "Solicitar orçamento",
    desc: "Desenvolvimento de integração específica entre seu sistema e equipamentos de pesagem.",
    availability: "available",
  },
];

/* ---------------------------------------------------------------------- */
/* Balanceiros — fabricantes e manuais                                    */
/* ---------------------------------------------------------------------- */
const MANUFACTURERS = [
  { id: "toledo", name: "Toledo", count: 66 },
  { id: "urano", name: "Urano", count: 61 },
  { id: "balmak", name: "Balmak", count: 10 },
  { id: "alfa", name: "Alfa", count: 8 },
  { id: "filizola", name: "Filizola", count: 7 },
  { id: "upx", name: "UPX", count: 7 },
  { id: "ramuza", name: "Ramuza", count: 6 },
  { id: "systel", name: "Systel", count: 5 },
  { id: "elgin", name: "Elgin", count: 4 },
  { id: "celmi", name: "Celmi", count: 3 },
  { id: "weightech", name: "Weightech", count: 3 },
  { id: "lider", name: "Líder", count: 30 },
  { id: "outros", name: "Outros fabricantes", count: 9 },
];

const EQUIPMENT_TYPES = [
  "Indicador digital",
  "Balança comercial",
  "Balança rodoviária",
  "Terminal de pesagem",
  "Balança de checkout",
  "Impressora de etiquetas",
  "Balança analítica",
];

const MANUALS = [
  // url = link do PDF (hospedado no seu servidor, Drive, etc.). sourceUrl (opcional) = página original do fabricante.
  { id: "m1", brand: "Toledo", model: "Prix 4 Uno", type: "Balança comercial", desc: "Manual de operação, calibração e códigos de erro do indicador Prix 4 Uno.", url: "", sourceUrl: "" },
  { id: "m2", brand: "Toledo", model: "Prix 3 Fit", type: "Balança comercial", desc: "Guia de instalação e configuração de rede para o modelo Prix 3 Fit.", url: "", sourceUrl: "" },
  { id: "m3", brand: "Toledo", model: "8217", type: "Indicador digital", desc: "Manual técnico completo do indicador de pesagem Toledo 8217.", url: "", sourceUrl: "" },
  { id: "m4", brand: "Urano", model: "UDC 4000", type: "Terminal de pesagem", desc: "Configuração de protocolo serial e parâmetros de calibração do UDC 4000.", url: "", sourceUrl: "" },
  { id: "m5", brand: "Urano", model: "Platina", type: "Balança comercial", desc: "Manual do usuário da linha Platina, com procedimentos de manutenção.", url: "", sourceUrl: "" },
  { id: "m6", brand: "Urano", model: "US 15/30", type: "Balança rodoviária", desc: "Instalação e calibração de balanças rodoviárias Urano US 15/30.", url: "", sourceUrl: "" },
  { id: "m7", brand: "Filizola", model: "CSP-10A", type: "Balança comercial", desc: "Manual técnico de operação e manutenção do modelo CSP-10A.", url: "", sourceUrl: "" },
  { id: "m8", brand: "Filizola", model: "Platform BP", type: "Balança de plataforma", desc: "Guia rápido de instalação e nivelamento da plataforma BP.", url: "", sourceUrl: "" },
  { id: "m9", brand: "Balmak", model: "BK 150", type: "Balança comercial", desc: "Manual de operação e limpeza da balança comercial BK 150.", url: "", sourceUrl: "" },
  { id: "m10", brand: "Balmak", model: "Rodoviária 60T", type: "Balança rodoviária", desc: "Procedimentos de calibração da balança rodoviária de 60 toneladas.", url: "", sourceUrl: "" },
  { id: "m11", brand: "Alfa", model: "TI400", type: "Indicador digital", desc: "Manual técnico do indicador Alfa TI400, com tabela de erros.", url: "", sourceUrl: "" },
  { id: "m12", brand: "Alfa", model: "AS-2000", type: "Balança comercial", desc: "Configuração inicial e uso diário da balança AS-2000.", url: "", sourceUrl: "" },
  { id: "m13", brand: "UPX", model: "Print 1000", type: "Impressora de etiquetas", desc: "Instalação de driver e configuração de etiquetas para o Print 1000.", url: "", sourceUrl: "" },
  { id: "m14", brand: "Ramuza", model: "RZ-30", type: "Balança de checkout", desc: "Manual de operação da balança de checkout Ramuza RZ-30.", url: "", sourceUrl: "" },
  { id: "m15", brand: "Systel", model: "SY-500", type: "Indicador digital", desc: "Guia de calibração e ajuste fino do indicador SY-500.", url: "", sourceUrl: "" },
  { id: "m16", brand: "Elgin", model: "EL-200", type: "Balança comercial", desc: "Manual do usuário e resolução de problemas comuns do EL-200.", url: "", sourceUrl: "" },
  { id: "m17", brand: "Celmi", model: "C-Series", type: "Balança analítica", desc: "Procedimentos de calibração de precisão da linha C-Series.", url: "", sourceUrl: "" },
  { id: "m18", brand: "Weightech", model: "WT-1000", type: "Terminal de pesagem", desc: "Configuração de comunicação serial do terminal WT-1000.", url: "", sourceUrl: "" },
];

const MANUAL_VIDEOS = [];

const COMMUNITY_QUESTIONS = [];

// Calculado a partir dos dados reais (não é mais um número fixo) — ver
// exattaRecomputeStats() mais abaixo, chamada depois que os itens do
// painel admin já foram somados/removidos dos arrays.
let BALANCEIROS_STATS = [
  { value: 0, suffix: "+", label: "Manuais cadastrados" },
  { value: 0, suffix: "+", label: "Fabricantes" },
  { value: 0, suffix: "+", label: "Vídeos técnicos" },
  { value: 1, suffix: "", label: "Comunidade ativa", customLabel: "Comunidade" },
];

/* ---------------------------------------------------------------------- */
/* Ajuda — categorias e FAQ                                               */
/* ---------------------------------------------------------------------- */
const HELP_CATEGORIES = [
  { id: "apps", name: "Aplicativos", icon: "phone", desc: "Uso geral dos apps Exatta Tech" },
  { id: "instalacao", name: "Instalação", icon: "download", desc: "APK, permissões e primeiro acesso" },
  { id: "bluetooth", name: "Bluetooth / BLE", icon: "bluetooth", desc: "Pareamento e conexão com balanças" },
  { id: "serial", name: "Comunicação Serial", icon: "cpu", desc: "Protocolo Serial e RS-232" },
  { id: "balancas", name: "Balanças", icon: "scale", desc: "Leitura de peso e indicadores" },
  { id: "calibracao", name: "Calibração", icon: "gauge", desc: "Ajuste e precisão dos equipamentos" },
  { id: "downloads", name: "Downloads", icon: "cloud", desc: "Versões, instaladores e atualizações" },
  { id: "licencas", name: "Licenças", icon: "shield", desc: "Ativação e renovação de licença" },
  { id: "problemas", name: "Problemas comuns", icon: "alert", desc: "Erros frequentes e soluções rápidas" },
];

const FAQ = [
  {
    cat: "apps",
    q: "Quais aplicativos a Exatta Tech oferece atualmente?",
    a: "Atualmente disponibilizamos o LC Peso (controle de pesagem), o LC Agro (gestão e pesagem para o agronegócio) e o Coletador RBC (coleta de dados em campo). Todos estão disponíveis para Android 8.0 ou superior.",
  },
  {
    cat: "instalacao",
    q: "Como instalo o aplicativo pela primeira vez?",
    a: "Baixe o APK na página de Downloads, permita a instalação de fontes desconhecidas nas configurações do Android e siga o assistente de configuração inicial dentro do app. O manual de instalação completo também está disponível para download.",
  },
  {
    cat: "instalacao",
    q: "O aplicativo pede permissões demais. É seguro?",
    a: "As permissões solicitadas (Bluetooth, localização para escaneamento BLE e armazenamento) são exigidas pelo próprio Android para comunicação com dispositivos externos e geração de relatórios. Nenhum dado é compartilhado sem sua autorização.",
  },
  {
    cat: "bluetooth",
    q: "O app não encontra minha balança via Bluetooth. O que fazer?",
    a: "Verifique se o Bluetooth do indicador está ativo e visível, se a localização do celular está ligada (exigida pelo Android para escaneamento BLE) e tente parear novamente pela tela de dispositivos do aplicativo. Reinicie o app caso o problema persista.",
  },
  {
    cat: "bluetooth",
    q: "Qual a diferença entre Bluetooth clássico e BLE nos nossos apps?",
    a: "O Bluetooth clássico é usado por indicadores mais antigos com maior consumo de energia, enquanto o BLE (Bluetooth Low Energy) é usado em equipamentos modernos, com conexão mais rápida e menor consumo. Nossos aplicativos detectam automaticamente o tipo de conexão do equipamento.",
  },
  {
    cat: "serial",
    q: "Como conectar um indicador via porta Serial/RS-232?",
    a: "É necessário um adaptador Serial-USB ou Serial-Bluetooth compatível. Configure a porta, baud rate e protocolo do indicador nas configurações avançadas do aplicativo. Consulte o manual do seu modelo na Central dos Balanceiros para os parâmetros corretos.",
  },
  {
    cat: "balancas",
    q: "O peso exibido está diferente do peso real. Como corrigir?",
    a: "Isso geralmente indica necessidade de calibração do indicador ou da célula de carga. Consulte a categoria Calibração ou o manual específico do seu equipamento na Central dos Balanceiros.",
  },
  {
    cat: "calibracao",
    q: "Com que frequência devo calibrar minha balança?",
    a: "Recomendamos calibração a cada 6 meses para uso comercial e a cada 3 meses para uso industrial ou rodoviário, além de sempre calibrar após qualquer manutenção ou troca de célula de carga.",
  },
  {
    cat: "downloads",
    q: "Como sei se estou usando a versão mais recente do app?",
    a: "A versão atual de cada aplicativo é exibida na página de Downloads, marcada com o selo 'Versão atual'. Você também pode conferir a versão instalada em Configurações > Sobre, dentro do próprio app.",
  },
  {
    cat: "licencas",
    q: "Como ativo a licença do aplicativo após a compra?",
    a: "Após a confirmação do pagamento, você recebe um código de ativação por e-mail ou WhatsApp. Insira o código na tela de licenciamento do aplicativo para liberar todas as funcionalidades.",
  },
  {
    cat: "licencas",
    q: "Posso usar a mesma licença em mais de um dispositivo?",
    a: "Cada licença é vinculada a um número limitado de dispositivos, definido no plano contratado. Entre em contato com o suporte para consultar ou ampliar o número de ativações.",
  },
  {
    cat: "problemas",
    q: "O aplicativo fecha sozinho ao abrir a tela de pesagem.",
    a: "Atualize o aplicativo para a versão mais recente disponível em Downloads. Se o problema persistir, limpe o cache do app nas configurações do Android e reinicie o dispositivo antes de abrir novamente.",
  },
  {
    cat: "problemas",
    q: "Os relatórios em PDF não estão sendo gerados.",
    a: "Verifique se o aplicativo tem permissão de armazenamento concedida e se há espaço livre suficiente no dispositivo. Caso o erro continue, entre em contato com o suporte técnico informando o modelo do celular e a versão do app.",
  },
];

/* ---------------------------------------------------------------------- */
/* Overrides — itens adicionados pelo painel admin (admin.html)           */
/*                                                                        */
/* O painel grava em data/overrides.json (via API do GitHub). Este        */
/* carregador busca esse arquivo e junta o conteúdo às listas acima, para */
/* que os itens adicionados pelo painel apareçam no site para todo mundo. */
/* Se o fetch falhar (ex: abrindo o HTML direto como arquivo, sem         */
/* servidor), o site simplesmente segue com os dados padrão acima.        */
/* ---------------------------------------------------------------------- */
// `const` no nível superior de um <script> não vira propriedade de `window`
// (diferente de `var`/funções), mas admin.js precisa localizar estes arrays
// dinamicamente pelo nome (ex: window["APPS"]) para listar os dados padrão.
window.APPS = APPS;
window.DOWNLOADS = DOWNLOADS;
window.MANUALS = MANUALS;
window.MANUAL_VIDEOS = MANUAL_VIDEOS;
window.PRODUCTS = PRODUCTS;
window.MANUFACTURERS = MANUFACTURERS;

function exattaMergeSection(baseArr, overrideItems, removedIds) {
  if (Array.isArray(removedIds) && removedIds.length) {
    for (let i = baseArr.length - 1; i >= 0; i--) {
      if (removedIds.includes(baseArr[i].id)) baseArr.splice(i, 1);
    }
  }
  if (Array.isArray(overrideItems)) {
    overrideItems.forEach((item) => {
      const idx = baseArr.findIndex((b) => b.id === item.id);
      if (idx !== -1) baseArr[idx] = item; // edição de um item existente
      else baseArr.push(item); // item novo
    });
  }
}

function exattaRecomputeStats() {
  BALANCEIROS_STATS = [
    { value: MANUALS.length, suffix: "+", label: "Manuais cadastrados" },
    { value: MANUFACTURERS.length, suffix: "+", label: "Fabricantes" },
    { value: MANUAL_VIDEOS.length, suffix: "+", label: "Vídeos técnicos" },
    { value: 1, suffix: "", label: "Comunidade ativa", customLabel: "Comunidade" },
  ];
}

window.exattaLoadOverrides = async function exattaLoadOverrides() {
  try {
    const res = await fetch("data/overrides.json", { cache: "no-store" });
    if (!res.ok) return;
    const extra = await res.json();
    const removed = extra.removed || {};
    exattaMergeSection(APPS, extra.apps, removed.apps);
    exattaMergeSection(DOWNLOADS, extra.downloads, removed.downloads);
    exattaMergeSection(MANUALS, extra.manuals, removed.manuals);
    exattaMergeSection(MANUAL_VIDEOS, extra.videos, removed.videos);
    exattaMergeSection(PRODUCTS, extra.products, removed.products);
    exattaMergeSection(MANUFACTURERS, extra.manufacturers, removed.manufacturers);
    if (extra.youtubeApiKey) EXATTA_CONFIG.youtubeApiKey = extra.youtubeApiKey;
  } catch (e) {
    console.warn("Não foi possível carregar data/overrides.json — usando apenas os dados padrão.", e);
  } finally {
    exattaRecomputeStats();
  }
};
