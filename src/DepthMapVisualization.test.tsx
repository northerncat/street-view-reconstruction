import React from 'react';
import { render, screen } from '@testing-library/react';
import DepthMapVisualization from './DepthMapVisualization';

test('renders lat long', () => {
  render(<DepthMapVisualization />);
  const latitudeHeader = screen.getByText(/Latitude/i);
  expect(latitudeHeader).toBeInTheDocument();
  const longitudeHeader = screen.getByText(/Longitude/i);
  expect(longitudeHeader).toBeInTheDocument();
});
