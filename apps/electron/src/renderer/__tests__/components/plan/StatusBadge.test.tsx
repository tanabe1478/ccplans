import { StatusBadge } from '@components/plan/StatusBadge';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('StatusBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders normalized label for legacy status', () => {
    render(<StatusBadge status={'draft'} />);
    expect(screen.getByText('ToDo')).toBeDefined();
  });
});
