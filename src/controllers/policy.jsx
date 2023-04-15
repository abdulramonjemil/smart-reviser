import { useRouter } from "next/router"
import { createContext, useContext } from "react"
import { useAuth } from "./auth"

export const AccessPolicyTypes = {
  USER_IS_AUTHENTICATED: "USER_IS_AUTHENTICATED",
  USER_IS_GUEST: "USER_IS_GUEST"
}

export function AccessPolicyManager(accessPolicies) {
  const ignoredTypes = new Set()
  return {
    accessPolicies,
    ignoreType(policyType) {
      if (!Object.prototype.hasOwnProperty.call(AccessPolicyTypes, policyType))
        throw new RangeError(`Unknown policy: '${policyType}'`)
      ignoredTypes.add(policyType)
    },

    isIgnoredType(policyType) {
      return ignoredTypes.has(policyType)
    },

    includeType(policyType) {
      if (!Object.prototype.hasOwnProperty.call(AccessPolicyTypes, policyType))
        throw new RangeError(`Unknown policy: '${policyType}'`)

      if (ignoredTypes.has(policyType)) ignoredTypes.delete(policyType)
    },

    resetIgnoredTypes() {
      ignoredTypes.clear()
    }
  }
}

export const AccessPolicyManagerContext = createContext(AccessPolicyManager([]))
export const useAccessPolicyManager = () =>
  useContext(AccessPolicyManagerContext)

export function ContentFirewall({ children }) {
  const router = useRouter()
  const auth = useAuth()
  const accessPolicyManager = useAccessPolicyManager()

  const { accessPolicies } = accessPolicyManager
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
