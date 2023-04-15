import { useRouter } from "next/router"
import { useAuth } from "./auth"

export const AccessPolicyTypes = {
  USER_IS_AUTHENTICATED: "USER_IS_AUTHENTICATED",
  USER_IS_GUEST: "USER_IS_GUEST"
}

const AccessPolicyManager = (() => {
  const ignoredPolicyTypes = new Set()
  return {
    ignoreType(policyType) {
      if (!Object.prototype.hasOwnProperty.call(AccessPolicyTypes, policyType))
        throw new RangeError(`Unknown policy: '${policyType}'`)
      ignoredPolicyTypes.add(policyType)
    },

    isIgnoredType(policyType) {
      return ignoredPolicyTypes.has(policyType)
    },

    includeType(policyType) {
      if (!Object.prototype.hasOwnProperty.call(AccessPolicyTypes, policyType))
        throw new RangeError(`Unknown policy: '${policyType}'`)

      if (ignoredPolicyTypes.has(policyType))
        ignoredPolicyTypes.delete(policyType)
    }
  }
})()

export const useAccessPolicyManager = () => AccessPolicyManager

export function ContentFirewall({ accessPolicies, children }) {
  const router = useRouter()
  const auth = useAuth()
  const accessPolicyManager = useAccessPolicyManager()

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
    if (!policyIsMet && !accessPolicyManager.isIgnoredType(policyType)) {
      redirectURL = alternateSource
      break
    }
  }

  if (typeof redirectURL === "string" && redirectURL !== "")
    router.replace(redirectURL)
  else return children
}
