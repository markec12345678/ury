import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Avatar, avatarVariants, avatarFallbackVariants } from './avatar';

describe('Avatar', () => {
  it('renders fallback initials when no src', () => {
    render(<Avatar fallback="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders "?" when no fallback text', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders single initial for single word fallback', () => {
    render(<Avatar fallback="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User avatar" />);
    const img = screen.getByAltText('User avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('falls back to initials on image error', () => {
    render(<Avatar src="https://broken.jpg" fallback="Jane Doe" alt="User" />);
    const img = screen.getByAltText('User');
    fireEvent(img, new Event('error'));
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies default size class (h-10 w-10)', () => {
    const { container } = render(<Avatar fallback="AB" />);
    const avatarDiv = container.querySelector('.rounded-full') as HTMLElement;
    expect(avatarDiv.className).toContain('h-10');
    expect(avatarDiv.className).toContain('w-10');
  });

  it('applies sm size class', () => {
    const { container } = render(<Avatar fallback="AB" size="sm" />);
    const avatarDiv = container.querySelector('.rounded-full') as HTMLElement;
    expect(avatarDiv.className).toContain('h-8');
    expect(avatarDiv.className).toContain('w-8');
  });

  it('applies lg size class', () => {
    const { container } = render(<Avatar fallback="AB" size="lg" />);
    const avatarDiv = container.querySelector('.rounded-full') as HTMLElement;
    expect(avatarDiv.className).toContain('h-12');
    expect(avatarDiv.className).toContain('w-12');
  });

  it('applies square shape class', () => {
    const { container } = render(<Avatar fallback="AB" shape="square" />);
    const avatarDiv = container.querySelector('.rounded-lg') as HTMLElement;
    expect(avatarDiv).toBeInTheDocument();
  });

  it('renders status indicator when status is provided', () => {
    render(<Avatar fallback="AB" status="online" />);
    expect(screen.getByLabelText('Status: online')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar fallback="AB" className="custom-class" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Avatar fallback="AB" ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('has displayName "Avatar"', () => {
    expect(Avatar.displayName).toBe('Avatar');
  });
});

describe('avatarVariants', () => {
  it('exports avatarVariants as a function', () => {
    expect(typeof avatarVariants).toBe('function');
  });

  it('returns base class names for default size and shape', () => {
    const result = avatarVariants();
    expect(result).toContain('rounded-full');
    expect(result).toContain('h-10');
  });

  it('returns xs size classes', () => {
    const result = avatarVariants({ size: 'xs' });
    expect(result).toContain('h-6');
  });

  it('returns xl size classes', () => {
    const result = avatarVariants({ size: 'xl' });
    expect(result).toContain('h-16');
  });

  it('returns square shape classes', () => {
    const result = avatarVariants({ shape: 'square' });
    expect(result).toContain('rounded-lg');
  });
});

describe('avatarFallbackVariants', () => {
  it('exports avatarFallbackVariants as a function', () => {
    expect(typeof avatarFallbackVariants).toBe('function');
  });

  it('returns default color classes', () => {
    const result = avatarFallbackVariants();
    expect(result).toContain('bg-gray-200');
  });

  it('returns success color classes', () => {
    const result = avatarFallbackVariants({ color: 'success' });
    expect(result).toContain('bg-green-100');
  });

  it('returns danger color classes', () => {
    const result = avatarFallbackVariants({ color: 'danger' });
    expect(result).toContain('bg-red-100');
  });
});
