import { SITE_TITLE } from "../constants/site-details"
import Styles from "../styles/components/auth.module.scss"

export function AuthFeedback({ message, type }) {
  if (typeof message !== "string" || message === "") return ""

  const feedbackClasses = {
    error: Styles.AuthForm__Feedback_error,
    success: Styles.AuthForm__Feedback_success
  }

  return (
    <div
      className={`${Styles.AuthForm__Feedback} ${
        feedbackClasses[type || "error"]
      }`}
    >
      <p>{message}</p>
    </div>
  )
}

export function AuthForm({ children, disabled, handleFormSubmit }) {
  return (
    <form className={Styles.AuthForm__Element} onSubmit={handleFormSubmit}>
      <fieldset disabled={typeof disabled === "boolean" ? disabled : false}>
        {children}
      </fieldset>
    </form>
  )
}

export function AuthContainer({ children, title }) {
  return (
    <div className={Styles.AuthForm__OuterContainer}>
      <div className={Styles.AuthForm__InnerContainer}>
        <div className={Styles.AuthForm__SiteLogo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={`${SITE_TITLE} logo`} src="/assets/site-logo.svg" />
        </div>
        <div className={Styles.AuthForm__Info}>
          <h1>{title}</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

export function TextInput({
  additionalClassName,
  label,
  id,
  inputRef,
  requirement,
  type,
  ...otherProps
}) {
  if (typeof inputRef !== "undefined") otherProps.ref = inputRef
  return (
    <div className={Styles.TextInput__Container}>
      <label htmlFor={id}>
        <div className={Styles.TextInput__Label}>{label}</div>
        <input
          className={`${Styles.TextInput__Element} ${
            additionalClassName || ""
          }`}
          id={id}
          type={type}
          {...otherProps}
        />
        {typeof requirement === "string" && requirement !== "" && (
          <p className={Styles.TextInput__Requirement}>{requirement}</p>
        )}
      </label>
    </div>
  )
}

export function SubmitButton({ showLoader, text }) {
  return (
    <div className={Styles.SubmitButton}>
      <button type="submit">
        {showLoader ? <span className={Styles.SubmitButton__Loader} /> : text}
      </button>
    </div>
  )
}
