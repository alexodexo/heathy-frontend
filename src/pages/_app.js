// src/pages/_app.js
import '@/styles/globals.css'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import { SWRConfig } from 'swr'
import { globalSWRConfig } from '@/lib/swrConfig'

export default function App({ Component, pageProps }) {
  return (
    <SWRConfig value={globalSWRConfig}>
      <ErrorBoundary>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ErrorBoundary>
    </SWRConfig>
  )
}