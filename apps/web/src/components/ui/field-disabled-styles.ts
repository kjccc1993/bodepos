export const DISABLED_FIELD = {
  bg: 'gray.100',
  borderColor: 'gray.200',
  color: 'gray.500',
} as const;

export const disabledFieldStyles = {
  _disabled: {
    opacity: 1,
    cursor: 'not-allowed',
    bg: DISABLED_FIELD.bg,
    borderColor: DISABLED_FIELD.borderColor,
    color: DISABLED_FIELD.color,
  },
} as const;

export const disabledFieldRootStyles = {
  _disabled: { opacity: 1 },
} as const;
