import { useState, useEffect } from "react";

// Le risorse del portfolio (manifest.json + images/) vivono sul branch DEDICATO
// "assets", gestito solo da PortfolioUploader. Il sorgente React sta su "main" e
// non contiene mai questi file: un push del codice non può intaccarli.
//
// Due sorgenti diverse, per un motivo preciso:
// - IMMAGINI → CDN jsDelivr: sono immutabili, la cache aggressiva è un vantaggio.
// - MANIFEST → raw GitHub: cambia a OGNI upload e va letto sempre fresco. jsDelivr
//   cachea i branch in modo aggressivo e IGNORA i cache-buster (servirebbe stale,
//   anche dopo il purge), mentre raw.githubusercontent rispetta il cache-buster.
const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/AlessandroBronda/personal-portfolio@assets";
const MANIFEST_BASE =
  "https://raw.githubusercontent.com/AlessandroBronda/personal-portfolio/assets";

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

// Cache-buster sempre presente: il dev-server e raw.githubusercontent lo
// rispettano, così ogni caricamento prende il manifest aggiornato.
function getManifestUrl(base) {
  return `${base}/manifest.json?_t=${Date.now()}`;
}

async function fetchManifest() {
  // 1. Preview locale (dev): manifest e immagini da /preview. L'Uploader
  //    scrive lì i file dei progetti IN CODA (non ancora pubblicati); le
  //    immagini dei progetti già pubblicati non ci sono → per quelle i
  //    componenti fanno fallback alla CDN via onError (vedi fallbackCdn).
  if (LOCAL_BASE) {
    const res = await fetch(getManifestUrl(LOCAL_BASE));
    if (res.ok) return { data: await res.json(), imageBase: LOCAL_BASE };
    // Preview non disponibile (app chiusa) → prosegue verso la produzione.
  }

  // 2. Produzione: manifest FRESCO da raw GitHub, immagini dalla CDN jsDelivr.
  try {
    const res = await fetch(getManifestUrl(MANIFEST_BASE));
    if (res.ok) return { data: await res.json(), imageBase: CDN_BASE };
  } catch {
    // Rete/CORS: cade nel fallback qui sotto.
  }

  // 3. Fallback difensivo: manifest dalla CDN jsDelivr (può essere un po'
  //    stale, ma il sito resta funzionante se raw GitHub non risponde).
  const res = await fetch(`${CDN_BASE}/manifest.json`);
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

/**
 * Handler `onError` per i tag <img>: se l'immagine locale della preview
 * non esiste (progetto già pubblicato, file solo sulla CDN), riprova una
 * sola volta sostituendo la base locale con la CDN.
 *
 * In produzione imageBase È già la CDN: il retry non scatta (guardia).
 */
export function fallbackCdn(event) {
  const img = event.target;
  if (img.dataset.cdnRetry) return;        // già riprovato: stop
  const src = img.getAttribute("src") || "";
  const idx = src.indexOf("/images/");
  if (idx === -1 || src.startsWith(CDN_BASE)) return;
  img.dataset.cdnRetry = "1";
  img.src = `${CDN_BASE}${src.slice(idx)}`;
}
