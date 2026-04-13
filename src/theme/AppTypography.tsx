// ─────────────────────────────────────────────────────────────
// AppTypography.tsx
//
// TEACH: This is a "wrapper component" pattern — the same one
// your company_code uses. Instead of calling AntD's Typography
// directly everywhere (which scatters styling decisions across
// 50 files), you own ONE component that:
//   1. Reads design tokens from themeTypography
//   2. Maps to the correct AntD Title/Paragraph level
//   3. Applies color from AntD's token system
//
// Result: change a font size in one place → updates everywhere.
// This is the "Single Responsibility" principle in action.
// ─────────────────────────────────────────────────────────────

import { Typography as AntTypography, theme } from 'antd'
import React from 'react'
import { themeTypography, TypographyVariant } from '@/theme/typography'

const { Title, Paragraph } = AntTypography

type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'link'
  | 'success'
  | 'heading'
  | 'text'

interface TypographyProps {
  variant?: TypographyVariant
  color?: ColorVariant
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export const Typography = ({
  variant = 'bodyMedium',
  color,
  children,
  style,
  className,
}: TypographyProps) => {
  // TEACH: theme.useToken() gives us live access to AntD's
  // computed token values (respects ConfigProvider overrides).
  // Never hardcode colors inside components — always pull from
  // the token system so dark mode / theme changes work for free.
  const { token } = theme.useToken()

  const colorMap: Record<ColorVariant, string> = {
    primary:   token.colorText,
    secondary: token.colorTextSecondary,
    danger:    token.colorError,
    success:   token.colorSuccess,
    link:      token.colorLink,
    heading:   token.colorTextHeading,
    text:      token.colorText,
  }

  const baseStyle = themeTypography[variant]
  const mergedStyle: React.CSSProperties = {
    ...baseStyle,
    ...(color ? { color: colorMap[color] } : {}),
    margin: 0,
    ...style,
  }

  // TEACH: We use startsWith() to map variant names to heading
  // levels. 'h1Bold' → level 1, 'h2Semibold' → level 2, etc.
  // The font weight comes from themeTypography, not from AntD's
  // level — that's why we spread baseStyle into the inline style.
  if (variant.startsWith('h1'))
    return <Title level={1} style={mergedStyle} className={className}>{children}</Title>
  if (variant.startsWith('h2'))
    return <Title level={2} style={mergedStyle} className={className}>{children}</Title>
  if (variant.startsWith('h3'))
    return <Title level={3} style={mergedStyle} className={className}>{children}</Title>
  if (variant.startsWith('h4'))
    return <Title level={4} style={mergedStyle} className={className}>{children}</Title>
  if (variant.startsWith('h5'))
    return <Title level={5} style={mergedStyle} className={className}>{children}</Title>

  return (
    <Paragraph style={mergedStyle} className={className}>
      {children}
    </Paragraph>
  )
}