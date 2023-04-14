/**
 * Note that input pattern regular expressions behave as though they were
 * prefixed with ^ and suffixed with $ (effectively matching the whole string)
 * automatically
 */

/**
 * These match a user's input only if it is completely a sequence of the following:
 *   - one or more characters that are not whitespace characters or the @ character
 *   - one @ character.
 *   - one or more characters that are not whitespace characters or the @ character
 *   - a period character.
 *   - one or more characters that are not whitespace characters or the @ character
 */
export const EMAIL_REGEXES = {
  REGEXP_LITERAL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  STRING_LITERAL: "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/",
  HTML_PATTERN_ATTR: "[^\\s@]+@[^\\s@]+\\.[^\\s@]+"
}

/**
 * These match a user's input only if it:
 *   - contains at least one lower case letter
 *   - contains at least one upper case letter
 *   - contains at least one number
 *   - is eight or more characters long
 */
export const PASSWORD_REGEXES = {
  REGEXP_LITERAL: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  STRING_LITERAL: "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/",
  HTML_PATTERN_ATTR: "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"
}

/**
 * These match a user's input only if it:
 *   - contains one or more non white space character followed by a space,
 *     followed by another non whitespace character.
 *   - doesn't contain a number
 *   - is five or more characters long
 */
export const FULL_NAME_REGEXES = {
  REGEXP_LITERAL: /^(?=\S+ \S.*)\D{5,}$/,
  STRING_LITERAL: "/^(?=\\S+ \\S.*)\\D{5,}$/",
  HTML_PATTERN_ATTR: "(?=\\S+ \\S.*)\\D{5,}"
}

export const PASSWORD_REQUIREMENT =
  "Password must contain be at least 8 characters long and contain at least " +
  "one lowercase letter, one uppercase letter, and a number"

export const FULL_NAME_REQUIREMENT =
  "Full name must be at least 5 characters long and contain at least two names"
