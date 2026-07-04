// Etichette leggibili dei software (id → nome), allineate a core/software.py
// dell'Uploader. I loghi vivono in public/software/<id>.svg — per cambiarne
// uno basta sostituire il file SVG, senza toccare il codice.
export const SOFTWARE_LABELS = {
  zbrush: "ZBrush",
  blender: "Blender",
  cinema4d: "Cinema 4D",
  maya: "Maya",
  "3dsmax": "3ds Max",
  substance: "Substance Painter",
  marvelous: "Marvelous Designer",
  keyshot: "KeyShot",
  unreal: "Unreal Engine",
  unity: "Unity",
  photoshop: "Photoshop",
  illustrator: "Illustrator",
  aftereffects: "After Effects",
  premiere: "Premiere Pro",
  davinci: "DaVinci Resolve",
  figma: "Figma",
};

export function softwareLabel(id) {
  return SOFTWARE_LABELS[id] || id;
}

export function softwareIconUrl(id) {
  return `${process.env.PUBLIC_URL || ""}/software/${id}.svg`;
}
