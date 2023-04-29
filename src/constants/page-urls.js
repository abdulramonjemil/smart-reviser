export const HOME_PAGE_URL = "/"

// Authentication pages
export const SIGN_IN_PAGE_URL = "/auth/signin"
export const SIGN_UP_PAGE_URL = "/auth/signup"

// Always reachable pages
export const ADD_NEW_LESSON_URL = "/lessons/new"
export const ALL_LESSONS_URL = "/lessons/"

// Specific lesson pages
export const LESSON_REVISION_URL = {
  for: (lessonId) => `/lessons/${lessonId}/revise`
}

// API endpoints
export const QUIZ_GENERATION_URL = "/api/generate-quiz"
