import {
  LuLayoutDashboard,
  LuWallet,
  LuBanknote,
  LuFolder,
  LuTarget,
  LuSettings,
} from 'react-icons/lu';

/**
 * Navigation model — one definition consumed by both the desktop rail and the
 * mobile tab bar, so the two can never drift apart.
 *
 * `primary: true` marks the destinations that appear in the phone tab bar
 * (five is the recognised ceiling before a "more" affordance is needed).
 * Everything stays reachable on desktop; on phones, "Paramètres" is also
 * reachable from the account menu in the top bar.
 */

export const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboard', label: 'Accueil', icon: LuLayoutDashboard, primary: true },
      { to: '/expenses', label: 'Dépenses', icon: LuWallet, primary: true },
      { to: '/incomes', label: 'Revenus', icon: LuBanknote, primary: true },
    ],
  },
  {
    title: 'Suivi',
    items: [
      { to: '/budget', label: 'Budget', icon: LuTarget, primary: true },
      { to: '/categories', label: 'Catégories', icon: LuFolder, primary: true },
    ],
  },
  {
    title: 'Système',
    items: [{ to: '/settings', label: 'Paramètres', icon: LuSettings, primary: false }],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export const TAB_ITEMS = NAV_ITEMS.filter((item) => item.primary);

/** Page metadata used by the top bar (title + one-line context). */
export const PAGE_META = {
  '/dashboard': { title: 'Tableau de bord', subtitle: 'Vue d’ensemble de vos finances' },
  '/expenses': { title: 'Dépenses', subtitle: 'Toutes vos sorties d’argent' },
  '/incomes': { title: 'Revenus', subtitle: 'Toutes vos entrées d’argent' },
  '/budget': { title: 'Budget', subtitle: 'Suivi de votre enveloppe mensuelle' },
  '/categories': { title: 'Catégories', subtitle: 'Organisez vos dépenses' },
  '/settings': { title: 'Paramètres', subtitle: 'Compte et préférences' },
};

export function metaForPath(pathname) {
  const match = Object.keys(PAGE_META).find((path) => pathname.startsWith(path));
  return match ? PAGE_META[match] : { title: 'Poketrako', subtitle: '' };
}
