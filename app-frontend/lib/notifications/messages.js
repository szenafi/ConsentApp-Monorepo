export const ConsentMessages = {
  draft: () => '✍️ Tu es en train de créer un consentement. Pense à le signer pour continuer.',

  pendingSent: (name: string) =>
    `🚀 Ta demande a bien été envoyée à ${name}. En attente de sa validation.`,

  pendingReceived: (name: string) =>
    `📬 Tu viens de recevoir une demande de consentement de ${name}. Ouvre-la pour agir !`,

  accepted: (name: string) =>
    `🎉 Consentement confirmé avec ${name} ! Un moment à deux, validé avec respect.`,

  refused: (name: string) =>
    `❌ ${name} a refusé la demande. Ce n’est pas un non définitif. Tu peux réessayer plus tard.`,

  revoked: (name: string) =>
    `⚠️ ${name} a révoqué son consentement. Toute nouvelle interaction nécessite une nouvelle validation.`,

  expired: (name: string) =>
    `⌛ Le consentement avec ${name} est expiré. Relance une nouvelle demande si besoin.`,
};
