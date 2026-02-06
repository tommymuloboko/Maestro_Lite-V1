import { createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';

// Green — system chrome: sidebar, nav, success states
const brandGreen: MantineColorsTuple = [
  '#e6fff0',
  '#c3f9d8',
  '#8cf0b8',
  '#4de894',
  '#22c55e', // main
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d',
  '#0d3320',
];

// Fuel Orange — action & attention: CTA buttons, warnings, highlights
const fuelOrange: MantineColorsTuple = [
  '#fff7ed',
  '#ffedd5',
  '#fed7aa',
  '#fdba74',
  '#f97316', // main fuel orange
  '#ea580c',
  '#c2410c',
  '#9a3412',
  '#7c2d12',
  '#431407',
];

export const themeTokens = {
  green: {
    50:  '#e6fff0',
    100: '#c3f9d8',
    200: '#8cf0b8',
    300: '#4de894',
    400: '#22c55e',
    500: '#16a34a',
    600: '#15803d',
    700: '#166534',
    800: '#14532d',
    900: '#0d3320',
  },
  fuelOrange: {
    50:  '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#f97316',
    500: '#ea580c',
    600: '#c2410c',
    700: '#9a3412',
    800: '#7c2d12',
    900: '#431407',
  },
} as const;

export const mantineTheme = createTheme({
  primaryColor: 'fuel',
  colors: {
    brand: brandGreen,
    fuel: fuelOrange,
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'xs',
      },
    },
  },
});
