// Design tokens for Partito - exported for use in components
export const tokens = {
  colors: {
    coral: 'hsl(var(--coral))',
    coralLight: 'hsl(var(--coral-light))',
    coralDark: 'hsl(var(--coral-dark))',
    white: 'hsl(var(--white))',
    cream: 'hsl(var(--cream))',
    warmGray50: 'hsl(var(--warm-gray-50))',
    warmGray100: 'hsl(var(--warm-gray-100))',
    warmGray200: 'hsl(var(--warm-gray-200))',
    warmGray300: 'hsl(var(--warm-gray-300))',
    warmGray400: 'hsl(var(--warm-gray-400))',
    warmGray500: 'hsl(var(--warm-gray-500))',
    warmGray700: 'hsl(var(--warm-gray-700))',
    warmGray900: 'hsl(var(--warm-gray-900))',
    honey: 'hsl(var(--honey))',
    sage: 'hsl(var(--sage))',
    sky: 'hsl(var(--sky))',
    success: 'hsl(var(--success))',
    error: 'hsl(var(--error))',
    warning: 'hsl(var(--warning))',
    info: 'hsl(var(--info))',
  },
  fonts: {
    heading: 'var(--font-heading)',
    body: 'var(--font-body)',
  },
} as const;

export type TokenColors = keyof typeof tokens.colors;
