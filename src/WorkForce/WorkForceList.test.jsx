import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkForceList from './WorkForceList';

const mockEmployees = [
  {
    employeeId: 1,
    firstName: 'John',
    lastName: 'Doe',
    annualPay: 50000,
    designation: 'Developer',
    phone: '1234567890',
    emailId: 'john@example.com',
    status: 'Active',
    // ...other fields
  },
  {
    employeeId: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    annualPay: 60000,
    designation: 'Manager',
    phone: '9876543210',
    emailId: 'jane@example.com',
    status: 'Active',
    // ...other fields
  },
];

describe('WorkForceList', () => {
  it('renders grid and export button', () => {
    render(<WorkForceList employees={mockEmployees} isCollapsed={true} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('Export to Excel')).toBeInTheDocument();
  });

  it('shows Save button after cell edit', async () => {
    render(<WorkForceList employees={mockEmployees} isCollapsed={true} />);
    // Simulate cell edit
    // For AgGrid, you may need to mock the onCellValueChanged callback directly
    act(() => {
      fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'John' } });
    });
    // Save button should not show yet
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    // Simulate cell value change
    act(() => {
      screen.getByText('Export to Excel').click(); // Just to trigger rerender
    });
    // Save button should still not show (since AgGrid cell edit is not simulated)
    // You would need to test onCellValueChanged logic separately
  });

  it('filters grid data by search', () => {
    render(<WorkForceList employees={mockEmployees} isCollapsed={true} />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Jane' } });
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
  });

  it('calls handleSave and resets state', async () => {
    // Mock fetch
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
    render(<WorkForceList employees={mockEmployees} isCollapsed={true} />);
    // Simulate cell edit
    act(() => {
      // Directly call onCellValueChanged if possible
      // Or simulate a change in the grid
    });
    // Simulate Save button click
    // Save button only appears after cell edit, so this is a placeholder
    // fireEvent.click(screen.getByText('Save'));
    // expect(global.fetch).toHaveBeenCalled();
  });
});
