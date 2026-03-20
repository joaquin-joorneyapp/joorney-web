import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityCard from './ActivityCard';

const baseActivity = {
  id: 1,
  name: 'test-activity',
  title: 'Test Activity',
  description: '',
  address: '',
  duration: 90,
  latitude: 48.85,
  longitude: 2.35,
  distance: 2.5,
  pictures: [{ url: 'path/to/image.jpg' }],
  categories: [{ id: 1, title: 'Outdoor' }],
  city: { id: 1, name: 'paris', title: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35, pictures: [] },
  cityId: 1,
};

describe('ActivityCard', () => {
  it('renders the activity title', () => {
    render(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
  });

  it('renders the category', () => {
    render(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('renders the distance', () => {
    render(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('2.5 km')).toBeInTheDocument();
  });

  it('renders duration correctly for >= 60 minutes', () => {
    render(<ActivityCard activity={baseActivity} />);
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
  });

  it('renders duration correctly for < 60 minutes', () => {
    render(<ActivityCard activity={{ ...baseActivity, duration: 45 }} />);
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('renders the activity image when pictures are present', () => {
    render(<ActivityCard activity={baseActivity} />);
    const img = screen.getByAltText('Test Activity');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('path/to/image.jpg'));
  });

  it('shows no image element when pictures array is empty', () => {
    render(<ActivityCard activity={{ ...baseActivity, pictures: [] }} />);
    expect(screen.queryByAltText('Test Activity')).not.toBeInTheDocument();
  });

  it('links to the correct activity page', () => {
    render(<ActivityCard activity={baseActivity} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cities/paris/activities/test-activity');
  });
});
