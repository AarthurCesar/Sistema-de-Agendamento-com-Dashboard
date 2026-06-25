// Provider de desenvolvimento: apenas imprime a mensagem no console.
// Funciona sem nenhuma credencial — ótimo para testar o fluxo completo.
export async function mockProvider({ to, message }) {
  console.log(`\n📱 [WhatsApp MOCK] → ${to}\n${message}\n`);
}
