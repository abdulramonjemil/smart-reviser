import { useState } from "react"
import { useRouter } from "next/router"
import { Auth } from "aws-amplify"
import Link from "next/link"
import { BasicLayout } from "../../components/layout"
import {
  AuthContainer,
  AuthFeedback,
  AuthForm,
  SubmitButton,
  TextInput
} from "../../components/auth"

import { SITE_TITLE } from "../../constants/site-details"
import { HOME_PAGE_URL, SIGN_UP_PAGE_URL } from "../../constants/page-urls"

import { scrollToPageTop } from "../../lib/navigation"

import {
  AccessPolicyTypes,
  useAccessPolicyManager
} from "../../controllers/policy"

import AuthStyles from "../../styles/includes/auth.module.scss"
import Styles from "../../styles/pages/auth/signin.module.scss"

const INPUT_IDENTIFIERS = {
  EMAIL: "email",
  PASSWORD: "password"
}

/**
 * These error messages are derived from Amazon Cognito's 'initiateAuth' which
 * is used by Amplify's 'Auth.signIn'
 * These are the errors specific to the user
 */
const MESSAGES_FOR_KNOWN_SIGN_IN_ERRORS = {
  InvalidParameterException: "Email or password incorrect",
  NotAuthorizedException:
    "An error occured. The email or password might be invalid.",
  PasswordResetRequiredException:
    "You need to reset your password in order to log in.",
  TooManyRequestsException: "Too many requests. Please try again later.",
  UserNotConfirmedException:
    "Account is unconfirmed. Visit the signup page to complete sign up.",
  UserNotFoundException: "Invalid email or password"
}

function SignInForm({ isLoading, setFeedback, setIsLoading }) {
  const router = useRouter()
  const accessPolicyManager = useAccessPolicyManager()

  const { EMAIL: EMAIL_IDENTIFIER, PASSWORD: PASSWORD_IDENTIFIER } =
    INPUT_IDENTIFIERS

  async function handleSignInFormSubmit(event) {
    event.preventDefault()

    // Get form data before setting isLoading (which disables the form)
    const formData = new FormData(event.target)
    const email = formData.get(EMAIL_IDENTIFIER)
    const password = formData.get(PASSWORD_IDENTIFIER)

    setIsLoading(true)

    try {
      // Prevent content firewall from redirecting immediately after sign In
      accessPolicyManager.ignoreType(AccessPolicyTypes.USER_IS_GUEST)

      await Auth.signIn(email, password)
      setFeedback({
        message: "Logged in successfully, redirecting in 2 seconds...",
        type: "success"
      })
      scrollToPageTop()

      setTimeout(() => {
        router.push(HOME_PAGE_URL)
      }, 2000)
    } catch (error) {
      accessPolicyManager.includeType(AccessPolicyTypes.USER_IS_GUEST)
      const errorName = error.name
      const knownMessageForError = MESSAGES_FOR_KNOWN_SIGN_IN_ERRORS[errorName]

      setFeedback({
        message:
          typeof knownMessageForError === "string"
            ? knownMessageForError
            : "An error occured, please try again later.",
        type: "error"
      })

      setIsLoading(false)
      scrollToPageTop()
    }
  }

  return (
    <AuthForm disabled={isLoading} handleFormSubmit={handleSignInFormSubmit}>
      <TextInput
        label="Email"
        id={EMAIL_IDENTIFIER}
        name={EMAIL_IDENTIFIER}
        required
        // 'text' is used as type because email triggers browser validation
        // We don't want to trigger any kind of validation
        type="text"
        placeholder="- - - -"
      />

      <TextInput
        label="Password"
        id={PASSWORD_IDENTIFIER}
        name={PASSWORD_IDENTIFIER}
        required
        type="password"
        placeholder="- - - -"
      />

      <SubmitButton showLoader={isLoading} text="Sign in" />
    </AuthForm>
  )
}

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState({ message: "", type: null })

  return (
    <div className={Styles.Container}>
      <BasicLayout pageTitle={`Sign In | ${SITE_TITLE}`}>
        <AuthContainer title="Sign In">
          <AuthFeedback {...feedback} />
          <SignInForm
            isLoading={isLoading}
            setFeedback={setFeedback}
            setIsLoading={setIsLoading}
          />

          <p className={AuthStyles.AuthPrompt}>
            Don't have an account?{" "}
            <Link href={SIGN_UP_PAGE_URL} legacyBehavior passHref>
              <a className={AuthStyles.AuthPrompt__Link}>Sign up</a>
            </Link>{" "}
            instead
          </p>
        </AuthContainer>
      </BasicLayout>
    </div>
  )
}

SignIn.accessPolicies = [
  {
    type: AccessPolicyTypes.USER_IS_GUEST,
    alternateSource: HOME_PAGE_URL
  }
]
