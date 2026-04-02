export const metadata = {
  title: 'Politique de confidentialité — PA2 HUB',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="politique-page">
      <div className="politique-inner">
        <a href="/" className="politique-back">
          ← Retour à l'accueil
        </a>

        <h1 className="politique-title">Politique de confidentialité</h1>
        <p className="politique-updated">Dernière mise à jour : mars 2026</p>

        <section className="politique-section">
          <h2>1. Présentation du site</h2>
          <p>
            PA2 HUB est un site communautaire non officiel dédié à l'événement <strong>Pokémon Académie 2</strong>, un
            modpack Minecraft basé sur le mod Cobblemon. Ce site n'est pas affilié à The Pokémon Company, Nintendo, Game
            Freak, Mojang Studios, ni à l'équipe Cobblemon.
          </p>
        </section>

        <section className="politique-section">
          <h2>2. Données collectées</h2>
          <p>
            Ce site <strong>ne collecte aucune donnée personnelle</strong>. Aucun formulaire d'inscription, aucun compte
            utilisateur, aucun cookie de suivi n'est mis en place par ce site.
          </p>
          <h3>Stockage local (localStorage)</h3>
          <p>Le navigateur stocke localement, uniquement sur votre appareil :</p>
          <ul>
            <li>
              <strong>pa2_theme</strong> — votre préférence de thème (mode clair ou sombre).
            </li>
            <li>
              <strong>pa2_peak_viewers</strong> — le pic de viewers enregistré lors de votre visite (nombre + date).
            </li>
          </ul>
          <p>
            Ces données ne sont jamais transmises à un serveur. Elles restent sur votre appareil et peuvent être
            supprimées à tout moment en vidant le stockage local de votre navigateur.
          </p>
        </section>

        <section className="politique-section">
          <h2>3. Services tiers</h2>
          <p>
            Ce site interroge des APIs publiques tierces. Ces services ont leurs propres politiques de confidentialité :
          </p>
          <ul>
            <li>
              <strong>Twitch (API Helix)</strong> — utilisé pour récupérer les informations des streamers (nom, avatar,
              statut live, clips). Les requêtes sont effectuées via notre serveur proxy ; aucun token utilisateur n'est
              transmis. Politique de confidentialité Twitch applicable.
            </li>
            <li>
              <strong>PokéAPI (pokeapi.co)</strong> — API publique et ouverte pour les données Pokémon (stats, sprites,
              chaînes d'évolution). Aucune donnée personnelle n'est transmise.
            </li>
            <li>
              <strong>Wiki Cobblemon (wiki.cobblemon.com)</strong> — API publique du wiki officiel pour les données du
              mod Cobblemon. Aucune donnée personnelle n'est transmise.
            </li>
          </ul>
        </section>

        <section className="politique-section">
          <h2>4. Hébergement</h2>
          <p>
            Ce site est hébergé sur un service tiers. Les logs d'accès standard de l'hébergeur (adresse IP, navigateur,
            pages visitées) peuvent être conservés selon leur propre politique de confidentialité. Nous n'avons pas
            accès à ces logs à titre personnel.
          </p>
        </section>

        <section className="politique-section">
          <h2>5. Vos droits (RGPD)</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de
            rectification et de suppression de vos données. Dans la mesure où ce site ne collecte aucune donnée
            personnelle, ces droits s'exercent principalement vis-à-vis des services tiers mentionnés ci-dessus (Twitch,
            hébergeur).
          </p>
          <p>
            Les seules données stockées (thème, pic de viewers) sont locales à votre navigateur et peuvent être
            supprimées directement depuis les paramètres de votre navigateur (Outils → Stockage → LocalStorage).
          </p>
        </section>

        <section className="politique-section">
          <h2>6. Mentions légales</h2>
          <ul>
            <li>Pokémon © 1995–2026 Nintendo / Game Freak / Creatures Inc.</li>
            <li>Minecraft © Mojang Studios / Microsoft.</li>
            <li>Cobblemon © Cobblemon Team — Licence CCA-BY-NC 4.0.</li>
            <li>Twitch est une marque déposée de Twitch Interactive, Inc.</li>
          </ul>
          <p>
            Ce site est un projet communautaire indépendant. Toutes les marques citées appartiennent à leurs
            propriétaires respectifs.
          </p>
        </section>

        <section className="politique-section">
          <h2>7. Modifications</h2>
          <p>
            Cette politique de confidentialité peut être mise à jour à tout moment. La date de dernière modification est
            indiquée en haut de cette page.
          </p>
        </section>
      </div>
    </div>
  );
}
