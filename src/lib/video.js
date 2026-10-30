// Indirizzo da incorporare (iframe) per un video YouTube o Vimeo, oppure
// null se l'indirizzo non è riconoscibile: in quel caso il sito mostra un
// semplice link. Accetta le forme che il gestionale salva così come le
// incolli: watch?v=, youtu.be/, shorts/, embed/, live/, vimeo.com/<id>,
// vimeo.com/<id>/<hash> (video non in elenco), player.vimeo.com/video/<id>.

// "90", "90s", "1m30s", "1h2m3s" → secondi
function seconds(t) {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? (Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0) : 0;
}

function youtube(u) {
  const host = u.hostname.replace(/^(www|m|music)\./, "");
  let id = null;
  if (host === "youtu.be") id = u.pathname.split("/")[1];
  else if (u.pathname === "/watch") id = u.searchParams.get("v");
  else id = (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
  if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
  // youtube-nocookie: nessun cookie di YouTube finché il video non parte.
  const start = seconds(u.searchParams.get("t") || u.searchParams.get("start"));
  return `https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ""}`;
}

function vimeo(u) {
  const m = u.pathname.match(/\/(\d{5,})(?:\/([0-9a-f]{6,}))?(?:\/|$)/);
  if (!m) return null;
  const hash = u.searchParams.get("h") || m[2];
  return `https://player.vimeo.com/video/${m[1]}${hash ? `?h=${hash}` : ""}`;
}

export function embedUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (/(^|\.)vimeo\.com$/i.test(u.hostname)) return vimeo(u);
  if (/(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be)$/i.test(u.hostname)) return youtube(u);
  return null;
}
