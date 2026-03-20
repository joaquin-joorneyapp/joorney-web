import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlanCard from './PlanCard';

const basePlan = {
  id: 1,
  city: {
    id: 1,
    name: 'paris',
    title: 'Paris',
    country: 'France',
    latitude: 48.85,
    longitude: 2.35,
    pictures: [{ url: 'path/to/image.jpg' }],
  },
  startDate: new Date(2026, 5, 1), // local date (month 0-indexed): avoids UTC timezone off-by-one
  days: 3,
  schedules: [],
  categories: [],
};

describe('PlanCard', () => {
  it('renders the city title', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('renders the country', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('renders the days count', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('3 days')).toBeInTheDocument();
  });

  it('renders singular "day" for 1-day plans', () => {
    render(<PlanCard plan={{ ...basePlan, days: 1 }} />);
    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('renders the formatted start date', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByText('Jun 1, 2026')).toBeInTheDocument();
  });

  it('renders "No date set" when startDate is null', () => {
    render(<PlanCard plan={{ ...basePlan, startDate: null }} />);
    expect(screen.getByText('No date set')).toBeInTheDocument();
  });

  it('renders the city image when pictures are present', () => {
    render(<PlanCard plan={basePlan} />);
    expect(screen.getByAltText('Paris')).toBeInTheDocument();
  });

  it('shows no image element when city pictures array is empty', () => {
    render(<PlanCard plan={{ ...basePlan, city: { ...basePlan.city, pictures: [] } }} />);
    expect(screen.queryByAltText('Paris')).not.toBeInTheDocument();
  });

  it('links to the correct plan page', () => {
    render(<PlanCard plan={basePlan} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/plans/1');
  });
});
