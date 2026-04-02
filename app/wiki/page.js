import WikiClient from '@/app/wiki/WikiClient';

export const metadata = {
  title: 'Wiki Cobblemon — PA2 HUB',
  description:
    'Pokédex complet, guide débutant, table des types, recettes de fabrication et quiz Pokémon pour le modpack Cobblemon Académie 2.0.',
};

const TABS = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'guide', label: 'Guide débutant' },
  { id: 'starters', label: 'Starters' },
  { id: 'pokedex', label: 'Pokédex' },
  { id: 'legendaires', label: '★ Légendaires' },
  { id: 'types', label: 'Types' },
  { id: 'fabrication', label: 'Fabrication' },
  { id: 'commandes', label: 'Commandes' },
  { id: 'quiz', label: 'Quiz Pokémon' },
];

export default function WikiPage() {
  return <WikiClient tabs={TABS} />;
}
