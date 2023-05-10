import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Stack,
  Text,
  Textarea,
  useStyleConfig,
  useToast
} from "@chakra-ui/react"

import Head from "next/head"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"

import { BiBookReader } from "react-icons/bi"
import { MdOutlineSubtitles } from "react-icons/md"

import {
  AppLayout,
  AppLayoutMainSection,
  AppLayoutMajorSection,
  AppLayoutMinorSection,
  AppLayoutTopSection
} from "../../../components/layout"

import {
  NavGroup,
  NavItem,
  SideBar,
  TopBar,
  TopLevelNavGroup
} from "../../../components/navigation"

import {
  LESSON_REVISION_URL,
  QUIZ_GENERATION_URL,
  SIGN_IN_PAGE_URL
} from "../../../constants/page-urls"
import { SITE_TITLE } from "../../../constants/site-details"
import { ChakraUIProvider, Fonts } from "../../../controllers/style"
import {
  LessonContext,
  useLesson,
  useLessonManager
} from "../../../controllers/lesson"
import { AccessPolicyTypes } from "../../../controllers/policy"
import { uniqueId } from "../../../lib/markup"

import {
  QUIZ_GENERATION_PARAMS,
  QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT,
  QUIZ_GEN_LOWEST_MAX_QUESTIONS_COUNT
} from "../../../shared/lesson-quiz"

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

function LessonDetails() {
  const lesson = useLesson()
  const inputLabelStyles = useStyleConfig("FormLabel")

  return (
    <Box
      bg="white"
      borderStyle="solid"
      borderWidth={{ base: "1px 0", sm: "1px" }}
      borderColor="blackAlpha.300"
      m={{ base: "0 0 20px", sm: "0 20px 20px" }}
      p={{ base: "20px", md: "20px" }}
    >
      <Stack alignItems="flex-start" mb="10px">
        <Icon
          as={MdOutlineSubtitles}
          color="brandSecondary.500"
          h={{ base: "25px", sm: "30px" }}
          w={{ base: "25px", sm: "30px" }}
        />

        <Heading
          as="h3"
          fontFamily={Fonts.body}
          fontSize={{ base: "1.3rem", sm: "1.5rem" }}
          fontWeight="500"
          color="gray.700"
          m="0"
        >
          {lesson.title}
        </Heading>
      </Stack>

      <Text color="gray.600" mb="20px">
        {lesson.description}
      </Text>

      <Box>
        <Heading as="h3" fontFamily={Fonts.body} sx={inputLabelStyles}>
          Lesson Content
        </Heading>
        <Textarea
          color="gray.700"
          h="150px"
          isDisabled
          mt="10px"
          value={lesson.content}
          _disabled={{ opacity: "1" }}
        />
      </Box>
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

    const thereIsValidQuizElement = createdQuizElement !== null
    const thereIsValidQuizContainer =
      quizContainerRef.current instanceof Element

    if (thereIsValidQuizElement && thereIsValidQuizContainer) {
      quizContainerRef.current.replaceChildren(createdQuizElement)
      return
    }

    if (
      thereIsValidQuizElement ||
      !thereIsValidQuizContainer ||
      quizState.quizIsLoaded
    ) {
      return
    }

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

      let quizDetailsObject = null
      let errorOccured = false

      try {
        const lessonQuizGenerationResult = await fetch(
          lessonQuizGenerationURL,
          {
            method: "GET",
            mode: "same-origin",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Expires: "0"
            }
          }
        )

        if (lessonQuizGenerationResult.status !== 200)
          throw lessonQuizGenerationResult

        quizDetailsObject = await lessonQuizGenerationResult.json()
      } catch (error) {
        errorOccured = true
      }

      if (errorOccured) {
        toast.closeAll()
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
        Quiz.Props.define(quizOptions)
      )

      quizContainerRef.current.replaceChildren(newlyCreatedQuizElement)
      setCreatedQuizElement(newlyCreatedQuizElement)
      setQuizState({ ...quizState, quizIsLoaded: true })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  return (
    <Box p={{ base: 0, sm: "0 20px" }}>
      <QuizJSUtils />
      <Box
        borderColor="gray.200"
        borderStyle="solid"
        borderWidth="1px 0 0"
        pb={{ sm: "20px" }}
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
    QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT
  )

  const maxQuestionsInputId = uniqueId("max-questions-count-input")
  const { quizIsStarted, quizIsLoaded } = quizState

  function attemptToStartLessonQuiz() {
    if (
      maxQuestionsCount < QUIZ_GEN_LOWEST_MAX_QUESTIONS_COUNT ||
      maxQuestionsCount > QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT
    ) {
      toast.closeAll()
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
    <Flex flexDir="column" h="100vh">
      <Heading as="h1" p="20px">
        Revise Lesson
      </Heading>

      <Flex flex="1 1 200px" flexDir="column">
        {(lessonManager.isLoading || lessonManager.errorOccured) && (
          <Flex
            alignItems="center"
            justifyContent="center"
            flex="1 1 150px"
            minH="150px"
            p="0 20px"
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
              <LessonDetails />
            </LessonContext.Provider>

            <Box
              bg="white"
              flex="1 1 150px"
              borderTop="1px solid"
              borderColor="blackAlpha.300"
              pt="20px"
            >
              <FormControl
                isDisabled={quizIsStarted}
                isRequired
                mb="20px"
                p="0 20px"
              >
                <FormLabel htmlFor={maxQuestionsInputId}>
                  Max Questions To Generate
                </FormLabel>
                <NumberInput
                  defaultValue={QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT}
                  id={maxQuestionsInputId}
                  min={QUIZ_GEN_LOWEST_MAX_QUESTIONS_COUNT}
                  max={QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT}
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
                  The maximum number of questions to generate for revision. Must
                  be between {QUIZ_GEN_LOWEST_MAX_QUESTIONS_COUNT} and{" "}
                  {QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT}. Value will be clamped
                  accordingly after input if needed.
                </FormHelperText>
              </FormControl>

              <Box p="0 20px 20px">
                <Button
                  colorScheme="brandSecondary"
                  isDisabled={quizIsStarted}
                  isLoading={quizIsStarted && !quizIsLoaded}
                  onClick={attemptToStartLessonQuiz}
                >
                  Start revision
                </Button>
              </Box>

              {quizIsStarted && (
                <LessonContext.Provider value={lessonManager.lesson}>
                  <LessonQuiz
                    maxQuestionsCount={maxQuestionsCount}
                    quizState={quizState}
                    setQuizState={setQuizState}
                  />
                </LessonContext.Provider>
              )}
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default function ReviseSpecificLesson() {
  const lessonManager = useLessonManager()

  return (
    <ChakraUIProvider>
      <AppLayout pageTitle={`Revise Lesson | ${SITE_TITLE}`}>
        <AppLayoutMinorSection>
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
        </AppLayoutMinorSection>
        <AppLayoutMajorSection>
          <AppLayoutTopSection>
            <TopBar />
          </AppLayoutTopSection>
          <AppLayoutMainSection>
            <LessonRevisionSection lessonManager={lessonManager} />
          </AppLayoutMainSection>
        </AppLayoutMajorSection>
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
