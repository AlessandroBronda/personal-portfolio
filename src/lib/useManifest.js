import { useState, useEffect } from "react";

// Base URL per la CDN (produzione e staging).
// NB: le risorse del portfolio (manifest.json + images/) vivono sul branch
// DEDICATO "assets", gestito esclusivamente da PortfolioUploader. Il sorgente
// React sta su "main" e non contiene mai questi file: così un push del codice
// non può intaccare ciò che è stato pubblicato.
const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/AlessandroBronda/personal-portfolio@assets";

// In sviluppo locale con anteprima attiva:
//   crea .env.development.local e aggiungi:
//   REACT_APP_MANIFEST_BASE_URL=/preview
// I file vengono scritti da PortfolioUploader in public/preview/
// e serviti dal webpack-dev-server alla stessa origine (localhost:3000).
const LOCAL_BASE = process.env.REACT_APP_MANIFEST_BASE_URL || "";

/**
 * Base URL per le immagini del portfolio.
 *
 * I campi `src` e `thumb` nel manifest sono path relativi
 * (es. "images/3d/torre/cover.webp"). Per costruire l'URL completo:
 *   `${IMAGE_BASE}/${item.src}`
 *
 * - In produzione: CDN jsDelivr (URL assoluta)
 * - In sviluppo con anteprima locale: /preview (URL radice-relativa)
 */
// Cache in memoria condivisa tra tutte le sezioni.
let cachedManifest = null;
let cachedImageBase = null; // IMAGE_BASE effettivo usato per caricare la cache

function getManifestUrl(base) {
  if (base === LOCAL_BASE && LOCAL_BASE) {
    return `${LOCAL_BASE}/manifest.json?_t=${Date.now()}`;
  }
  return `${CDN_BASE}/manifest.json`;
}

async function fetchManifest() {
  // Prova prima la preview locale (se configurata)
  if (LOCAL_BASE) {
    const res = await fetch(getManifestUrl(LOCAL_BASE));
    if (res.ok) return { data: await res.json(), imageBase: LOCAL_BASE };
    // Preview non disponibile (app Python chiusa) → fallback CDN silenzioso
  }
  const res = await fetch(getManifestUrl(CDN_BASE));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { data: await res.json(), imageBase: CDN_BASE };
}

/**
 * Hook per leggere il manifest del portfolio.
 *
 * Restituisce anche `imageBase`: la base URL da anteporre ai path relativi
 * delle immagini (es. `${imageBase}/${item.src}`).
 * Quando la preview locale è attiva vale "/preview"; altrimenti la CDN.
 */
export function useManifest() {
  const cacheValida = cachedManifest !== null;

  const [manifest, setManifest] = useState(cacheValida ? cachedManifest : null);
  const [imageBase, setImageBase] = useState(cacheValida ? cachedImageBase : CDN_BASE);
  const [loading, setLoading] = useState(!cacheValida);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cacheValida) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchManifest()
      .then(({ data, imageBase: base }) => {
        if (!cancelled) {
          cachedManifest = data;
          cachedImageBase = base;
          setManifest(data);
          setImageBase(base);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { manifest, loading, error, imageBase };
}
