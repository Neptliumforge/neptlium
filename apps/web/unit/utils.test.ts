import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('resolves conflicting Tailwind utilities', () => {
    expect(cn('px-2', false, 'px-4', ['text-sm', 'text-lg'])).toBe('px-4 text-lg');
  });

  it('combines nested arrays and conditional classes while omitting falsey inputs', () => {
    expect(
      cn('block', null, undefined, false, ['text-sm', ['font-medium']], {
        'opacity-50': true,
        hidden: false,
      }),
    ).toBe('block text-sm font-medium opacity-50');
  });

  it('keeps responsive and state variants independent when resolving conflicts', () => {
    expect(cn('p-2', 'md:p-4', 'hover:p-3', 'md:p-6', 'p-8')).toBe('hover:p-3 md:p-6 p-8');
  });

  it('returns no classes for empty input', () => {
    expect(cn()).toBe('');
    expect(cn('', false, null, undefined, [], {})).toBe('');
  });
});
