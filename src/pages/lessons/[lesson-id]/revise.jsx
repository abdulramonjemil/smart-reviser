import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Text,
  Textarea,
  useToast
} from "@chakra-ui/react"

import Head from "next/head"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { BiBookReader } from "react-icons/bi"

import {
  AppLayout,
  AppLayoutMainSection,
  AppLayoutSidebar
} from "../../../components/layout"

import {
  NavGroup,
  NavItem,
  SideBar,
  TopLevelNavGroup
} from "../../../components/sidebar"

import {
  LESSON_REVISION_URL,
  QUIZ_GENERATION_URL,
  SIGN_IN_PAGE_URL
} from "../../../constants/page-urls"
import { SITE_TITLE } from "../../../constants/site-details"
import { ChakraUIProvider, Fonts } from "../../../controllers/chakra-ui"
import {
  LessonContext,
  useLesson,
  useLessonManager
} from "../../../controllers/lesson"
import { AccessPolicyTypes } from "../../../controllers/policy"
import { uniqueId } from "../../../lib/markup"

import {
  GENERATION_LIMITS,
  QUIZ_GENERATION_PARAMS
} from "../../../lib/quiz-generation"

function QuizJSUtils() {
  return (
    <>
      <Head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/modules/quiz/quiz.min.css" />
      </Head>

      {typeof window !== "undefined" && (
        <Script src="/modules/quiz/quiz.min.js" />
      )}
    </>
  )
}

function LessonDetails({ hideLessonContent }) {
  const lesson = useLesson()

  return (
    <Box maxW="600px">
      <Box mb="20px">
        <Heading
          as="h2"
          fontFamily={Fonts.body}
          fontSize="1.1rem"
          fontWeight="600"
        >
          Title
        </Heading>
        <Text>{lesson.title}</Text>
      </Box>

      <Box mb="20px">
        <Heading
          as="h2"
          fontFamily={Fonts.body}
          fontSize="1.1rem"
          fontWeight="600"
        >
          Description
        </Heading>
        <Text>{lesson.description}</Text>
      </Box>

      {!hideLessonContent && (
        <Box mb="20px">
          <Heading
            as="h2"
            fontFamily={Fonts.body}
            fontSize="1.1rem"
            fontWeight="600"
          >
            Lesson Content
          </Heading>
          <Textarea
            h="150px"
            isDisabled
            mt="10px"
            _disabled={{ opacity: "1" }}
            value={lesson.content}
          />
        </Box>
      )}
    </Box>
  )
}

function LessonQuiz({ maxQuestionsCount, quizState, setQuizState }) {
  const quizContainerRef = useRef()
  const quizSpinnerRef = useRef()
  const [createdQuizElement, setCreatedQuizElement] = useState(null)
  const lesson = useLesson()
  const toast = useToast()

  useEffect(() => {
    if (!quizState.quizIsLoaded) {
      quizSpinnerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      })
    }

    if (createdQuizElement !== null) return
    ;(async () => {
      const lessonQuizGenerationURL = new URL(
        QUIZ_GENERATION_URL,
        window.location.origin
      )
      lessonQuizGenerationURL.searchParams.set(
        QUIZ_GENERATION_PARAMS.LESSON_ID,
        lesson.id
      )

      lessonQuizGenerationURL.searchParams.set(
        QUIZ_GENERATION_PARAMS.MAX_QUESTIONS_COUNT,
        maxQuestionsCount
      )

      toast({
        title: "Attempting to create quiz",
        status: "info",
        duration: 6000,
        isClosable: true
      })

      let quizDetailsObject = null
      let errorOccured = false

      try {
        const lessonQuizGenerationResult = await fetch(
          lessonQuizGenerationURL,
          {
            method: "GET",
            mode: "same-origin"
          }
        )

        if (lessonQuizGenerationResult.status !== 200)
          throw lessonQuizGenerationResult

        quizDetailsObject = await lessonQuizGenerationResult.json()
      } catch (error) {
        errorOccured = true
      }

      if (errorOccured) {
        toast({
          title: "An error occured",
          description: "Could not generate quiz. Please try again.",
          status: "error",
          duration: 6000,
          isClosable: true
        })

        setQuizState({ ...quizState, quizIsStarted: false })
        return
      }

      const quizOptions = {
        metadata: {
          header: "Revise Lesson",
          autoSave: false
        },
        elements: []
      }

      quizDetailsObject.quizDetails.forEach((quizDetail) => {
        quizOptions.elements.push({
          type: "QUESTION",
          props: {
            title: quizDetail.question,
            answer: quizDetail.answer,
            options: Object.values(quizDetail.options),
            // undefined is required by Quiz.Props
            feedBackContent: quizDetail.explanation || undefined
          }
        })
      })

      const { Quiz } = window
      const [newlyCreatedQuizElement] = Quiz.create(
        Quiz.Props.define(quizOptions),
        quizContainerRef.current
      )

      setCreatedQuizElement(newlyCreatedQuizElement)
      setQuizState({ ...quizState, quizIsLoaded: true })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <QuizJSUtils />
      <Box
        borderColor="gray.200"
        borderStyle="solid"
        borderWidth="1px 0 0"
        mt="20px"
        p="20px 0"
        ref={quizContainerRef}
      />

      {!quizState.quizIsLoaded && (
        <Flex
          alignItems="center"
          justifyContent="center"
          p="30px"
          ref={quizSpinnerRef}
          minHeight="200px"
        >
          <Spinner color="gray.700" size="xl" />
        </Flex>
      )}
    </Box>
  )
}

function LessonRevisionSection({ lessonManager }) {
  const [quizState, setQuizState] = useState({
    quizIsStarted: false,
    quizIsLoaded: false
  })

  const toast = useToast()
  const [maxQuestionsCount, setMaxQuestionsCount] = useState(
    GENERATION_LIMITS.MAX_MAX_QUESTIONS_COUNT
  )

  const maxQuestionsInputId = uniqueId("max-questions-count-input")
  const { quizIsStarted, quizIsLoaded } = quizState

  function attemptToStartLessonQuiz() {
    if (
      maxQuestionsCount < GENERATION_LIMITS.MIN_MAX_QUESTIONS_COUNT ||
      maxQuestionsCount > GENERATION_LIMITS.MAX_MAX_QUESTIONS_COUNT
    ) {
      toast({
        title: "Invalid max questions count",
        status: "error",
        duration: 6000,
        isClosable: true
      })
      return
    }

    setQuizState({ ...quizState, quizIsStarted: true })
  }

  return (
    <Flex flexDir="column" h="100vh" p="20px">
      <Heading as="h1" mb="20px">
        Revise Lesson
      </Heading>

      {(lessonManager.isLoading || lessonManager.errorOccured) && (
        <Flex
          alignItems="center"
          justifyContent="center"
          flex="1 1 150px"
          minH="150px"
        >
          {lessonManager.isLoading ? (
            <Spinner color="gray.700" size="xl" />
          ) : (
            <Text>An error occured, lesson could not be loaded</Text>
          )}
        </Flex>
      )}

      {!lessonManager.isLoading && !lessonManager.errorOccured && (
        <>
          <LessonContext.Provider value={lessonManager.lesson}>
            <LessonDetails hideLessonContent={quizIsStarted} />
          </LessonContext.Provider>
          <FormControl
            borderColor="gray.300"
            borderStyle="solid"
            borderWidth="1px 0 0"
            isDisabled={quizIsStarted}
            isRequired
            maxW="600px"
            mb="20px"
            pt="20px"
          >
            <FormLabel htmlFor={maxQuestionsInputId}>
              Max Questions To Generate
            </FormLabel>
            <NumberInput
              defaultValue={GENERATION_LIMITS.MAX_MAX_QUESTIONS_COUNT}
              id={maxQuestionsInputId}
              min={GENERATION_LIMITS.MIN_MAX_QUESTIONS_COUNT}
              max={GENERATION_LIMITS.MAX_MAX_QUESTIONS_COUNT}
              onChange={(value) => setMaxQuestionsCount(value)}
              step={1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              The maximum number of questions to generate for revision. Must be
              between {GENERATION_LIMITS.MIN_MAX_QUESTIONS_COUNT} and
              {GENERATION_LIMITS.MAX_MAX_QUESTIONS_COUNT}. Value will be clamped
              accordingly after input if needed.
            </FormHelperText>
          </FormControl>

          <Box maxW="600px" pb="20px">
            <Button
              isDisabled={quizIsStarted}
              isLoading={quizIsStarted && !quizIsLoaded}
              onClick={attemptToStartLessonQuiz}
            >
              Start revision
            </Button>
          </Box>
        </>
      )}

      {quizIsStarted && (
        <LessonContext.Provider value={lessonManager.lesson}>
          <LessonQuiz
            maxQuestionsCount={maxQuestionsCount}
            quizState={quizState}
            setQuizState={setQuizState}
          />
        </LessonContext.Provider>
      )}
    </Flex>
  )
}

export default function ReviseSpecificLesson() {
  const lessonManager = useLessonManager()

  return (
    <ChakraUIProvider>
      <AppLayout pageTitle={`Revise Lesson | ${SITE_TITLE}`}>
        <AppLayoutSidebar>
          <SideBar>
            <TopLevelNavGroup />
            <NavGroup heading="Lesson Actions">
              <NavItem
                href={
                  lessonManager.isLoading
                    ? "#"
                    : LESSON_REVISION_URL.for(
                        lessonManager.routerQuery["lesson-id"]
                      )
                }
                icon={BiBookReader}
                isActive
              >
                Revise
              </NavItem>
            </NavGroup>
          </SideBar>
        </AppLayoutSidebar>
        <AppLayoutMainSection>
          <LessonRevisionSection lessonManager={lessonManager} />
        </AppLayoutMainSection>
      </AppLayout>
    </ChakraUIProvider>
  )
}

ReviseSpecificLesson.accessPolicies = [
  {
    type: AccessPolicyTypes.USER_IS_AUTHENTICATED,
    alternateSource: SIGN_IN_PAGE_URL
  }
]
