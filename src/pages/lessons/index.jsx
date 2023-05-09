import { useEffect, useState } from "react"
import { Link } from "@chakra-ui/next-js"
import { GiEmptyWoodBucketHandle } from "react-icons/gi"

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  StackDivider,
  Tag,
  TagLabel,
  Text,
  useToast
} from "@chakra-ui/react"

import { API } from "aws-amplify"

import {
  AppLayout,
  AppLayoutMainSection,
  AppLayoutMajorSection,
  AppLayoutMinorSection,
  AppLayoutTopSection
} from "../../components/layout"

import {
  ADD_NEW_LESSON_URL,
  ALL_LESSONS_URL,
  LESSON_REVISION_URL,
  SIGN_IN_PAGE_URL
} from "../../constants/page-urls"

import { SideBar, TopBar, TopLevelNavGroup } from "../../components/navigation"
import { SITE_TITLE } from "../../constants/site-details"
import { ChakraUIProvider, Constants, Fonts } from "../../controllers/style"
import { AccessPolicyTypes } from "../../controllers/policy"

import * as queries from "../../graphql/queries"
import { useAuth } from "../../controllers/auth"

const NUMBER_OF_LESSONS_TO_LOAD_EACH_TIME = 20

function LessonCard({
  lesson = {
    id: "",
    title: "",
    description: "",
    tags: []
  }
}) {
  return (
    <Card>
      <CardHeader>
        <Heading
          as="h2"
          fontFamily={Fonts.body}
          fontSize="1.4rem"
          fontWeight="600"
        >
          {lesson.title}
        </Heading>
      </CardHeader>

      <CardBody pt="0">
        <Stack divider={<StackDivider />} spacing="4">
          <Text color="gray.600">{lesson.description}</Text>
          <Box>
            <Flex gap="10px" flexWrap="wrap">
              {lesson.tags.map((tagLabel) => (
                <Tag
                  borderRadius="full"
                  colorScheme="teal"
                  key={tagLabel}
                  size="lg"
                  variant="solid"
                >
                  <TagLabel>{tagLabel}</TagLabel>
                </Tag>
              ))}
            </Flex>
          </Box>
          <Box mt="10px">
            <Link
              bg="gray.100"
              borderRadius={Constants.borderRadius}
              fontWeight="600"
              href={LESSON_REVISION_URL.for(lesson.id)}
              p="10px 20px"
              transition="background 0.2s linear"
              _hover={{ bg: "gray.200" }}
            >
              Revise
            </Link>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

function EmptyLessonsContent() {
  return (
    <Flex
      alignItems="center"
      flex="1 1 150px"
      flexDir="column"
      justifyContent="center"
      p="0 0 50px"
    >
      <Icon
        as={GiEmptyWoodBucketHandle}
        color="blackAlpha.600"
        fontSize="200px"
      />
      <Text
        color="blackAlpha.600"
        fontSize="1.5rem"
        mt="20px"
        textAlign="center"
        w="100%"
      >
        There is no lesson to show
      </Text>
      <Button as="a" href={ADD_NEW_LESSON_URL} mt="20px">
        Add one
      </Button>
    </Flex>
  )
}

function LessonLoadingContent({ lessonLoadingErrorOccured }) {
  return (
    <Flex
      alignItems="center"
      flex="1 1 150px"
      flexDir="column"
      justifyContent="center"
      p="0 0 50px"
    >
      {lessonLoadingErrorOccured ? (
        "Couldn't load lessons"
      ) : (
        <Spinner color="gray.700" size="xl" />
      )}
    </Flex>
  )
}

/**
 * This component is used as a way to prevent rerenders when loading more
 * lessons. The 'lessons' array passed to it are meant to be kept the same for
 * that purpose
 */
function LessonSet({ lessons = [] }) {
  return lessons.map((lesson) => <LessonCard lesson={lesson} key={lesson.id} />)
}

function AllLessonsView() {
  const [lessonsSets, setLessonsSets] = useState([])
  const [lessonIsLoaded, setLessonIsLoaded] = useState(false)
  const [isLoadingMoreLessons, setIsLoadingMoreLessons] = useState(false)
  const [lessonLoadingNextToken, setLessonLoadingNextToken] = useState(null)
  const [lessonLoadingErrorOccured, setLessonLoadingErrorOccured] =
    useState(false)

  // As mentioned in the amplify docs, the default value for the owner field of
  // models is the combination of the user sub and username
  // Visit
  // https://docs.amplify.aws/cli/graphql/authorization-rules/#per-user--owner-based-data-access
  // to learn more
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const owningKeyOfCurrentUser = `${currentUser.attributes.sub}::${currentUser.username}`

  async function loadAppropriateLessonBatch(nextToken) {
    let errorOccured = false
    let lessonItems = null

    try {
      const userLessonsFetchingVariables = {
        limit: NUMBER_OF_LESSONS_TO_LOAD_EACH_TIME,
        owner: owningKeyOfCurrentUser
      }

      if (typeof nextToken === "string" && nextToken !== "") {
        userLessonsFetchingVariables.nextToken = nextToken
      }

      const lessonsLoadingResult = await API.graphql({
        query: queries.lessonsByOwner,
        variables: userLessonsFetchingVariables
      })

      if (
        typeof lessonsLoadingResult.errors === "object" &&
        lessonsLoadingResult.errors !== null
      ) {
        throw lessonsLoadingResult
      }

      lessonItems = lessonsLoadingResult.data.lessonsByOwner.items
      nextToken = lessonsLoadingResult.data.lessonsByOwner.nextToken
    } catch (error) {
      errorOccured = true
    }

    return {
      errorOccured,
      lessons: lessonItems,
      nextToken
    }
  }

  async function fetchLessonsTagsFromBackend(lessonIds) {
    if (!Array.isArray(lessonIds)) throw new Error()
    let errorOccured = false
    let lessonsTagsLabels = null

    try {
      const lessonTagsFetchingResults = await Promise.all(
        lessonIds.map((lessonId) =>
          API.graphql({
            query: queries.lessonTagsByLessonId,
            variables: { lessonId }
          })
        )
      )

      const someResultContainErrors = lessonTagsFetchingResults.some(
        (result) => typeof result.errors === "object" && result.errors !== null
      )

      if (someResultContainErrors) throw lessonTagsFetchingResults

      lessonsTagsLabels = lessonTagsFetchingResults.map((result) =>
        result.data.lessonTagsByLessonId.items.map(
          (lessonTagObject) => lessonTagObject.tag.label
        )
      )
    } catch (error) {
      errorOccured = true
    }

    return { errorOccured, lessonsTagsLabels }
  }

  function notifyUserOfLessonLoadingError() {
    toast({
      title: "Failed to load lesson",
      description: "An error occured while loading lessons",
      status: "error",
      duration: 5000,
      isClosable: true
    })
  }

  async function attemptLessonLoad(nextToken) {
    const lessonsLoadingResult = await loadAppropriateLessonBatch(nextToken)
    if (lessonsLoadingResult.errorOccured) {
      setLessonLoadingErrorOccured(true)
      notifyUserOfLessonLoadingError()
      return { errorOccured: true, loadedLessons: null }
    }

    setLessonLoadingNextToken(lessonsLoadingResult.nextToken || null)
    const loadedLessons = lessonsLoadingResult.lessons

    const lessonsTagsLabelsLoadingResult = await fetchLessonsTagsFromBackend(
      loadedLessons.map((lesson) => lesson.id)
    )

    if (lessonsTagsLabelsLoadingResult.errorOccured) {
      setLessonLoadingErrorOccured(true)
      notifyUserOfLessonLoadingError()
      return { errorOccured: true, loadedLessons: null }
    }

    loadedLessons.forEach((lesson, index) => {
      lesson.tags = lessonsTagsLabelsLoadingResult.lessonsTagsLabels[index]
    })

    return { errorOccured: false, loadedLessons }
  }

  async function loadMoreLessons() {
    setIsLoadingMoreLessons(true)
    const loadedLessonResult = await attemptLessonLoad(lessonLoadingNextToken)
    if (loadedLessonResult.errorOccured) return

    setLessonsSets([...lessonsSets, loadedLessonResult.loadedLessons])
    setIsLoadingMoreLessons(false)
  }

  useEffect(() => {
    if (lessonIsLoaded) return
    ;(async () => {
      const loadedLessonResult = await attemptLessonLoad()
      if (loadedLessonResult.errorOccured) return

      setLessonsSets([loadedLessonResult.loadedLessons])
      setLessonIsLoaded(true)
    })()
  })

  return (
    <Flex flexDir="column" maxW="1200px" pb="20px" minH="100%">
      <Heading as="h1" p="20px">
        Lessons
      </Heading>

      {/* eslint-disable-next-line no-nested-ternary */}
      {lessonIsLoaded ? (
        // Show empty lesson content if first lessons batch is empty (user has no
        // lessons created)
        lessonsSets[0].length > 0 ? (
          <Box p="0 20px">
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="20px">
              {lessonsSets.map((lessonSet, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <LessonSet lessons={lessonSet} key={index} />
              ))}
            </SimpleGrid>

            {typeof lessonLoadingNextToken === "string" &&
            lessonLoadingNextToken !== "" ? (
              <Flex justifyContent="center" mt="40px">
                <Button
                  isLoading={isLoadingMoreLessons}
                  onClick={loadMoreLessons}
                >
                  Load more
                </Button>
              </Flex>
            ) : (
              <Text color="gray.400" mt="40px" textAlign="center">
                You have reached the end 🍿
              </Text>
            )}
          </Box>
        ) : (
          <EmptyLessonsContent />
        )
      ) : (
        <LessonLoadingContent
          lessonLoadingErrorOccured={lessonLoadingErrorOccured}
        />
      )}
    </Flex>
  )
}

export default function AllLessons() {
  return (
    <ChakraUIProvider>
      <AppLayout pageTitle={`My Lessons | ${SITE_TITLE}`}>
        <AppLayoutMinorSection>
          <SideBar>
            <TopLevelNavGroup activeURL={ALL_LESSONS_URL} />
          </SideBar>
        </AppLayoutMinorSection>
        <AppLayoutMajorSection>
          <AppLayoutTopSection>
            <TopBar />
          </AppLayoutTopSection>
          <AppLayoutMainSection>
            <AllLessonsView />
          </AppLayoutMainSection>
        </AppLayoutMajorSection>
      </AppLayout>
    </ChakraUIProvider>
  )
}

AllLessons.accessPolicies = [
  {
    type: AccessPolicyTypes.USER_IS_AUTHENTICATED,
    alternateSource: SIGN_IN_PAGE_URL
  }
]
