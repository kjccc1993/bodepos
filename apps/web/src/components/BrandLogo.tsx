import { Image, type ImageProps } from '@chakra-ui/react';

const LOGO_SRC = '/logo-bodepos.png';

type BrandLogoProps = Omit<ImageProps, 'src' | 'alt'> & {
  size?: 'sm' | 'md' | 'lg';
};

const heights = { sm: '8', md: '10', lg: '14' } as const;

export function BrandLogo({ size = 'md', ...props }: BrandLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="BodePOS"
      h={heights[size]}
      w="auto"
      objectFit="contain"
      {...props}
    />
  );
}
