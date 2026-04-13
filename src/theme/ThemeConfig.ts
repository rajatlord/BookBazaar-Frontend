// ─────────────────────────────────────────────────────────────
// ThemeConfig.ts
//
// TEACH: Ant Design 5 uses a "Design Token" system — instead of
// overriding CSS class names (fragile, breaks on AntD updates),
// you pass a theme object to <ConfigProvider>. Every component
// reads from this single source of truth.
//
// Think of it like CSS variables but for a component library.
// Change colorPrimary here → every Button, Link, Checkbox, Tab
// in the entire app updates automatically. Zero hunting.
// ─────────────────────────────────────────────────────────────

import type { ThemeConfig } from 'antd'
import { colors } from './colors'

export const themeConfig: ThemeConfig = {
  token: {
    // ── Brand ───────────────────────────────────────────────
    colorPrimary:       colors.primary,       // #0071e3 — Apple blue
    colorLink:          colors.primary,
    colorSuccess:       colors.success,
    colorWarning:       colors.warning,
    colorError:         colors.danger,

    // ── Backgrounds ─────────────────────────────────────────
    // TEACH: colorBgBase is the page background.
    // Apple uses #f5f5f7 (warm off-white) not pure white.
    colorBgBase:        colors.bgBase,
    colorBgContainer:   colors.bgWhite,

    // ── Typography ──────────────────────────────────────────
    // TEACH: AntD's fontSize is the BASE size. LG/SM are derived.
    // Setting fontFamily here replaces AntD's default (Segoe UI)
    // with Apple's SF Pro stack across ALL components.
    fontFamily:
      '"SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    fontSize:     15,
    fontSizeLG:   17,
    fontSizeSM:   13,
    lineHeight:   1.6,

    // ── Radius ──────────────────────────────────────────────
    // TEACH: Apple uses generous rounding (12–16px on containers,
    // 980px on pill buttons). We set the base and override per
    // component below in the `components` section.
    borderRadius:   12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,

    // ── Controls (inputs, selects, buttons height) ───────────
    controlHeight:   40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    // ── Shadows ─────────────────────────────────────────────
    // Apple uses very subtle shadows, not none.
    boxShadow:          '0 2px 8px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.05)',
    boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.08)',
  },

  // ── Component-level overrides ─────────────────────────────
  // TEACH: When a token doesn't give you enough control,
  // AntD lets you override per-component. These take priority
  // over global tokens for that specific component only.
  components: {
    Button: {
      // 980px radius = pill shape (Apple's signature)
      borderRadius:   980,
      borderRadiusSM: 980,
      borderRadiusLG: 980,
      fontWeight:     500,
      controlHeight:   40,
      controlHeightLG: 48,
      paddingInline:   22,
      paddingInlineLG: 28,
    },
    Input: {
      borderRadius:       12,
      controlHeight:      44,
      // Apple inputs: gray bg at rest, white on focus
      colorBgContainer:   '#f5f5f7',
      activeBorderColor:  colors.primary,
      activeShadow:       '0 0 0 3px rgba(0,113,227,0.15)',
    },
    Select: {
      borderRadius:     12,
      controlHeight:    44,
      colorBgContainer: '#f5f5f7',
    },
    Card: {
      borderRadius:    16,
      // TEACH: We set boxShadow on Card to override the global
      // token. Cards get a slightly stronger shadow than default.
      boxShadow:       '0 2px 12px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
      paddingLG:       24,
      colorBorderSecondary: 'transparent',
    },
    Table: {
      borderRadius:       12,
      headerBorderRadius: 12,
    },
    Tag: {
      borderRadius: 980, 
    },
    Modal: {
      borderRadius:       20,
      borderRadiusOuter:  20,
    },
    Notification: {
      borderRadius: 16,
    },
    Message: {
      borderRadius: 12,
    },
    Badge: {
      borderRadius: 980,
    },
    Pagination: {
      borderRadius: 8,
    },
    Form: {
      labelFontSize: 13,
    },
  },
}