/**
 * Messages d'erreur centralisés (Startkit)
 */
export const ErrorMessages = {
  SESSION_EXPIRED: { title: 'Session expirée', text: 'Veuillez vous reconnecter.' },
  LOGIN_FAILED: { title: 'Échec de connexion', text: 'Identifiant ou mot de passe incorrect.' },
  LOGIN_ID_REQUIRED: 'Identifiant requis',
  SERVER_ERROR: { title: 'Erreur serveur', text: 'Une erreur est survenue. Réessayez plus tard.' },
  GENERIC_ERROR: { title: 'Erreur', text: 'Une erreur est survenue.' },
  NETWORK_ERROR: { title: 'Connexion impossible', text: 'Le serveur est inaccessible.' },
  DEFAULT: { title: 'Erreur', text: 'Une erreur est survenue.' }
} as const;
