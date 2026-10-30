import { render, screen } from '@testing-library/react';
import App from './App';

const cover = { key: 'images/progetti-3d/robot/abc', widths: [600, 1200], width: 1200, height: 1200 };
const project = (over) => ({
  id: over.slug, slug: over.slug, section: 'progetti-3d', status: 'published', title: over.slug,
  description: '', cover, media: [], tags: [], software: [], order: 0,
  createdAt: '2026-10-30T00:00:00Z', updatedAt: '2026-10-30T00:00:00Z', ...over,
});
const content = {
  version: 4,
  updatedAt: '2026-10-30T00:00:00Z',
  sections: [
    { id: 'grafica', label: 'GRAFICA', order: 2, visible: true, avatar: null, intro: null },
    { id: 'progetti-3d', label: 'PROGETTI 3D', order: 1, visible: true, avatar: null, intro: null },
    { id: 'segreta', label: 'SEGRETA', order: 3, visible: false, avatar: null, intro: null },
  ],
  projects: [project({ slug: 'robot', title: 'Robot' }), project({ slug: 'bozza', status: 'draft' })],
};

let fetchMock;
beforeEach(() => {
  fetchMock = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(content) }));
  global.fetch = fetchMock;
});
afterEach(() => {
  delete global.fetch;
});

// content.json si scarica una volta per caricamento della pagina: la
// richiesta parte nel primo test e viene riusata dal secondo.
test('mostra il nome e legge content.json dal bucket', async () => {
  render(<App />);
  expect(screen.getByText('Alessandro Bronda')).toBeInTheDocument();
  await screen.findAllByText('PROGETTI 3D');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toMatch(/^https:\/\/media\.alessandrobronda\.com\/content\.json\?t=\d+$/);
});

test('menu: HOME e BIO fisse, poi le sezioni visibili di content.json in ordine', async () => {
  render(<App />);
  expect(screen.getAllByText('HOME').length).toBeGreaterThan(0);
  expect(screen.getAllByText('BIO').length).toBeGreaterThan(0);
  await screen.findAllByText('PROGETTI 3D');
  const voci = screen.getAllByRole('listitem').map((li) => li.textContent);
  expect(voci.slice(0, 4)).toEqual(['HOME', 'BIO', 'PROGETTI 3D', 'GRAFICA']);
  expect(screen.queryByText('SEGRETA')).toBeNull();
});
