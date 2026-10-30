import { embedUrl } from "./video";

test("YouTube: tutte le forme di indirizzo", () => {
  const e = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
  expect(embedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(e);
  expect(embedUrl("https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ")).toBe(e);
  expect(embedUrl("https://youtu.be/dQw4w9WgXcQ?si=abc")).toBe(e);
  expect(embedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(e);
  expect(embedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(e);
  expect(embedUrl("https://youtu.be/dQw4w9WgXcQ?t=1m30s")).toBe(`${e}?start=90`);
});

test("Vimeo: pubblico, non in elenco e player", () => {
  expect(embedUrl("https://vimeo.com/76979871")).toBe("https://player.vimeo.com/video/76979871");
  expect(embedUrl("https://vimeo.com/76979871/abc123def0")).toBe(
    "https://player.vimeo.com/video/76979871?h=abc123def0"
  );
  expect(embedUrl("https://vimeo.com/channels/staffpicks/76979871")).toBe(
    "https://player.vimeo.com/video/76979871"
  );
  expect(embedUrl("https://player.vimeo.com/video/76979871?h=ff00aa11")).toBe(
    "https://player.vimeo.com/video/76979871?h=ff00aa11"
  );
});

test("indirizzi non riconosciuti → null (il sito mostra un link)", () => {
  expect(embedUrl("https://www.youtube.com/@canale")).toBeNull();
  expect(embedUrl("https://vimeo.com/user123")).toBeNull();
  expect(embedUrl("https://example.com/video")).toBeNull();
  expect(embedUrl("non è un indirizzo")).toBeNull();
});
