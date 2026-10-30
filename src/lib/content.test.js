import { imageProps, MEDIA_URL } from "./content";

test("srcset con le larghezze reali e misure per riservare lo spazio", () => {
  const ref = { key: "images/grafica/poster/abc", widths: [1200, 600, 2400], width: 2000, height: 1000 };
  const p = imageProps(ref, "100vw");
  expect(p.src).toBe(`${MEDIA_URL}/images/grafica/poster/abc-1200.webp`);
  expect(p.srcSet).toBe(
    [
      `${MEDIA_URL}/images/grafica/poster/abc-600.webp 600w`,
      `${MEDIA_URL}/images/grafica/poster/abc-1200.webp 1200w`,
      // il file -2400 è largo 2000 px: il descrittore dice il vero
      `${MEDIA_URL}/images/grafica/poster/abc-2400.webp 2000w`,
    ].join(", ")
  );
  expect(p).toMatchObject({ sizes: "100vw", width: 2000, height: 1000 });
});

test("immagine piccola: una sola versione", () => {
  const p = imageProps({ key: "images/x/y/z", widths: [600], width: 450, height: 450 }, "33vw");
  expect(p.src).toBe(`${MEDIA_URL}/images/x/y/z-600.webp`);
  expect(p.srcSet).toBe(`${MEDIA_URL}/images/x/y/z-600.webp 450w`);
});
