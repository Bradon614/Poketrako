import type { Ionicons } from '@expo/vector-icons';

/**
 * Category visuals
 * ---------------------------------------------------------------------------
 * Categories are user-defined and only carry a `name`, so their icon and colour
 * are derived deterministically from that name — no schema change, no migration,
 * no extra API field. Known French finance keywords map to hand-picked
 * icon/colour pairs; anything unmapped falls back to a stable hash so the same
 * category always looks the same everywhere it appears.
 *
 * Colours sit in the 400–500 range on purpose: they stay legible on both the
 * light and the dark background, and they are always used as a tinted well
 * (low-alpha fill + saturated glyph) rather than as a text colour.
 */

export interface CategoryVisual {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}

const PALETTE = [
  '#3B82F6', // blue
  '#14B8A6', // teal
  '#8B5CF6', // violet
  '#F97316', // orange
  '#EC4899', // pink
  '#22C55E', // green
  '#0EA5E9', // sky
  '#F59E0B', // amber
  '#6366F1', // indigo
  '#94A3B8', // slate
] as const;

type Rule = { keywords: string[]; icon: CategoryVisual['icon']; color: string };

const RULES: Rule[] = [
  {
    keywords: ['alimentation', 'nourriture', 'course', 'repas', 'resto', 'restaurant', 'food', 'epicerie', 'marche'],
    icon: 'fast-food-outline',
    color: '#F97316',
  },
  {
    keywords: ['transport', 'carburant', 'essence', 'taxi', 'bus', 'voiture', 'moto', 'taxi', 'train', 'avion'],
    icon: 'car-outline',
    color: '#3B82F6',
  },
  {
    keywords: ['logement', 'loyer', 'maison', 'habitation', 'appartement', 'charges'],
    icon: 'home-outline',
    color: '#8B5CF6',
  },
  {
    keywords: ['sante', 'medical', 'medicament', 'pharmacie', 'docteur', 'hopital', 'dentiste'],
    icon: 'medkit-outline',
    color: '#14B8A6',
  },
  {
    keywords: ['loisir', 'divertissement', 'sortie', 'vacance', 'voyage', 'jeu', 'sport', 'cinema'],
    icon: 'game-controller-outline',
    color: '#EC4899',
  },
  {
    keywords: ['shopping', 'vetement', 'mode', 'chaussure', 'achat', 'habillement'],
    icon: 'bag-handle-outline',
    color: '#E879A6',
  },
  {
    keywords: ['facture', 'electricite', 'eau', 'internet', 'telephone', 'abonnement', 'jir', 'jirama', 'mobile'],
    icon: 'receipt-outline',
    color: '#0EA5E9',
  },
  {
    keywords: ['education', 'ecole', 'formation', 'etude', 'cours', 'universite', 'frais scolaire'],
    icon: 'school-outline',
    color: '#6366F1',
  },
  {
    keywords: ['salaire', 'paie', 'paye', 'revenu', 'prime'],
    icon: 'wallet-outline',
    color: '#22C55E',
  },
  {
    keywords: ['freelance', 'mission', 'client', 'consultant', 'vente', 'commerce'],
    icon: 'briefcase-outline',
    color: '#F59E0B',
  },
  {
    keywords: ['epargne', 'investissement', 'placement', 'banque', 'credit', 'pret', 'dette'],
    icon: 'trending-up-outline',
    color: '#22C55E',
  },
  {
    keywords: ['famille', 'enfant', 'enfant', 'cadeau', 'don', 'association', 'social'],
    icon: 'heart-outline',
    color: '#EF4444',
  },
  {
    keywords: ['impot', 'taxe', 'amende', 'penalite'],
    icon: 'document-text-outline',
    color: '#94A3B8',
  },
  {
    keywords: ['reche', 'divers', 'autre', 'autres'],
    icon: 'grid-outline',
    color: '#94A3B8',
  },
];

/** Lowercases and strips diacritics so "Santé" and "sante" match the same rule. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const DEFAULT_CATEGORY_VISUAL: CategoryVisual = {
  icon: 'pricetags-outline',
  color: '#3B82F6',
};

export function getCategoryVisual(name?: string | null): CategoryVisual {
  if (!name) return DEFAULT_CATEGORY_VISUAL;
  const normalized = normalize(name);
  if (!normalized) return DEFAULT_CATEGORY_VISUAL;

  const rule = RULES.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword))
  );
  if (rule) return { icon: rule.icon, color: rule.color };

  return {
    icon: 'pricetags-outline',
    color: PALETTE[hashString(normalized) % PALETTE.length],
  };
}

/** Translucent version of a category colour, for icon wells and chips. */
export function tintAlpha(hex: string, alpha = 0.16): string {
  const cleaned = hex.replace('#', '');
  const expanded = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
