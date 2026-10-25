export const DISABLED_FIELD = {
  bg: 'gray.100',
  borderColor: 'gray.200',
  color: 'gray.500',
  placeholderColor: 'gray.500',
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

type ResolveDisabledFieldTriggerParams = {
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly enabledBorderColor?: string;
  readonly enabledBg?: string;
};

/** Estilos del trigger cuando `disabled` es explícito (p. ej. date picker). */
export function resolveDisabledFieldTriggerProps({
  disabled = false,
  invalid = false,
  enabledBorderColor = 'gray.300',
  enabledBg = 'white',
}: ResolveDisabledFieldTriggerParams): Record<string, unknown> {
  if (!disabled) {
    return {
      borderColor: invalid ? 'red.500' : enabledBorderColor,
      bg: enabledBg,
    };
  }

  return {
    opacity: 1,
    cursor: 'not-allowed',
    bg: DISABLED_FIELD.bg,
    borderColor: invalid ? 'red.500' : DISABLED_FIELD.borderColor,
    color: DISABLED_FIELD.color,
    ...disabledFieldStyles,
  };
}
