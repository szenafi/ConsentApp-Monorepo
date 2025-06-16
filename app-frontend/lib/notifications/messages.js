export const consentMessages = {
  DRAFT: consent => `✍️ Tu es en train de créer un consentement. Pense à le signer pour continuer.`,
  PENDING_INITIATOR: (consent) => `🚀 Ta demande a bien été envoyée à ${consent.partner?.firstName || 'ton partenaire'}. En attente de sa validation.`,
  PENDING_PARTNER: (consent) => `📬 Tu viens de recevoir une demande de consentement de ${consent.user?.firstName || 'un contact'}. Ouvre-la pour agir !`,
  ACCEPTED: consent => `🎉 Consentement confirmé avec ${consent.partner?.firstName || consent.user?.firstName || 'ton partenaire'} ! Un moment à deux, validé avec respect.`,
  REFUSED: consent => `❌ ${consent.partner?.firstName || consent.user?.firstName || 'Cette personne'} a refusé la demande. Ce n’est pas un non définitif. Tu peux réessayer plus tard.`,
};
