import { useState } from "react"
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
  Text
} from "@chakra-ui/react"

import {
  AppLayout,
  AppLayoutMainSection,
  AppLayoutSidebar
} from "../../components/layout"

import { SideBar, TopLevelNavGroup } from "../../components/sidebar"
import {
  ADD_NEW_LESSON_URL,
  ALL_LESSONS_URL,
  SIGN_IN_PAGE_URL
} from "../../constants/page-urls"
import { SITE_TITLE } from "../../constants/site-details"
import { ChakraUIProvider, Fonts } from "../../controllers/chakra-ui"
import { AccessPolicyTypes } from "../../controllers/policy"

function LessonCard({
  lesson = {
    title: "Some lesson title",
    description: "Some lesson description",
    tags: ["a-tag", "another-tag", "another-one"],
    revisionLink: "#"
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

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading
              as="h3"
              fontFamily={Fonts.body}
              fontWeight="600"
              fontSize="1.1rem"
              mb="10px"
            >
              Description
            </Heading>
            <Text>{lesson.description}</Text>
          </Box>
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
              borderRadius="6px"
              fontWeight="600"
              href={lesson.revisionLink}
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

// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
function LessonLoadingContent() {
  return (
    <Flex
      alignItems="center"
      flex="1 1 150px"
      flexDir="column"
      justifyContent="center"
      p="0 0 50px"
    >
      <Spinner color="gray.700" size="xl" />
    </Flex>
  )
}

/**
 * This component is used as a way to prevent rerenders when loading more
 * lessons. The 'lessons' array passed to it are meant to be kept the same for
 * that purpose
 */
function LessonSet({ lessons = [] }) {
  return lessons.map((lesson) => <LessonCard key={lesson.id} />)
}

function AllLessonsView() {
  // eslint-disable-next-line no-unused-vars
  const [lessonsSets, setLessonsSets] = useState([
    [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
  ])

  return (
    <Flex flexDir="column" minH="100vh" pb="20px">
      <Heading as="h1" p="20px">
        Lessons
      </Heading>

      <Box mt="20px" p="0 20px">
        <SimpleGrid columns={2} spacing="20px">
          {lessonsSets.map((lessonSet, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <LessonSet lessons={lessonSet} key={index} />
          ))}
        </SimpleGrid>

        <Flex justifyContent="center" mt="20px">
          <Button>Load more</Button>
        </Flex>
      </Box>
    </Flex>
  )
}

export default function AllLessons() {
  return (
    <ChakraUIProvider>
      <AppLayout pageTitle={`My Lessons | ${SITE_TITLE}`}>
        <AppLayoutSidebar>
          <SideBar>
            <TopLevelNavGroup activeURL={ALL_LESSONS_URL} />
          </SideBar>
        </AppLayoutSidebar>
        <AppLayoutMainSection>
          <AllLessonsView />
        </AppLayoutMainSection>
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

// Lines that have eslint-ignore that should be removed later
// - Definition of EmptyLessonsContent
// - Definition of LessonLoadingContent
// - The state setter 'setLessonsSets' in AllLessonsView components
