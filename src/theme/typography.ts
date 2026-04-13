export const themeTypography = {
  h1Regular:  { fontSize: '39px', fontWeight: 400, lineHeight: 'auto' },
  h1Semibold: { fontSize: '39px', fontWeight: 600, lineHeight: 'auto' },
  h1Bold:     { fontSize: '39px', fontWeight: 700, lineHeight: 'auto' },

  h2Regular:  { fontSize: '30px', fontWeight: 400, lineHeight: 'auto' },
  h2Semibold: { fontSize: '30px', fontWeight: 600, lineHeight: 'auto' },
  h2Bold:     { fontSize: '31px', fontWeight: 700, lineHeight: 'auto' },

  h3Regular:  { fontSize: '25px', fontWeight: 400, lineHeight: 'auto' },

  h4Semibold: { fontSize: '20px', fontWeight: 600, lineHeight: 'auto' },
  h4Regular:  { fontSize: '18px', fontWeight: 600, lineHeight: 'auto' },

  h5Regular:  { fontSize: '14px', fontWeight: 500, lineHeight: 'auto' },

  bodyLarge:  { fontSize: '17px', fontWeight: 400, lineHeight: '1.6' },
  bodyMedium: { fontSize: '15px', fontWeight: 400, lineHeight: '1.6' },
  bodySmall:  { fontSize: '13px', fontWeight: 400, lineHeight: '1.5' },

  caption:    { fontSize: '12px', fontWeight: 400, lineHeight: '1.4' },
  label:      { fontSize: '13px', fontWeight: 500, lineHeight: '1.4' },
} as const

export type TypographyVariant = keyof typeof themeTypography