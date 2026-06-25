// Provider WhatsApp Cloud API (Meta). Ative com WHATSAPP_PROVIDER=meta no .env.
// Variáveis necessárias: META_WHATSAPP_TOKEN, META_PHONE_NUMBER_ID
// Obs.: mensagens iniciadas pelo negócio exigem um template aprovado pela Meta.
export async function metaProvider({ to, message }) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    throw new Error('Credenciais da Meta não configuradas (.env)');
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''), // só dígitos
      type: 'text',
      text: { body: message },
    }),
  });

  if (!res.ok) {
    throw new Error(`Meta retornou ${res.status}: ${await res.text()}`);
  }
}
