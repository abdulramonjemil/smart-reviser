import { Amplify } from "aws-amplify"
import { AuthProvider } from "../controllers/auth"

import {
  AccessPolicyManagerContext,
  AccessPolicyManager,
  ContentFirewall
} from "../controllers/policy"

import awsExports from "../aws-exports"

import "../styles/globals.scss"
import Styles from "../styles/pages/_app.module.scss"

// Configure amplify (ssr is enabled for api routes)
Amplify.configure({ ...awsExports, ssr: true })

function PageLoader() {
  return (
    <div className={Styles.PageLoader}>
      <span className={Styles.PageLoader__Item} />
    </div>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <AccessPolicyManagerContext.Provider
      value={AccessPolicyManager(Component.accessPolicies || [])}
    >
      <AuthProvider placeholder={<PageLoader />}>
        <ContentFirewall>
          <Component {...pageProps} />
        </ContentFirewall>
      </AuthProvider>
    </AccessPolicyManagerContext.Provider>
  )
}
