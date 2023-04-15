import { Amplify } from "aws-amplify"
import { useMemo } from "react"

import { AuthProvider } from "../controllers/auth"
import {
  AccessPolicyManagerContext,
  AccessPolicyManager,
  ContentFirewall
} from "../controllers/policy"
import awsExports from "../aws-exports"

import "../styles/globals.scss"
import Styles from "../styles/pages/_app.module.scss"

// Configure amplify
Amplify.configure(awsExports)

function WhitePage() {
  return <div className={Styles.WhitePage} />
}

export default function App({ Component, pageProps }) {
  const placeholder = useMemo(() => <WhitePage />, [])

  return (
    <AccessPolicyManagerContext.Provider
      value={AccessPolicyManager(Component.accessPolicies || [])}
    >
      <AuthProvider placeholder={placeholder}>
        <ContentFirewall>
          <Component {...pageProps} />
        </ContentFirewall>
      </AuthProvider>
    </AccessPolicyManagerContext.Provider>
  )
}
