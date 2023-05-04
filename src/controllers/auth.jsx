import { Auth, Hub } from "aws-amplify"
import { createContext, useEffect, useContext, useState, useRef } from "react"

export const AuthContext = createContext({
  userIsAuthenticated: false,
  user: null
})

export const useAuth = () => useContext(AuthContext)

export function useLastAuth() {
  const auth = useAuth()
  const authRef = useRef(auth)

  authRef.current = auth.userIsAuthenticated ? auth : authRef.current
  return authRef.current
}

export function AuthProvider({ children, placeholder }) {
  const [isCheckingForUser, setIsCheckingForUser] = useState(true)
  const [authContextValue, setAuthContextValue] = useState({
    userIsAuthenticated: false,
    user: null
  })

  useEffect(() => {
    ;(async () => {
      try {
        setAuthContextValue({
          userIsAuthenticated: true,
          user: await Auth.currentAuthenticatedUser()
        })
        setIsCheckingForUser(false)
      } catch (error) {
        setIsCheckingForUser(false)
      }

      Hub.listen("auth", ({ payload }) => {
        const { event, data } = payload
        if (event === "signIn")
          setAuthContextValue({ userIsAuthenticated: true, user: data })
        if (event === "signOut")
          setAuthContextValue({ userIsAuthenticated: false, user: null })
      })
    })()
  }, [])

  return (
    <AuthContext.Provider value={authContextValue}>
      {isCheckingForUser ? placeholder : children}
    </AuthContext.Provider>
  )
}
