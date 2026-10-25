import { Heading, type HeadingProps } from '@chakra-ui/react';

const variants = {
  page: { size: 'md', color: 'gray.800' },
  section: { size: 'sm', color: 'gray.800' },
  hero: { size: 'lg', color: 'gray.800' },
} as const;

export type GenericHeadingVariant = keyof typeof variants;

export type GenericHeadingProps = HeadingProps & {
  variant?: GenericHeadingVariant;
};

export function GenericHeading({ variant = 'page', ...props }: GenericHeadingProps) {
  const style = variants[variant];
  return <Heading size={style.size} color={style.color} {...props} />;
}
