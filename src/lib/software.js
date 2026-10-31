// Software utilizzati in un lavoro: id (gli stessi del gestionale,
// src/lib/software.ts) → nome e sigla. Il sito li mostra come piccole
// tessere in vetro con la sigla (ProjectModal): per cambiare una sigla o
// aggiungere un software basta modificare questa tabella.
export const SOFTWARE = {
  zbrush: { label: "ZBrush", mono: "Zb" },
  blender: { label: "Blender", mono: "Bl" },
  cinema4d: { label: "Cinema 4D", mono: "C4D" },
  maya: { label: "Maya", mono: "Ma" },
  "3dsmax": { label: "3ds Max", mono: "3ds" },
  substance: { label: "Substance Painter", mono: "Pt" },
  marvelous: { label: "Marvelous Designer", mono: "Md" },
  keyshot: { label: "KeyShot", mono: "Ks" },
  unreal: { label: "Unreal Engine", mono: "UE" },
  unity: { label: "Unity", mono: "Un" },
  photoshop: { label: "Photoshop", mono: "Ps" },
  illustrator: { label: "Illustrator", mono: "Ai" },
  aftereffects: { label: "After Effects", mono: "Ae" },
  premiere: { label: "Premiere Pro", mono: "Pr" },
  davinci: { label: "DaVinci Resolve", mono: "DR" },
  figma: { label: "Figma", mono: "Fg" },
  // Programmazione
  react: { label: "React", mono: "Re" },
  nextjs: { label: "Next.js", mono: "Nx" },
  typescript: { label: "TypeScript", mono: "TS" },
  javascript: { label: "JavaScript", mono: "JS" },
  nodejs: { label: "Node.js", mono: "Nd" },
  python: { label: "Python", mono: "Py" },
  aisupport: { label: "AI support", mono: "AI" },
};

export function softwareLabel(id) {
  return SOFTWARE[id]?.label || id;
}

// Sigla per un software sconosciuto: prime due lettere, la prima maiuscola.
export function softwareMono(id) {
  if (SOFTWARE[id]) return SOFTWARE[id].mono;
  const s = String(id).replace(/[^a-z0-9]/gi, "");
  return s.charAt(0).toUpperCase() + s.charAt(1);
}
