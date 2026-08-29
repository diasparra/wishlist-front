import { Alert, Link } from '@mui/material'

const REPO_URL = 'https://github.com/Deathblood69/whislist-front'

/**
 * Shown only in the read-only GitHub Pages build: tells visitors this is a
 * throwaway demo. Renders nothing in a writable build.
 */
export default function DemoBanner() {
  if (import.meta.env.VITE_READONLY !== 'true') {
    return null
  }

  return (
    <Alert severity="info" sx={{ borderRadius: 0 }}>
      Read-only demo — changes aren&apos;t saved and the data resets on every
      deploy.{' '}
      <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
        Source
      </Link>
    </Alert>
  )
}
