import { useRouter } from "next/router"
import { useAuth } from "./auth"

export const AccessPolicyTypes = {
  USER_IS_AUTHENTICATED: Symbol("USER_IS_AUTHENTICATED"),
  USER_IS_GUEST: Symbol("USER_IS_GUEST")
}

export function ContentFirewall({ accessPolicies, children }) {
  const router = useRouter()
  const auth = useAuth()

  const accessPolicyVerifiers = {
    [AccessPolicyTypes.USER_IS_AUTHENTICATED]: () => auth.userIsAuthenticated,
    [AccessPolicyTypes.USER_IS_GUEST]: () => !auth.userIsAuthenticated
  }

  let redirectURL = null

  for (let i = 0; i < accessPolicies.length; i += 1) {
    const { type: policyType, alternateSource } = accessPolicies[i]
    const policyVerifier = accessPolicyVerifiers[policyType]

    if (typeof policyVerifier !== "function")
      throw new Error(`Unknown access policy with id: ${String(policyType)}`)

    const policyIsMet = policyVerifier() === true
    if (!policyIsMet) {
      redirectURL = alternateSource
      break
    }
  }

  if (typeof redirectURL === "string" && redirectURL !== "")
    router.replace(redirectURL)
  else return children
}
