import { useRouter } from "next/router"
import { useAuth } from "../react-utils/auth"

export const AccessPolicyIDs = {
  USER_IS_AUTHENTICATED: Symbol("USER_IS_AUTHENTICATED"),
  USER_IS_GUEST: Symbol("USER_IS_GUEST")
}

export default function AccessPolicyEnforcer({ accessPolicies, children }) {
  const router = useRouter()
  const auth = useAuth()

  const accessPolicyVerifiers = {
    [AccessPolicyIDs.USER_IS_AUTHENTICATED]: () => auth.userIsAuthenticated,
    [AccessPolicyIDs.USER_IS_GUEST]: () => !auth.userIsAuthenticated
  }

  let redirectURL = null

  for (let i = 0; i < accessPolicies.length; i += 1) {
    const { id: policyId, alternatePage } = accessPolicies[i]
    const policyVerifier = accessPolicyVerifiers[policyId]

    if (typeof policyVerifier !== "function")
      throw new Error(`Unknown access policy with id: ${String(policyId)}`)

    const policyIsMet = policyVerifier() === true
    if (!policyIsMet) {
      redirectURL = alternatePage
      break
    }
  }

  if (typeof redirectURL === "string" && redirectURL !== "")
    router.replace(redirectURL)
  else return children
}
