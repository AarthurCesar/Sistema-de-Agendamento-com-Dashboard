const TZ = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

const fmt = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Templates das mensagens de WhatsApp por tipo de evento.
export const messages = {
  created: ({ name, service, when }) =>
    `Olá, ${name}! 🗓️ Recebemos seu agendamento de *${service}* para ${fmt(when)}. ` +
    `Status: pendente. Avisaremos assim que for confirmado.`,

  confirmed: ({ name, service, when }) =>
    `Olá, ${name}! ✅ Seu agendamento de *${service}* para ${fmt(when)} foi *confirmado*. ` +
    `Te esperamos!`,

  cancelled: ({ name, service, when }) =>
    `Olá, ${name}. ❌ Seu agendamento de *${service}* para ${fmt(when)} foi *cancelado*. ` +
    `Em caso de dúvida, entre em contato conosco.`,
};
