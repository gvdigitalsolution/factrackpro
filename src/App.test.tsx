import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders Sidebar and Dashboard by default', () => {
    render(<App />);
    expect(screen.getByText('FactTrack Pro')).toBeInTheDocument();
    // Use getAllByText because 'Tableau de bord' appears in Sidebar and TopBar
    expect(screen.getAllByText('Tableau de bord').length).toBeGreaterThan(0);
  });
});
