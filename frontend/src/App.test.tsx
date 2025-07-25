import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('CyberGuard App', () => {
  test('renders login/register screen initially', () => {
    render(<App />);
    // Auth screen should have Login or Register heading
    expect(
      screen.getByRole('heading', { name: /login|register/i })
    ).toBeInTheDocument();
  });

  test('has username and password inputs', () => {
    render(<App />);
    // Username input
    expect(
      screen.getByPlaceholderText(/username/i)
    ).toBeInTheDocument();
    // Password input
    expect(
      screen.getByPlaceholderText(/password/i)
    ).toBeInTheDocument();
  });

  test('switch to register form', () => {
    render(<App />);
    // Click the "No account? Register" button to toggle
    const toggleBtn = screen.getByRole('button', {
      name: /no account\? register/i,
    });
    toggleBtn.click();
    expect(
      screen.getByRole('heading', { name: /register/i })
    ).toBeInTheDocument();
  });

  test('file upload and dashboard present after login (mock)', () => {
    // simulate token to skip Auth for test purposes
    localStorage.setItem('token', 'test-token');
    render(<App />);
    // Dashboard greeting or upload should be visible
    expect(
      screen.getByText(/upload security log/i)
    ).toBeInTheDocument();
    // File upload input
    expect(
      screen.getByLabelText(/file/i) || screen.getByRole('button', { name: /analyze/i })
    ).toBeInTheDocument();
    // Clean up for future tests
    localStorage.removeItem('token');
  });
});
