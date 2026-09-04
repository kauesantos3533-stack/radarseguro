import { ScamInfo } from "../types";

export const SCAM_DATABASE: ScamInfo[] = [
  {
    id: "falsa-central",
    title: "Golpe da Falsa Central Telefônica (SMS 0800)",
    category: "bank",
    severity: "critical",
    summary: "A vítima recebe SMS ou ligação afirmando compra suspeita de alto valor (ex: R$ 3.800 em lojas famosas) com número 0800 para cancelar.",
    howItWorks: [
      "O golpista envia SMS falso com layout bancário informando transação aprovada ou suspeita.",
      "Ao ligar no 0800, a vítima atende uma falsa URA com música oficial de banco.",
      "O falso atendente alega que a conta foi invadida e induz a vítima a fazer Pix para 'conta de segurança' ou instalar aplicativo de suporte (AnyDesk).",
    ],
    redFlags: [
      "SMS com número 0800 pedindo para você ligar para cancelar compras.",
      "Pedido para transferir dinheiro para 'conta cofre' ou 'proteger seu saldo'.",
      "Solicitação para instalar qualquer app no celular ou computador.",
      "Transferência de chamada entre supostos 'departamentos antifraude'.",
    ],
    prevention: [
      "Bancos NUNCA pedem transferências para cancelar compras.",
      "Bancos NUNCA pedem senhas ou instalação de apps de acesso remoto.",
      "Ligue APENAS no número impresso no verso do seu cartão físico.",
    ],
    realExample: "BB Informa: Compra aprovada nas Casas Bahia no valor de R$ 3.490,00. Caso nao reconheca, ligue agora para o cancelamento: 0800 789 2011.",
  },
  {
    id: "falso-parente-whatsapp",
    title: "Golpe do Novo Número (Falso Filho / Parente)",
    category: "whatsapp",
    severity: "critical",
    summary: "Criminoso cria perfil no WhatsApp com foto da vítima ou de seu filho e envia mensagem de número desconhecido pedindo dinheiro com urgência.",
    howItWorks: [
      "O golpista pega a foto de redes sociais públicas.",
      "Manda mensagem: 'Oi mãe, salva meu número novo, o outro quebrou/caiu na água'.",
      "Inventa desculpa urgente: precisa pagar fornecedor, boleto ou mecânico e o app do banco bloqueou.",
    ],
    redFlags: [
      "Mensagem de número novo dizendo que o antigo estragou.",
      "Recusa em atender chamada de voz ou vídeo.",
      "Chave Pix fornecida em nome de terceiro desconhecido.",
      "Pressão e insistência emocional intensa.",
    ],
    prevention: [
      "NUNCA faça transferência antes de ligar para o número antigo por chamada telefônica comum.",
      "Faça uma pergunta pessoal que só a pessoa real saberia responder.",
      "Desconfie de chaves Pix em nome de pessoas físicas desconhecidas.",
    ],
    realExample: "Oi mãe, troca meu contato por esse novo, meu celular antigo pifou e estou na faculdade. Preciso pagar um trabalho urgente de R$ 850 mas meu app bloqueou, transfere pra mim no Pix da moça?",
  },
  {
    id: "falsa-taxa-correios",
    title: "Golpe da Falsa Taxa dos Correios / Alfândega",
    category: "shopping",
    severity: "high",
    summary: "Mensagens por SMS ou e-mail avisando que uma encomenda foi retida em Curitiba e será devolvida se a taxa não for paga em 24h.",
    howItWorks: [
      "Criminosos enviam SMS em massa com links encurtados ou domínios semelhantes (ex: correios-tributo.site).",
      "O site clone imita perfeitamente a identidade visual dos Correios e gera chave Pix aleatória.",
    ],
    redFlags: [
      "Links não oficiais (qualquer endereço que não termine estritamente em correios.com.br ou gov.br).",
      "Ameaça de devolução ou destruição imediata da mercadoria.",
      "Cobrança de Pix para CPF ou CNPJ de pessoa jurídica genérica.",
    ],
    prevention: [
      "Consulte o rastreamento apenas pelo app oficial dos Correios ou no site correios.com.br na seção 'Minhas Importações'.",
      "Nunca clique em links recebidos por SMS sobre encomendas.",
    ],
    realExample: "CORREIOS: Sua encomenda NX192838BR foi retida na fiscalizacao alfandegaria. Efetue o pagamento da taxa para liberacao: https://correios-tributos.online/pagar",
  },
  {
    id: "falso-emprego-tarefas",
    title: "Golpe do Falso Emprego / Avaliação de Vídeos",
    category: "jobs",
    severity: "high",
    summary: "Ofertas no WhatsApp ou Telegram prometendo R$ 100 a R$ 800 por dia para curtir vídeos no YouTube ou avaliar produtos no Mercado Livre.",
    howItWorks: [
      "No início pagam pequenos valores (R$ 10 a R$ 30) para passar confiança.",
      "Depois exigem que a vítima 'compre pacotes VIP' ou 'deposite saldo para liberar comissões maiores'.",
      "Quando a vítima deposita valores altos, os golpistas bloqueiam o contato e somem.",
    ],
    redFlags: [
      "Propostas de trabalho não solicitadas pelo WhatsApp.",
      "Ganhos muito fáceis para tarefas mecânicas simples.",
      "Exigência de depósito financeiro para poder trabalhar ou sacar ganhos.",
      "Grupos de Telegram cheios de pessoas comemorando lucros (robôs ou cúmplices).",
    ],
    prevention: [
      "Nenhuma empresa séria cobra taxa para pagar salário ou comissão.",
      "Desconfie de promessas de lucros rápidos e fáceis.",
    ],
    realExample: "Olá! Somos da equipe de recrutamento da Amazon/TikTok. Temos vagas de meio período home office para avaliar vídeos e produtos. Ganhos de R$ 200 a R$ 800 por dia. Clique para começar.",
  },
  {
    id: "falso-comprovante-pix",
    title: "Golpe do Falso Comprovante Pix / Agendamento",
    category: "pix",
    severity: "high",
    summary: "Golpistas compram produtos em marketplaces (OLX, Enjoei, Facebook) e enviam comprovante falso ou apenas o comprovante de agendamento cancelável.",
    howItWorks: [
      "O criminoso agenda um Pix para o dia seguinte ou forja uma imagem de comprovante no Photoshop.",
      "Manda motorista de aplicativo retirar o produto com urgência antes que a vítima confira o saldo real.",
      "Logo após retirar a mercadoria, cancela o agendamento.",
    ],
    redFlags: [
      "Comprovante com status 'Agendado' em vez de 'Realizado / Liquidado'.",
      "O dinheiro não aparece no extrato da sua conta bancária.",
      "Pressão imensa para entregar a mercadoria para um motorista de app já a caminho.",
    ],
    prevention: [
      "NUNCA entregue produtos confiando apenas em print de comprovante enviado pelo comprador.",
      "Abra o seu aplicativo de banco e confirme que o saldo já está disponível na sua conta.",
    ],
    realExample: "Comprovante enviado por WhatsApp com fontes desalinhadas e horário que não bate com a mensagem.",
  },
  {
    id: "falso-boleto-adulterado",
    title: "Golpe do Falso Boleto / Benefício INSS / Renegociação",
    category: "bank",
    severity: "high",
    summary: "Boletos falsos enviados por WhatsApp ou e-mail com código de barras adulterado que destina o pagamento para a conta de um golpista.",
    howItWorks: [
      "Criminosos interceptam e-mails ou oferecem 'desconto de 80% para quitar dívidas' via WhatsApp.",
      "O boleto possui logotipo do banco da vítima, mas a linha digitável direciona para uma instituição de pagamento desconhecida.",
    ],
    redFlags: [
      "Beneficiário final na tela de confirmação diferente da empresa credora real.",
      "Boleto recebido por WhatsApp sem solicitação prévia.",
      "Descontos milagrosos para pagamento apenas hoje.",
    ],
    prevention: [
      "Verifique sempre o 'Nome do Beneficiário' e 'CNPJ' na tela de confirmação do seu aplicativo bancário antes de digitar a senha.",
      "Use a ferramenta de DDA (Débito Direto Autorizado) no app do seu banco.",
    ],
    realExample: "Prezado cliente, aproveite nosso Feirão Limpa Nome com 90% de desconto. Pague o boleto anexo até hoje para retirar restrições do Serasa.",
  },
];
