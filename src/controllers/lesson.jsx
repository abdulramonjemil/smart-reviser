import { API } from "aws-amplify"
import { useRouter } from "next/router"
import { createContext, useContext, useEffect, useState } from "react"
import * as queries from "../graphql/queries"

// eslint-disable-next-line import/prefer-default-export
export function useLessonManager() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorOccured, setErrorOccured] = useState(false)
  const [lesson, setLesson] = useState(null)

  useEffect(() => {
    if (!router.isReady || !isLoading) return
    ;(async () => {
      const lessonId = router.query["lesson-id"]

      try {
        const lessonFetchingResult = await API.graphql({
          query: queries.getLesson,
          variables: { id: lessonId }
        })

        if (
          typeof lessonFetchingResult.errors === "object" &&
          lessonFetchingResult.errors !== null
        ) {
          throw lessonFetchingResult
        }

        const lessonsTagsLabels =
          lessonFetchingResult.data.getLesson.tags.items.map(
            (tagObject) => tagObject.tagLabel
          )

        const lessonToUse = lessonFetchingResult.data.getLesson || null
        if (lessonToUse !== null) lessonToUse.tags = lessonsTagsLabels
        setLesson(lessonToUse || null)
      } catch (error) {
        setErrorOccured(true)
      }
      setIsLoading(false)
    })()
  }, [isLoading, lesson, router.isReady, router.query])

  return { errorOccured, isLoading, lesson }
}

export const LessonContext = createContext({})
export const useLesson = () => useContext(LessonContext)
