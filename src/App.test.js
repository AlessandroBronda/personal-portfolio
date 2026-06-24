import { render, screen } from '@testing-library/react';
import App from './App';

test('mostra il nome nel portfolio', () => {
  render(<App />);
  expect(screen.getByText('Alessandro Bronda')).toBeInTheDocument();
});

test('mostra le voci della navbar', () => {
  render(<App />);
  expect(screen.getAllByText('HOME').length).toBeGreaterThan(0);
  expect(screen.getAllByText('BIO').length).toBeGreaterThan(0);
});
