import { Text, type TextProps } from '@chakra-ui/react';

const variants = {
  body: { fontSize: 'sm', color: 'gray.800' },
  muted: { fontSize: 'sm', color: 'gray.600' },
  caption: { fontSize: 'xs', color: 'gray.500' },
  micro: { fontSize: '2xs', color: 'gray.500' },
  label: { fontSize: 'sm', fontWeight: 'medium', color: 'gray.700' },
  error: { fontSize: 'sm', color: 'red.500' },
  strong: { fontSize: 'sm', fontWeight: 'semibold', color: 'gray.900' },
  price: { fontSize: 'md', fontWeight: 'bold', color: 'brand.600' },
  success: { fontSize: 'xs', fontWeight: 'semibold', color: 'green.700' },
} as const;

export type GenericTextVariant = keyof typeof variants;

export type GenericTextProps = TextProps & {
  variant?: GenericTextVariant;
};

export function GenericText({ variant = 'body', ...props }: GenericTextProps) {
  return <Text {...variants[variant]} {...props} />;
}
