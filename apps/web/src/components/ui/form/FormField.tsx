import { Stack } from '@chakra-ui/react';
import type { LabelHTMLAttributes, ReactNode } from 'react';

export type FormFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
};

const labelStyle: LabelHTMLAttributes<HTMLLabelElement>['style'] = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--chakra-colors-gray-700)',
  display: 'block',
};

export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <Stack gap={1.5} w="full">
      <label htmlFor={htmlFor} style={labelStyle}>
        {label}
      </label>
      {children}
    </Stack>
  );
}
