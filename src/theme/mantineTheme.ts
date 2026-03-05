import { createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';

// Green — QuickBooks Green
const brandGreen: MantineColorsTuple = [
  '#ebf6e7',
  '#d7eed1',
  '#abdd9d',
  '#81cc69',
  '#56ba34',
  '#2ca01c', // main quickbooks green
  '#217f14',
  '#195e0e',
  '#103e08',
  '#061f03',
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
  brand: {
    50:  '#ebf6e7',
    100: '#d7eed1',
    200: '#abdd9d',
    300: '#81cc69',
    400: '#56ba34',
    500: '#2ca01c',
    600: '#217f14',
    700: '#195e0e',
    800: '#103e08',
    900: '#061f03',
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
  primaryColor: 'brand',
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
