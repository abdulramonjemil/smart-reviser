import { API } from "aws-amplify"
import { useRouter } from "next/router"
import { createContext, useContext, useEffect, useState } from "react"
import * as queries from "../graphql/queries"

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
        const [lessonFetchingResult, lessonTagsFetchingResult] =
          await Promise.all([
            API.graphql({
              query: queries.getLesson,
              variables: { id: lessonId }
            }),

            API.graphql({
              query: queries.lessonTagsByLessonId,
              variables: { lessonId }
            })
          ])

        if (
          typeof lessonFetchingResult.errors === "object" &&
          lessonFetchingResult.errors !== null
        ) {
          throw lessonFetchingResult
        }

        if (
          typeof lessonTagsFetchingResult.errors === "object" &&
          lessonTagsFetchingResult.errors !== null
        ) {
          throw lessonTagsFetchingResult
        }

        const lessonsTagsLabels =
          lessonTagsFetchingResult.data.lessonTagsByLessonId.items.map(
            (lessonTagObject) => lessonTagObject.tag.label
          )

        const lessonToUse = lessonFetchingResult.data.getLesson || null
        if (lessonToUse !== null) lessonToUse.tags = lessonsTagsLabels
        setLesson(lessonToUse)
      } catch (error) {
        setErrorOccured(true)
      }

      setIsLoading(false)
    })()
  }, [isLoading, lesson, router.isReady, router.query])

  return { errorOccured, isLoading, lesson, routerQuery: router.query }
}

export const LessonContext = createContext({
  id: "",
  title: "",
  description: "",
  content: "",
  tags: []
})

export const useLesson = () => useContext(LessonContext)
