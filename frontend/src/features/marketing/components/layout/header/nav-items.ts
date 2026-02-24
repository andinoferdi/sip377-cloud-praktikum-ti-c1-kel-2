export type MarketingNavHash = '' | '#features' | '#pricing' | '#help';

export const navItems = [
  {
    type: 'link',
    href: '/',
    label: 'Home',
    hash: '',
  },
  {
    type: 'link',
    label: 'Features',
    href: '/#features',
    hash: '#features',
  },
  {
    type: 'link',
    label: 'Pricing',
    href: '/#pricing',
    hash: '#pricing',
  },
  {
    type: 'link',
    label: 'Help',
    href: '/#help',
    hash: '#help',
  },
] satisfies NavItem[];

type NavItem = {
  type: 'link';
  href: string;
  label: string;
  hash: MarketingNavHash;
};
