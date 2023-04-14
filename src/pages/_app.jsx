import { Amplify } from "aws-amplify"
import { useMemo } from "react"

import AuthProvider from "../components/auth-provider"
import AccessPolicyEnforcer from "../components/access-policy-enforcer"
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
    <AuthProvider placeholder={placeholder}>
      <AccessPolicyEnforcer accessPolicies={Component.accessPolicies || []}>
        <Component {...pageProps} />
      </AccessPolicyEnforcer>
    </AuthProvider>
  )
}
