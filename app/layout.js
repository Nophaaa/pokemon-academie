import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Pokémon Académie 2 — Hub Streamers',
  description:
    'Hub communautaire Pokémon Académie 2 — Retrouvez les streamers du modpack Minecraft, suivez les lives et revivez les meilleurs clips.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>",
  },
  openGraph: {
    title: 'Pokémon Académie 2 — Hub Streamers',
    description:
      'Hub communautaire Pokémon Académie 2 — Retrouvez les streamers du modpack Minecraft, suivez les lives et revivez les meilleurs clips.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Inline script to set theme before paint, preventing flash of wrong theme.
// This replaces the suppressHydrationWarning hack.
const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('pa2_theme');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
