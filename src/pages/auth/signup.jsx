import { useRef, useState } from "react"
import { Auth } from "aws-amplify"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  AuthContainer,
  AuthFeedback,
  AuthForm,
  SubmitButton,
  TextInput
} from "../../components/auth"

import { BasicLayout } from "../../components/layout"
import { AccessPolicyTypes } from "../../controllers/policy"

import {
  EMAIL_REGEXES,
  FULL_NAME_REGEXES,
  FULL_NAME_REQUIREMENT,
  PASSWORD_REGEXES,
  PASSWORD_REQUIREMENT
} from "../../constants/validation-utils"

import { SITE_TITLE } from "../../constants/site-details"
import { HOME_PAGE_URL, SIGN_IN_PAGE_URL } from "../../constants/page-urls"
import { scrollToPageTop } from "../../lib/navigation"

import AuthStyles from "../../styles/includes/auth.module.scss"
import Styles from "../../styles/pages/auth/signup.module.scss"

const INPUT_IDENTIFIERS = {
  FULL_NAME: "full-name",
  EMAIL: "email",
  PASSWORD: "password",
  PASSWORD_CONFIRMATION: "password-confirmation",
  CONFIRMATION_CODE: "verification-code"
}

/**
 * The following is a list of erorr names that are a result of user
 * input/interaction. Since 'Auth.signUp()' uses Amazon Cognito's 'signUp'
 * under the hood, the following are gotten from the errors section of the
 * 'signUp' page located at
 * https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_SignUp.html#API_SignUp_Errors
 *
 * Note that this only includes errors that are to be made known to the user
 */
const MESSAGES_FOR_KNOWN_SIGN_UP_ERRORS = {
  CodeDeliveryFailureException:
    "Couldn't deliver verification code successfully, please try again.",
  InvalidParameterException: "An error occured. Some inputs may be invalid",
  InvalidPasswordException: "Password doesn't meet the requirements.",
  NotAuthorizedException: "An error occured. Please check and try again.",
  TooManyRequestsException: "Too many requests. Please try again later.",
  UsernameExistsException:
    "The email is already associated with an account. Please login in instead."
}

/**
 * These error codes like the one above are retrieved from Amazon Cognito's
 * 'ConfirmSignUp' used under the hood by Amplify located at
 * https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ConfirmSignUp.html#API_ConfirmSignUp_Errors
 */
const MESSAGES_FOR_KNOWN_SIGN_UP_CONFIRMATION_ERRORS = {
  AliasExistsException:
    "This email address is already in use. Please login or create an account instead.",
  CodeMismatchException:
    "You have entered a wrong code. Please check and re-enter the code.",
  ExpiredCodeException:
    "The code you entered has expired. Please request a new code.",
  InvalidParameterException: "An error occured. Some inputs may be invalid",
  LimitExceededException: "An error occured. Please try again later.",
  NotAuthorizedException:
    "An error occured. Please check and re-enter the code or log in again.",
  TooManyFailedAttemptsException:
    "You have had too many failed attempts. Please try again later.",
  TooManyRequestsException: "Too many requests. Please try again later.",
  UserNotFoundException:
    "The email you're trying to confirm isn't yet registered. Please sign up instead."
}

const MESSAGES_FOR_KNOWN_SIGN_UP_CODE_RESEND_ERRORS = {
  CodeDeliveryFailureException: "Couuldn't deliver code successfully.",
  // On trying to get a code for an email that's confirmed, the
  // 'InvalidParameterException' was thrown.
  InvalidParameterException:
    "An error occured. The email might be confirmed already.",
  NotAuthorizedException: "...",
  TooManyRequestsException: "Too many requests. Please try again later.",
  UserNotFoundException:
    "The email you're trying to confirm isn't yet registered. Please sign up instead."
}

function SignUpForm({
  isLoading,
  setFeedback,
  setIsLoading,
  setSignUpConfirmation
}) {
  const passwordRef = useRef()
  const passwordConfirmationRef = useRef()

  const {
    FULL_NAME: FULL_NAME_IDENTIFIER,
    EMAIL: EMAIL_IDENTIFIER,
    PASSWORD: PASSWORD_IDENTIFIER,
    PASSWORD_CONFIRMATION: PASSWORD_CONFIRMATION_IDENTIFIER
  } = INPUT_IDENTIFIERS

  async function handleSignUpFormSubmit(event) {
    event.preventDefault()

    // Read formdata before disabling input setting
    const formData = new FormData(event.target)
    const email = formData.get(EMAIL_IDENTIFIER)
    const name = formData.get(FULL_NAME_IDENTIFIER)
    const password = formData.get(PASSWORD_IDENTIFIER)
    const passwordConfirmation = formData.get(PASSWORD_CONFIRMATION_IDENTIFIER)

    setIsLoading(true)
    let errorMessageToUse = null

    // Validate input one more time
    if (!EMAIL_REGEXES.REGEXP_LITERAL.test(email))
      errorMessageToUse = "Email is invalid"
    else if (!FULL_NAME_REGEXES.REGEXP_LITERAL.test(name))
      errorMessageToUse = "Name is invalid"
    else if (!PASSWORD_REGEXES.REGEXP_LITERAL.test(password))
      errorMessageToUse = "Password is invalid"
    else if (password !== passwordConfirmation)
      errorMessageToUse = "Both passwords are not equal"

    if (errorMessageToUse !== null) {
      // Prevent flashing of loader
      setTimeout(() => {
        setFeedback({ message: errorMessageToUse, type: "error" })
        setIsLoading(false)
        scrollToPageTop()
      }, 2000)
      return
    }

    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name
        }
      })

      setFeedback({ message: "", type: null })
      setSignUpConfirmation({ isActive: true, emailToConfirm: email })
      setIsLoading(false)
      scrollToPageTop()
    } catch (error) {
      const errorName = error.name
      const knownMessageForError = MESSAGES_FOR_KNOWN_SIGN_UP_ERRORS[errorName]

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

  function handlePasswordInputChange() {
    const passwordInput = passwordRef.current
    const passwordConfirmationInput = passwordConfirmationRef.current
    if (passwordInput.value !== passwordConfirmationInput.value)
      passwordConfirmationInput.setCustomValidity(
        "Please enter the same password as one above"
      )
    else passwordConfirmationInput.setCustomValidity("")
  }

  return (
    <AuthForm disabled={isLoading} handleFormSubmit={handleSignUpFormSubmit}>
      <TextInput
        label="Full name"
        id={FULL_NAME_IDENTIFIER}
        name={FULL_NAME_IDENTIFIER}
        pattern={FULL_NAME_REGEXES.HTML_PATTERN_ATTR}
        required
        requirement={FULL_NAME_REQUIREMENT}
        type="text"
        placeholder="- - - -"
      />

      <TextInput
        label="Email"
        id={EMAIL_IDENTIFIER}
        name={EMAIL_IDENTIFIER}
        pattern={EMAIL_REGEXES.HTML_PATTERN_ATTR}
        required
        type="email"
        placeholder="- - - -"
      />

      <TextInput
        label="Password"
        id={PASSWORD_IDENTIFIER}
        inputRef={passwordRef}
        name={PASSWORD_IDENTIFIER}
        onChange={handlePasswordInputChange}
        pattern={PASSWORD_REGEXES.HTML_PATTERN_ATTR}
        required
        type="password"
        requirement={PASSWORD_REQUIREMENT}
        placeholder="- - - -"
      />

      <TextInput
        label="Confirm Password"
        id={PASSWORD_CONFIRMATION_IDENTIFIER}
        name={PASSWORD_CONFIRMATION_IDENTIFIER}
        inputRef={passwordConfirmationRef}
        onChange={handlePasswordInputChange}
        required
        type="password"
        placeholder="- - - -"
      />

      <SubmitButton showLoader={isLoading} text="Sign up" />
    </AuthForm>
  )
}

function ConfirmSignUpForm({
  emailToConfirm,
  isLoading,
  setFeedback,
  setIsLoading
}) {
  const router = useRouter()
  const emailInputRef = useRef()
  const [isResendingCode, setIsResendingCode] = useState(false)

  const {
    EMAIL: EMAIL_IDENTIFIER,
    CONFIRMATION_CODE: CONFIRMATION_CODE_IDENTIFIER
  } = INPUT_IDENTIFIERS

  const emailIsProvided =
    typeof emailToConfirm === "string" && emailToConfirm !== ""

  async function handleConfirmSignUpFormSubmit(event) {
    event.preventDefault()

    // Read data before disabling inputs with 'setIsLoading'
    const formData = new FormData(event.target)

    // Formdata is not used to get email because the field may be disabled (if
    // the email to confirm was passed to the component and not entered by the user)
    const email = emailInputRef.current.value
    const confirmationCode = formData.get(CONFIRMATION_CODE_IDENTIFIER)

    setIsLoading(true)

    try {
      await Auth.confirmSignUp(email, confirmationCode, {
        forceAliasCreation: false
      })
      setFeedback({
        message: "Account verified successfully, redirecting to login page",
        type: "success"
      })
      scrollToPageTop()

      // Allow the user some time to read the message
      setTimeout(() => {
        router.replace(SIGN_IN_PAGE_URL)
      }, 2000)
    } catch (error) {
      const errorName = error.name
      const knownMessageForError =
        MESSAGES_FOR_KNOWN_SIGN_UP_CONFIRMATION_ERRORS[errorName]

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

  async function handleCodeResendButtonClick(event) {
    event.preventDefault()

    /**
     * Verification needed since the button isn't a submit button, making the
     * 'required' attribute not prevent the clicking of the button.
     */
    const emailInput = emailInputRef.current
    if (!emailInput.validity.valid) {
      emailInput.reportValidity()
      return
    }

    setIsResendingCode(true)

    try {
      await Auth.resendSignUp(emailInput.value)
      setFeedback({
        message: "Code sent successfully.",
        type: "success"
      })
    } catch (error) {
      const errorName = error.name
      const knownMessageForError =
        MESSAGES_FOR_KNOWN_SIGN_UP_CODE_RESEND_ERRORS[errorName]

      setFeedback({
        message:
          typeof knownMessageForError === "string"
            ? knownMessageForError
            : "An error occured, please try again later.",
        type: "error"
      })
    }

    setIsResendingCode(false)
    scrollToPageTop()
  }

  return (
    <AuthForm
      disabled={isLoading || isResendingCode}
      handleFormSubmit={handleConfirmSignUpFormSubmit}
    >
      <TextInput
        additionalClassName={Styles.EmailInputToConfirm}
        defaultValue={emailIsProvided ? emailToConfirm : ""}
        disabled={emailIsProvided}
        id={EMAIL_IDENTIFIER}
        inputRef={emailInputRef}
        label="Email"
        name={EMAIL_IDENTIFIER}
        pattern={EMAIL_REGEXES.HTML_PATTERN_ATTR}
        placeholder="- - - -"
        required
        type="email"
      />

      <TextInput
        id={CONFIRMATION_CODE_IDENTIFIER}
        label="Confirmation code"
        name={CONFIRMATION_CODE_IDENTIFIER}
        placeholder="- - - -"
        required
        type="text"
      />

      <div className={Styles.ResendCodePrompt}>
        {isResendingCode ? (
          "Resending code..."
        ) : (
          <>
            Didn't receive the code?{" "}
            <a
              className={Styles.ResendCodePrompt__Button}
              href="#"
              onClick={handleCodeResendButtonClick}
            >
              Get a new one
            </a>
          </>
        )}
      </div>

      <SubmitButton showLoader={isLoading} text="Confirm" />
    </AuthForm>
  )
}

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState({ message: "", type: null })
  const [signUpConfirmation, setSignUpConfirmation] = useState({
    isActive: false,
    emailToConfirm: null
  })

  return (
    <div className={Styles.Container}>
      <BasicLayout pageTitle={`Sign Up | ${SITE_TITLE}`}>
        <AuthContainer
          title={signUpConfirmation.isActive ? "Confirm Sign Up" : "Sign Up"}
        >
          <AuthFeedback {...feedback} />

          {signUpConfirmation.isActive ? (
            <ConfirmSignUpForm
              emailToConfirm={signUpConfirmation.emailToConfirm}
              isLoading={isLoading}
              setFeedback={setFeedback}
              setIsLoading={setIsLoading}
            />
          ) : (
            <SignUpForm
              isLoading={isLoading}
              setFeedback={setFeedback}
              setIsLoading={setIsLoading}
              setSignUpConfirmation={setSignUpConfirmation}
            />
          )}

          <div className={Styles.ModeTogglerContainer}>
            <button
              disabled={isLoading}
              onClick={() => {
                setFeedback({ message: "", type: null })
                setSignUpConfirmation({
                  // In case the email has has been set before
                  emailToConfirm: null,
                  isActive: !signUpConfirmation.isActive
                })
                scrollToPageTop()
              }}
              type="button"
            >
              {signUpConfirmation.isActive
                ? "Create account"
                : "Complete previous sign up"}
            </button>
          </div>

          <p className={AuthStyles.AuthPrompt}>
            Already have an account?{" "}
            <Link href={SIGN_IN_PAGE_URL} legacyBehavior passHref>
              <a className={AuthStyles.AuthPrompt__Link}>Login</a>
            </Link>{" "}
            instead
          </p>
        </AuthContainer>
      </BasicLayout>
    </div>
  )
}

SignUp.accessPolicies = [
  {
    type: AccessPolicyTypes.USER_IS_GUEST,
    alternateSource: HOME_PAGE_URL
  }
]
