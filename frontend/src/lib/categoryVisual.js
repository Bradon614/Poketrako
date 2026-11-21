import {
  LuUtensils,
  LuCar,
  LuHouse,
  LuHeartPulse,
  LuGamepad2,
  LuShoppingBag,
  LuReceipt,
  LuGraduationCap,
  LuBriefcase,
  LuTrendingUp,
  LuGift,
  LuFileText,
  LuLayoutGrid,
  LuTags,
  LuBanknote,
  LuPlane,
  LuWifi,
  LuShirt,
  LuPawPrint,
  LuDumbbell,
} from 'react-icons/lu';

/**
 * Category visuals.
 *
 * Categories are user-defined and only carry a `name`, so their icon and
 * colour are derived deterministically from that name — no schema change, no
 * extra API field, and the same category always looks identical everywhere.
 *
 * Colours stay in the mid range: they are only ever used as a tinted well
 * (low-alpha fill + saturated glyph), never as body text, so they remain
 * readable in both themes.
 */

const PALETTE = [
  '#7c3aed',
  '#0ea5e9',
  '#14b8a6',
  '#f97316',
  '#ec4899',
  '#22c55e',
  '#6366f1',
  '#f59e0b',
  '#ef4444',
  '#64748b',
];

const RULES = [
  { keys: ['alimentation', 'nourriture', 'course', 'repas', 'resto', 'restaurant', 'food', 'epicerie', 'marche', 'cafe'], icon: LuUtensils, color: '#f97316' },
  { keys: ['transport', 'carburant', 'essence', 'taxi', 'bus', 'voiture', 'moto', 'train', 'parking'], icon: LuCar, color: '#0ea5e9' },
  { keys: ['logement', 'loyer', 'maison', 'habitation', 'appartement', 'charges'], icon: LuHouse, color: '#7c3aed' },
  { keys: ['sante', 'medical', 'medicament', 'pharmacie', 'docteur', 'hopital', 'dentiste'], icon: LuHeartPulse, color: '#14b8a6' },
  { keys: ['loisir', 'divertissement', 'sortie', 'jeu', 'sport', 'cinema', 'abonnement tv'], icon: LuGamepad2, color: '#ec4899' },
  { keys: ['shopping', 'vetement', 'mode', 'chaussure', 'achat', 'habillement'], icon: LuShoppingBag, color: '#e879a6' },
  { keys: ['facture', 'electricite', 'eau', 'internet', 'telephone', 'abonnement', 'jir', 'jirama', 'mobile', 'forfait'], icon: LuReceipt, color: '#6366f1' },
  { keys: ['education', 'ecole', 'formation', 'etude', 'cours', 'universite', 'scolaire'], icon: LuGraduationCap, color: '#8b5cf6' },
  { keys: ['salaire', 'paie', 'paye', 'prime', 'revenu'], icon: LuBanknote, color: '#22c55e' },
  { keys: ['freelance', 'mission', 'client', 'consultant', 'vente', 'commerce'], icon: LuBriefcase, color: '#f59e0b' },
  { keys: ['epargne', 'investissement', 'placement', 'banque', 'credit', 'pret', 'dette'], icon: LuTrendingUp, color: '#16a34a' },
  { keys: ['famille', 'enfant', 'cadeau', 'don', 'association', 'social'], icon: LuGift, color: '#ef4444' },
  { keys: ['impot', 'taxe', 'amende', 'penalite'], icon: LuFileText, color: '#64748b' },
  { keys: ['voyage', 'vacance', 'hotel', 'billet'], icon: LuPlane, color: '#06b6d4' },
  { keys: ['animaux', 'animal', 'veterinaire'], icon: LuPawPrint, color: '#a16207' },
  { keys: ['salle de sport', 'fitness', 'muscu'], icon: LuDumbbell, color: '#0891b2' },
  { keys: ['vpn', 'cloud', 'logiciel', 'software'], icon: LuWifi, color: '#3b82f6' },
  { keys: ['linge', 'lessive', 'menage'], icon: LuShirt, color: '#0d9488' },
  { keys: ['divers', 'autre', 'autres', 'reche'], icon: LuLayoutGrid, color: '#64748b' },
];

export const DEFAULT_CATEGORY_VISUAL = { icon: LuTags, color: '#7c3aed' };

/** Lowercases and strips diacritics so "Santé" and "sante" match alike. */
function normalize(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hash(value) {
  let acc = 0;
  for (let i = 0; i < value.length; i += 1) {
    acc = (acc << 5) - acc + value.charCodeAt(i);
    acc |= 0;
  }
  return Math.abs(acc);
}

export function getCategoryVisual(name) {
  if (!name) return DEFAULT_CATEGORY_VISUAL;
  const key = normalize(name);
  if (!key) return DEFAULT_CATEGORY_VISUAL;

  const rule = RULES.find((candidate) => candidate.keys.some((keyword) => key.includes(keyword)));
  if (rule) return { icon: rule.icon, color: rule.color };

  return {
    icon: DEFAULT_CATEGORY_VISUAL.icon,
    color: PALETTE[hash(key) % PALETTE.length],
  };
}

/** Translucent version of a hex colour, for icon wells and chips. */
export function withAlpha(hex, alpha = 0.12) {
  const cleaned = String(hex).replace('#', '');
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Palette handed to charts that need distinct series colours. */
export const CATEGORY_PALETTE = PALETTE;
