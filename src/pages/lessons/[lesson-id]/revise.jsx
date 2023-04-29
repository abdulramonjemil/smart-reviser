import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Textarea
} from "@chakra-ui/react"

import Head from "next/head"
import { useRouter } from "next/router"
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
  SIGN_IN_PAGE_URL
} from "../../../constants/page-urls"
import { SITE_TITLE } from "../../../constants/site-details"
import { ChakraUIProvider, Fonts } from "../../../controllers/chakra-ui"
import { AccessPolicyTypes } from "../../../controllers/policy"
import { uniqueId } from "../../../lib/markup"
import { SAMPLE_QUIZ_OBJECT } from "../../../samples/quiz"

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
  return (
    <Box maxW="600px">
      <Heading as="h1" mb="20px">
        Revise Lesson
      </Heading>

      <Box mb="20px">
        <Heading
          as="h2"
          fontFamily={Fonts.body}
          fontSize="1.1rem"
          fontWeight="600"
        >
          Title
        </Heading>
        <Text>The awesome title of the lesson</Text>
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
        <Text>
          The awesome description of the lesson. The awesome description of the
          lesson. The awesome description of the lesson. The awesome description
          of the lesson.
        </Text>
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
            value="The awesome description of the lesson. The awesome description of the lesson. The awesome description of the lesson. The awesome description of the lesson."
          />
        </Box>
      )}
    </Box>
  )
}

function LessonQuiz({ quizState, setQuizState }) {
  const quizContainerRef = useRef()
  const [createdQuizElement, setCreatedQuizElement] = useState(null)

  useEffect(() => {
    if (createdQuizElement !== null) return

    const { Quiz } = window
    const [newlyCreatedQuizElement] = Quiz.create(
      Quiz.Props.define(SAMPLE_QUIZ_OBJECT),
      quizContainerRef.current
    )

    setCreatedQuizElement(newlyCreatedQuizElement)
    setQuizState({ ...quizState, quizIsLoaded: true })
  }, [createdQuizElement, quizState, setQuizState])

  return (
    <Box
      borderColor="gray.200"
      borderStyle="solid"
      borderWidth="1px 0 0"
      ref={quizContainerRef}
      mt="20px"
      pt="20px"
    />
  )
}

function LessonRevisionSection() {
  const [quizState, setQuizState] = useState({
    quizIsStarted: false,
    quizIsLoaded: false
  })

  const maxQuestionsInputId = uniqueId("max-questions-count-input")
  const { quizIsStarted, quizIsLoaded } = quizState

  function startLessonQuiz() {
    setQuizState({ ...quizState, quizIsStarted: true })
  }

  return (
    <Box p="20px">
      <LessonDetails hideLessonContent={quizIsStarted} />

      <FormControl isDisabled={quizIsStarted} isRequired maxW="600px" mb="20px">
        <FormLabel htmlFor={maxQuestionsInputId}>
          Max Questions To Generate
        </FormLabel>
        <NumberInput
          defaultValue={20}
          id={maxQuestionsInputId}
          min={3}
          max={20}
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
          between 3 and 20. Value will be clamped accordingly after input if
          needed.
        </FormHelperText>
      </FormControl>

      <Button
        isDisabled={quizIsStarted}
        isLoading={quizIsStarted && !quizIsLoaded}
        onClick={startLessonQuiz}
      >
        Start revision
      </Button>

      {quizIsStarted && (
        <LessonQuiz quizState={quizState} setQuizState={setQuizState} />
      )}
    </Box>
  )
}

export default function ReviseSpecificLesson() {
  const DEFAULT_LESSON_ID = "__DEFAULT_LESSON_ID__"

  const router = useRouter()
  const [routerQuery, setRouterQuery] = useState({
    "lesson-id": DEFAULT_LESSON_ID
  })

  const lessonId = routerQuery["lesson-id"]

  useEffect(() => {
    if (router.isReady) setRouterQuery(router.query)
  }, [router.isReady, router.query])

  return (
    <ChakraUIProvider>
      <QuizJSUtils />

      <AppLayout pageTitle={`Revise Lesson | ${SITE_TITLE}`}>
        <AppLayoutSidebar>
          <SideBar>
            <TopLevelNavGroup />
            <NavGroup heading="Lesson Actions">
              <NavItem
                href={
                  lessonId === DEFAULT_LESSON_ID
                    ? "#"
                    : LESSON_REVISION_URL.for(lessonId)
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
          <LessonRevisionSection />
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

// Things to do later
// - Export a getServerSidePropsMethod() method to send 404 page if needed
