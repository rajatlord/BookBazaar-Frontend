// ════════════════════════════════════════════════════════════
// FILE 2: src/App.tsx
//
// TEACH — Two providers wrap the entire app here:
//
// ConfigProvider (AntD):
//   Every AntD component inside reads design tokens from this.
//   It's React Context under the hood. Must be the outermost
//   AntD wrapper so LoginPage and AdminPage both get the theme.
//
// AntdApp (AntD):
//   Enables message.success(), modal.confirm(), notification.open()
//   to work correctly inside function components. Without it,
//   those APIs may silently fail in AntD v5. Always include it
//   directly inside ConfigProvider.
//
// RouterProvider (React Router v6):
//   Takes the router object from router.tsx and renders
//   whichever route matches the current URL.
//   This replaces the old <BrowserRouter><Routes> pattern.
//
// Order matters:
//   ConfigProvider → AntdApp → RouterProvider
//   Theme must wrap everything. AntdApp must wrap the router
//   so message/modal work on all pages including error pages.
// ════════════════════════════════════════════════════════════
 
import React from 'react'
import { ConfigProvider, App as AntdApp } from 'antd'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { themeConfig } from './theme/ThemeConfig.ts'
 
const App: React.FC = () => (
  <ConfigProvider theme={themeConfig}>
    <AntdApp>
      <RouterProvider router={router} />
    </AntdApp>
  </ConfigProvider>
)
 
export default App
 