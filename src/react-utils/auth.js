import { createContext, useContext } from "react"

export const AuthContext = createContext({
  userIsAuthenticated: false,
  user: null
})
export const useAuth = () => useContext(AuthContext)
