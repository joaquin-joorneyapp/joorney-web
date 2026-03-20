import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NearbyActivityCard from './NearbyActivityCard';

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

describe('NearbyActivityCard', () => {
  it('renders the activity title', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
  });

  it('renders the first category title', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('does not render a category element when categories is empty', () => {
    render(<NearbyActivityCard activity={{ ...baseActivity, categories: [] }} />);
    expect(screen.queryByText('Outdoor')).not.toBeInTheDocument();
  });

  it('renders the distance', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByText('2.5 km')).toBeInTheDocument();
  });

  it('renders the activity image when pictures are present', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    expect(screen.getByAltText('Test Activity')).toBeInTheDocument();
  });

  it('links to the correct activity page', () => {
    render(<NearbyActivityCard activity={baseActivity} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cities/paris/activities/test-activity');
  });
});
