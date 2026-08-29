import { type ReactNode, StrictMode, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { SessionProvider } from '../providers/SessionProvider'
import { WishlistProvider } from '../providers/WishlistProvider'

interface Props {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  const queryClient = useMemo(() => new QueryClient(), [])
  const theme = useMemo(() => createTheme({ colorSchemes: { dark: true } }), [])

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme={true} />
          <SessionProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </SessionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
