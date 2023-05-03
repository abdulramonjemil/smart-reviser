import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  useToast,
  VStack
} from "@chakra-ui/react"

import { API } from "aws-amplify"
import { Step, Steps, useSteps } from "chakra-ui-steps"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { useRouter } from "next/router"
import { PDFJS } from "../../lib/pdf"
import {
  AppLayout,
  AppLayoutMinorSection,
  AppLayoutMajorSection,
  AppLayoutTopSection,
  AppLayoutMainSection
} from "../../components/layout"
import { TopLevelNavGroup, SideBar, TopBar } from "../../components/navigation"

import {
  ADD_NEW_LESSON_URL,
  LESSON_REVISION_URL,
  SIGN_IN_PAGE_URL
} from "../../constants/page-urls"

import { SITE_TITLE } from "../../constants/site-details"
import { ChakraUIProvider } from "../../controllers/chakra-ui"
import { AccessPolicyTypes } from "../../controllers/policy"
import { uniqueId } from "../../lib/markup"
import { countWords } from "../../lib/counter"

import {
  MAX_LESSON_CONTENT_CHAR_COUNT,
  MAX_LESSON_CONTENT_WORD_COUNT,
  MIN_LESSON_CONTENT_WORD_COUNT
} from "../../lib/lesson-quiz"

import * as queries from "../../graphql/queries"
import * as mutations from "../../graphql/mutations"

const DEFAULT_NEW_LESSON_DATA = {
  title: "",
  description: "",
  content: "",
  tags: []
}

const NewLessonDataContext = createContext({ ...DEFAULT_NEW_LESSON_DATA })

const MAX_ACCEPTABLE_PDF_FILE_SIZE = 5 * 1e6 // (in bytes)
const MIN_TAG_LABEL_CHAR_COUNT = 2
const MAX_TAG_LABEL_CHAR_COUNT = 20

function LessonMetadata({ setLevelIsCompleted }) {
  const newLessonData = useContext(NewLessonDataContext)

  const [titleInput, setTitleInput] = useState("")
  const [descInput, setDescInput] = useState("")

  function handleTitleInputChange(event) {
    setTitleInput((newLessonData.title = event.target.value))
  }

  function handleDescInputChange(event) {
    setDescInput((newLessonData.description = event.target.value))
  }

  const titleInputIsValid = titleInput.length >= 10
  const descInputIsValid = descInput.length >= 20

  /**
   * Wrap the function call within setTimeout to delay execution of the state
   * update as it is going to run within a component render and not in a
   * callback which could result in the error discussed on this issue:
   * https://github.com/facebook/react/issues/18178
   */
  setTimeout(() => {
    setLevelIsCompleted(titleInputIsValid && descInputIsValid)
  })

  useEffect(() => {
    setTitleInput(newLessonData.title)
    setDescInput(newLessonData.description)
  }, [newLessonData.title, newLessonData.description])

  const lessontTitleId = uniqueId("lesson-title")
  const lessonDescId = uniqueId("lesson-desc")

  return (
    <Box maxW="600px" mt="20px">
      <VStack spacing="25px">
        <FormControl
          isInvalid={titleInput.length !== 0 && !titleInputIsValid}
          isRequired
        >
          <FormLabel htmlFor={lessontTitleId}>Lesson Title</FormLabel>
          <Input
            id={lessontTitleId}
            minLength={10}
            onChange={handleTitleInputChange}
            placeholder="- - - -"
            type="text"
            value={titleInput}
          />
          {titleInput.length === 0 || titleInputIsValid ? (
            <FormHelperText>Enter a short title for the lesson</FormHelperText>
          ) : (
            <FormErrorMessage>
              Lesson title must be at least 10 characters long
            </FormErrorMessage>
          )}
        </FormControl>

        <FormControl
          isInvalid={descInput.length !== 0 && !descInputIsValid}
          isRequired
        >
          <FormLabel htmlFor={lessonDescId}>Lesson Description</FormLabel>
          <Textarea
            id={lessonDescId}
            minLength={20}
            onChange={handleDescInputChange}
            placeholder="- - - -"
            type="text"
            value={descInput}
          />

          {descInput.length === 0 || descInputIsValid ? (
            <FormHelperText>Describe the lesson briefly</FormHelperText>
          ) : (
            <FormErrorMessage>
              Lesson description must be at least 20 characters long
            </FormErrorMessage>
          )}
        </FormControl>
      </VStack>
    </Box>
  )
}

function PDFPagesParsingManager({
  loadingInfo,
  PDFFlowData,
  setLessonContent,
  setLoadingInfo,
  setPDFFlowData
}) {
  const toast = useToast()

  async function parseChosenPDFPages() {
    const { pagesRangeToParse, parsedPDFDocument } = PDFFlowData
    const [startPage, endPage] = pagesRangeToParse

    const pdfNumberOfPages = parsedPDFDocument.numPages
    if (startPage < 1 || startPage > endPage || endPage > pdfNumberOfPages) {
      toast({
        title: "Unable to parse PDF pages",
        description: "An error occured while selecting the pages to use",
        status: "error",
        duration: 10000,
        isClosable: true
      })
      return
    }

    setLoadingInfo({ ...loadingInfo, pdfPagesAreBeingParsed: true })
    const pagePromises = []
    for (let i = startPage; i <= endPage; i += 1) {
      pagePromises.push(parsedPDFDocument.getPage(i))
    }

    const pages = await Promise.all(pagePromises)
    const pagesContents = await Promise.all(
      pages.map((page) => page.getTextContent())
    )

    function pageContentToString(pageContent) {
      const contentItems = pageContent.items
      let lastYAxisTranslateFactor = contentItems[0].transform[5]

      return contentItems.reduce((prevContentString, contentItem) => {
        if (contentItem.transform[5] !== lastYAxisTranslateFactor) {
          // eslint-disable-next-line prefer-destructuring
          lastYAxisTranslateFactor = contentItem.transform[5]
          return `${prevContentString}\n${contentItem.str}`
        }
        return prevContentString + contentItem.str
      }, "")
    }

    const pagesContentsAsStrings = pagesContents.reduce(
      (prevPageContent, pageContent, currentIndex) => {
        const pageContentString = pageContentToString(pageContent)
        const contentSplitter = prevPageContent !== "" ? "\n\n" : ""

        return `${prevPageContent}${contentSplitter}[[PDF PAGE - ${
          currentIndex + startPage
        }]]\n${pageContentString}`
      },
      ""
    )

    setLoadingInfo({ ...loadingInfo, pdfPagesAreBeingParsed: false })
    setLessonContent(pagesContentsAsStrings)
  }

  return (
    <Box>
      <Stat
        borderColor="blackAlpha.200"
        borderRadius="4px"
        borderStyle="solid"
        borderWidth="1px"
        mb="20px"
        mt="20px"
        p="10px"
      >
        <StatLabel>
          PDF File - {PDFFlowData.parsedPDFDocumentFile.name}
        </StatLabel>
        <StatNumber>{PDFFlowData.parsedPDFDocument.numPages}</StatNumber>
        <StatHelpText>Total Pages</StatHelpText>
      </Stat>

      <Heading
        as="div"
        fontFamily="fonts.body"
        fontSize="md"
        mb="20px"
        fontWeight="500"
      >
        Select pages to use
      </Heading>

      <RangeSlider
        // eslint-disable-next-line jsx-a11y/aria-proptypes
        aria-label={["page to start from", "page to end at"]}
        colorScheme="purple"
        defaultValue={PDFFlowData.pagesRangeToParse}
        max={PDFFlowData.parsedPDFDocument.numPages}
        mb="20px"
        min={1}
        onChange={(value) => {
          setPDFFlowData({ ...PDFFlowData, pagesRangeToParse: value })
        }}
        step={1}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>

      <StatGroup mb="20px">
        <Stat>
          <StatLabel>Start Page</StatLabel>
          <StatNumber>{PDFFlowData.pagesRangeToParse[0]}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>End page</StatLabel>
          <StatNumber>{PDFFlowData.pagesRangeToParse[1]}</StatNumber>
        </Stat>
      </StatGroup>

      <Button
        isLoading={loadingInfo.pdfPagesAreBeingParsed}
        onClick={parseChosenPDFPages}
      >
        Parse Pages
      </Button>
    </Box>
  )
}

function PDFLessonContentSource({ setLessonContent }) {
  const [PDFFlowData, setPDFFlowData] = useState({
    pagesRangeToParse: [0, 0],
    parsedPDFDocument: null,
    parsedPDFDocumentFile: null,
    selectedPDFFile: null
  })

  const [loadingInfo, setLoadingInfo] = useState({
    pdfDocumentIsLoading: false,
    pdfPagesAreBeingParsed: false
  })

  const toast = useToast()
  const PDFFileInputId = uniqueId("pdf-file-input")

  function parseSelectedPDFFile() {
    const { selectedPDFFile } = PDFFlowData

    if (!(selectedPDFFile instanceof File)) return
    const reader = new FileReader()

    reader.addEventListener("load", async () => {
      setLoadingInfo({ ...loadingInfo, pdfDocumentIsLoading: true })
      const pdfDocument = await PDFJS.getDocument(reader.result).promise

      const pdfNumberOfPages = pdfDocument.numPages
      if (pdfNumberOfPages < 1) {
        toast({
          title: "Unusable file",
          description: "The file you selected contains no pages",
          status: "error",
          duration: 10000,
          isClosable: true
        })
        return
      }

      setLoadingInfo({ ...loadingInfo, pdfDocumentIsLoading: false })
      setPDFFlowData({
        ...PDFFlowData,
        pagesRangeToParse: [1, Math.min(10, pdfNumberOfPages)],
        parsedPDFDocument: pdfDocument,
        parsedPDFDocumentFile: selectedPDFFile
      })
    })

    reader.addEventListener("error", () => {
      toast({
        title: "Error parsing file",
        description: "The file you selected could not be parsed successfully",
        status: "error",
        duration: 10000,
        isClosable: true
      })
    })

    reader.readAsArrayBuffer(PDFFlowData.selectedPDFFile)
  }

  function handleFileInputChange(event) {
    const selectedFile = event.target.files[0]

    if (selectedFile.size > MAX_ACCEPTABLE_PDF_FILE_SIZE) {
      toast({
        title: "File too big",
        description: "The PDF File you uploaded is more than 5mb in size",
        status: "error",
        duration: 10000,
        isClosable: true
      })
      return
    }

    setPDFFlowData({ ...PDFFlowData, selectedPDFFile: selectedFile })
  }

  return (
    <FormControl>
      <FormLabel htmlFor={PDFFileInputId} mb="10px">
        Select PDF File to use
      </FormLabel>
      <Input
        accept=".pdf,application/pdf"
        h="auto"
        id={PDFFileInputId}
        mb="20px"
        onChange={handleFileInputChange}
        p="10px"
        type="file"
      />

      <Button
        isDisabled={PDFFlowData.selectedPDFFile === null}
        isLoading={loadingInfo.pdfDocumentIsLoading}
        onClick={parseSelectedPDFFile}
      >
        Use File
      </Button>

      {PDFFlowData.parsedPDFDocument !== null && (
        <PDFPagesParsingManager
          loadingInfo={loadingInfo}
          PDFFlowData={PDFFlowData}
          setLessonContent={setLessonContent}
          setLoadingInfo={setLoadingInfo}
          setPDFFlowData={setPDFFlowData}
        />
      )}
    </FormControl>
  )
}

function LessonSource({ setLevelIsCompleted }) {
  const PDFSourceSwitchId = uniqueId("pdf-source-switch")
  const lessonTextareaId = uniqueId("lesson-textarea")

  const newLessonData = useContext(NewLessonDataContext)
  const [PDFSwitchIsOn, setPDFSwitchIsOn] = useState(false)
  const [lessonContent, setLessonContent] = useState("")

  function handleLessonContentChange(event) {
    setLessonContent((newLessonData.content = event.target.value))
  }

  const lessonContentWordCount = countWords(lessonContent)
  const lessonContentIsValid =
    lessonContent.length <= MAX_LESSON_CONTENT_CHAR_COUNT &&
    lessonContentWordCount >= MIN_LESSON_CONTENT_WORD_COUNT &&
    lessonContentWordCount <= MAX_LESSON_CONTENT_WORD_COUNT

  /**
   * Wrap the function call within setTimeout to delay execution of the state
   * update as it is going to run within a component render and not in a
   * callback which could result in the error discussed on this issue:
   * https://github.com/facebook/react/issues/18178
   */
  setTimeout(() => setLevelIsCompleted(lessonContentIsValid))

  useEffect(() => {
    setLessonContent(newLessonData.content)
  }, [newLessonData.content])

  return (
    <Box mt="20px">
      <Accordion allowToggle mb="20px">
        <AccordionItem>
          <AccordionButton p="10px 0">
            <Box as="span" flex="1" textAlign="left">
              Configure PDF Source
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel
            borderColor="blackAlpha.200"
            borderStyle="solid"
            borderWidth="1px 0 0"
            m="0"
            p="20px 0 10px"
          >
            <FormControl alignItems="flex-start" display="flex">
              <FormLabel htmlFor={PDFSourceSwitchId} mb="0">
                Use a PDF file as lesson source
              </FormLabel>
              <Switch
                colorScheme="green"
                defaultChecked={false}
                id={PDFSourceSwitchId}
                onChange={(event) => {
                  setPDFSwitchIsOn(event.target.checked)
                }}
              />
            </FormControl>

            {PDFSwitchIsOn && (
              <Box pt="20px">
                <PDFLessonContentSource
                  setLessonContent={(content) => {
                    // Set new lesson data since setLessonContent won't trigger a
                    // change event of the textarea
                    newLessonData.content = content
                    setLessonContent(content)
                  }}
                />
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Box>
        <FormControl
          isInvalid={lessonContent.length !== 0 && !lessonContentIsValid}
          isRequired
        >
          <FormLabel htmlFor={lessonTextareaId}>
            The content of the lesson
          </FormLabel>
          <Textarea
            h="150px"
            id={lessonTextareaId}
            maxLength={MAX_LESSON_CONTENT_CHAR_COUNT}
            onChange={handleLessonContentChange}
            placeholder="- - - -"
            type="text"
            value={lessonContent}
          />
          <Flex gap="20px" justifyContent="space-between">
            {lessonContent === "" || lessonContentIsValid ? (
              <FormHelperText>
                Lesson content cannot be more than{" "}
                {MAX_LESSON_CONTENT_CHAR_COUNT} characters long, must be at
                least {MIN_LESSON_CONTENT_WORD_COUNT} words long, and at most,{" "}
                {MAX_LESSON_CONTENT_WORD_COUNT} words long
                <br />
                For best results, make sure to break paragraphs as often as
                possible with double line breaks. <br /> This helps to create
                better questions from the content.
              </FormHelperText>
            ) : (
              <FormErrorMessage>
                Lesson content cannot be more than{" "}
                {MAX_LESSON_CONTENT_CHAR_COUNT} characters long, must be at
                least {MIN_LESSON_CONTENT_WORD_COUNT} words long, and at most,{" "}
                {MAX_LESSON_CONTENT_WORD_COUNT} words long
              </FormErrorMessage>
            )}

            {lessonContent === "" || lessonContentIsValid ? (
              <FormHelperText>
                {lessonContentWordCount !== 1
                  ? `${lessonContentWordCount} words`
                  : `${lessonContentWordCount} word`}{" "}
                -{" "}
                {lessonContent.length !== 1
                  ? `${lessonContent.length} chars`
                  : `${lessonContent.length} char`}
              </FormHelperText>
            ) : (
              <FormErrorMessage>
                {lessonContentWordCount !== 1
                  ? `${lessonContentWordCount} words`
                  : `${lessonContentWordCount} word`}{" "}
                -{" "}
                {lessonContent.length !== 1
                  ? `${lessonContent.length} chars`
                  : `${lessonContent.length} char`}
              </FormErrorMessage>
            )}
          </Flex>
        </FormControl>
      </Box>
    </Box>
  )
}

function LessonAdditionalData({ setLevelIsCompleted }) {
  const newLessonData = useContext(NewLessonDataContext)
  const toast = useToast()
  const tagInputRef = useRef()
  const [tags, setTags] = useState([])

  const tagInputId = uniqueId("tag-input")
  const tagInputHelperText = `Tag labels must be between ${MIN_TAG_LABEL_CHAR_COUNT} and ${MAX_TAG_LABEL_CHAR_COUNT} characters long with no whitespace`

  /**
   * Wrap the function call within setTimeout to delay execution of the state
   * update as it is going to run within a component render and not in a
   * callback which could result in the error discussed on this issue:
   * https://github.com/facebook/react/issues/18178
   */
  setTimeout(() => setLevelIsCompleted(tags.length >= 1))

  function addInputTag() {
    const tagInputElem = tagInputRef.current
    const inputTagLabel = tagInputElem.value

    if (tags.length >= 5) {
      toast({
        title: "Too many tags",
        description: "A lesson cannot have more than 5 tags",
        status: "error",
        duration: 10000,
        isClosable: true
      })
      return
    }

    if (
      inputTagLabel.length < MIN_TAG_LABEL_CHAR_COUNT ||
      inputTagLabel.length > MAX_TAG_LABEL_CHAR_COUNT ||
      /\s+/.test(inputTagLabel)
    ) {
      toast({
        title: "Invalid tag label",
        description: tagInputHelperText,
        status: "error",
        duration: 10000,
        isClosable: true
      })
      return
    }

    tagInputElem.value = ""
    setTags(
      (newLessonData.tags = Array.from(new Set([...tags, inputTagLabel])))
    )
  }

  function removeTag(tagLabel) {
    const tagsSet = new Set(tags)
    if (!tagsSet.has(tagLabel)) return

    tagsSet.delete(tagLabel)
    setTags((newLessonData.tags = Array.from(tagsSet)))
  }

  useEffect(() => {
    setTags(newLessonData.tags)
  }, [newLessonData.tags])

  return (
    <Box
      as="form"
      maxW="600px"
      mt="20px"
      onSubmit={(event) => {
        event.preventDefault()
        addInputTag()
      }}
    >
      <FormControl isRequired mb="20px">
        <FormLabel htmlFor={tagInputId}>Enter tag name</FormLabel>
        <Input
          id={tagInputId}
          minLength={MIN_TAG_LABEL_CHAR_COUNT}
          maxLength={MAX_TAG_LABEL_CHAR_COUNT}
          placeholder="- - - -"
          ref={tagInputRef}
          type="text"
        />
        <FormHelperText>{tagInputHelperText}</FormHelperText>
      </FormControl>

      {tags.length > 0 && (
        <Box mb="20px">
          <Flex gap="10px" flexWrap="wrap">
            {tags.map((tag) => (
              <Tag
                borderRadius="full"
                colorScheme="teal"
                key={tag}
                size="lg"
                variant="solid"
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={removeTag.bind(null, tag)} />
              </Tag>
            ))}
          </Flex>
        </Box>
      )}

      <Button type="submit">Add tag</Button>
    </Box>
  )
}

function LessonCreationSection() {
  const [metadataIsSet, setMetaDataIsSet] = useState(false)
  const [lessonSourceIsSet, setLessonSourceIsSet] = useState(false)
  const [isCreatingLesson, setIsCreatingLesson] = useState(false)
  const [tagsAreSet, setTagsAreSet] = useState(false)

  const router = useRouter()
  const toast = useToast()
  const newLessonData = useContext(NewLessonDataContext)
  const { activeStep, nextStep, prevStep } = useSteps({
    initialStep: 0
  })

  const indexOfHighestStep = 2
  const stepsCompletionData = [metadataIsSet, lessonSourceIsSet, tagsAreSet]

  async function createLessonInBackend(lessonData) {
    let lessonId = null
    let errorOccured = false

    try {
      const lessonCreationResult = await API.graphql({
        query: mutations.createLesson,
        variables: { input: lessonData }
      })

      if (
        typeof lessonCreationResult.errors === "object" &&
        lessonCreationResult.errors !== null
      ) {
        throw lessonCreationResult
      }

      lessonId = lessonCreationResult.data.createLesson.id
    } catch (error) {
      errorOccured = true
    }

    return { lessonId, errorOccured }
  }

  function notifyUserOfLessonCreationError(lessonCreationToastId) {
    toast.update(lessonCreationToastId, {
      title: "Failed to create lesson",
      description: "An error occured while creating the lesson",
      status: "error",
      isClosable: true
    })
  }

  async function getUncreatedTags(tagLabels) {
    if (!Array.isArray(tagLabels)) throw new Error()

    let errorOccured = false
    let uncreatedTags = null

    try {
      const tagsFetchingResult = await Promise.all(
        tagLabels.map((tagLabel) =>
          API.graphql({
            query: queries.getTag,
            variables: { label: tagLabel }
          })
        )
      )

      const someResultContainErrors = tagsFetchingResult.some(
        (result) => typeof result.errors === "object" && result.errors !== null
      )
      if (someResultContainErrors) throw new Error()

      uncreatedTags = tagLabels.filter((tagLabel, index) => {
        const resultForLabel = tagsFetchingResult[index]
        return (
          typeof resultForLabel.data.getTag !== "object" ||
          resultForLabel.data.getTag === null
        )
      })

      if (uncreatedTags.length === 0) uncreatedTags = null
    } catch (error) {
      errorOccured = true
    }

    return { uncreatedTags, errorOccured }
  }

  async function createTagsInBackend(tagLabels) {
    if (!Array.isArray(tagLabels)) throw new Error()
    let errorOccured = false

    /**
     * When experimenting with this, it is noticed that amplify causes AppSync
     * to error by returning `null` for the `lessons` field on
     * `result.data.createTag`. This is most likely an issue with amplify
     * codegen, and there's nothing that can be done from my end (as far as I
     * know). Feel free to reach out if you know of the reason for the error.
     * The exact error message starts with "Cannot return null for non-nullable
     * type" which is what I'm going to be using here. Also, Promise.allSettled
     * is used to make sure that all of the requests results are completed.
     *
     * So, instead of just checking the `errors` field of the result to
     * determine if there's an error, I'll not consider the error if
     * the `data` field's `createTag` field if it's not null, the `lessons`
     * field on that is null, and there's just one error, and the message starts
     * with "Cannot return null for non-nullable type".
     */
    try {
      const tagCreationSettledResults = await Promise.allSettled(
        tagLabels.map((tagLabel) =>
          API.graphql({
            query: mutations.createTag,
            variables: { input: { label: tagLabel } }
          })
        )
      )

      const someResultContainErrors = tagCreationSettledResults.some(
        (settledResult) => {
          const result = settledResult.reason
          const resultData = result.data
          const resultErrors = result.errors

          const isExpectedError =
            settledResult.status === "rejected" &&
            typeof resultData === "object" &&
            resultData !== null &&
            resultData.createTag.lessons === null &&
            Array.isArray(resultErrors) &&
            resultErrors.length === 1 &&
            resultErrors[0].message?.startsWith(
              "Cannot return null for non-nullable type"
            )

          return (
            typeof resultErrors === "object" &&
            resultErrors !== null &&
            !isExpectedError
          )
        }
      )

      if (someResultContainErrors) throw tagCreationSettledResults
    } catch (error) {
      errorOccured = true
    }

    return { errorOccured }
  }

  async function createLessonTagsInBackend(lessonId, tagLabels) {
    if (!Array.isArray(tagLabels)) throw new Error()
    let errorOccured = false

    try {
      const lessonTagsCreationResult = await Promise.all(
        tagLabels.map((tagLabel) =>
          API.graphql({
            query: mutations.createLessonTags,
            variables: { input: { lessonId, tagLabel } }
          })
        )
      )

      const someResultContainErrors = lessonTagsCreationResult.some(
        (result) => typeof result.errors === "object" && result.errors !== null
      )

      if (someResultContainErrors) throw lessonTagsCreationResult
    } catch (error) {
      errorOccured = true
    }

    return { errorOccured }
  }

  async function createLessonWithProvidedData() {
    setIsCreatingLesson(true)

    const lessonCreationToastId = toast({
      title: "Attempting to create lesson",
      description: "Your request is being processed",
      status: "info",
      duration: null,
      position: "top",
      isClosable: true
    })

    const {
      title: lessonTitle,
      description: lessonDescription,
      content: lessonContent,
      tags: lessonTags
    } = newLessonData

    const lessonCreationResult = await createLessonInBackend({
      title: lessonTitle,
      description: lessonDescription,
      content: lessonContent
    })

    if (lessonCreationResult.errorOccured) {
      notifyUserOfLessonCreationError(lessonCreationToastId)
      setIsCreatingLesson(false)
      return
    }

    // Convert lesson tags to lower case
    const validTagLabels = lessonTags.map((lessonTag) =>
      String.prototype.toLowerCase.call(lessonTag)
    )

    const uncreatedTagsRetrievalResult = await getUncreatedTags(validTagLabels)
    if (uncreatedTagsRetrievalResult.errorOccured) {
      notifyUserOfLessonCreationError(lessonCreationToastId)
      setIsCreatingLesson(false)
      return
    }

    const { uncreatedTags } = uncreatedTagsRetrievalResult
    if (Array.isArray(uncreatedTags)) {
      const tagsCreationResult = await createTagsInBackend(uncreatedTags)
      if (tagsCreationResult.errorOccured) {
        notifyUserOfLessonCreationError(lessonCreationToastId)
        setIsCreatingLesson(false)
        return
      }
    }

    const lessonTagsCreationResult = await createLessonTagsInBackend(
      lessonCreationResult.lessonId,
      validTagLabels
    )
    if (lessonTagsCreationResult.errorOccured) {
      notifyUserOfLessonCreationError(lessonCreationToastId)
      setIsCreatingLesson(false)
      return
    }

    // At this point all actions have been completed, and the user can be
    // redirected to the revision page
    toast.update(lessonCreationToastId, {
      title: "Lesson created successfully",
      description: "Redirecting to lesson revision page",
      status: "success",
      isClosable: true
    })

    setTimeout(
      () => router.push(LESSON_REVISION_URL.for(lessonCreationResult.lessonId)),
      1500
    )
  }

  return (
    <Box pb="20px">
      <Heading as="h1" p="20px">
        Create New Lesson
      </Heading>

      <Box maxW="600px" mb="20px" p="0 20px">
        <Steps activeStep={activeStep} colorScheme="purple" variant="circles">
          <Step label="Provide Metadata">
            <LessonMetadata setLevelIsCompleted={setMetaDataIsSet} />
          </Step>
          <Step label="Provide source">
            <LessonSource setLevelIsCompleted={setLessonSourceIsSet} />
          </Step>
          <Step label="Add tags">
            <LessonAdditionalData setLevelIsCompleted={setTagsAreSet} />
          </Step>
        </Steps>
      </Box>

      <VStack
        alignItems="flex-start"
        borderColor="blackAlpha.200"
        borderStyle="solid"
        borderWidth="1px 0 0"
        p="20px 20px 0"
        spacing="20px"
      >
        <ButtonGroup variant="solid">
          <Button isDisabled={activeStep <= 0} onClick={prevStep}>
            Prev
          </Button>
          <Button
            isDisabled={
              activeStep >= indexOfHighestStep ||
              stepsCompletionData[activeStep] !== true
            }
            onClick={nextStep}
          >
            Next
          </Button>
        </ButtonGroup>

        <Button
          colorScheme="teal"
          isDisabled={
            activeStep < indexOfHighestStep ||
            stepsCompletionData.some(
              (stepCompletion) => stepCompletion === false
            )
          }
          isLoading={isCreatingLesson}
          mb="20px"
          onClick={createLessonWithProvidedData}
        >
          Create Lesson
        </Button>
      </VStack>
    </Box>
  )
}

export default function NewLessonCreationPage() {
  const newLessonDataContextValue = useMemo(
    () => ({ ...DEFAULT_NEW_LESSON_DATA }),
    []
  )

  return (
    <ChakraUIProvider useSteps>
      <AppLayout pageTitle={`Create New Lesson | ${SITE_TITLE}`}>
        <AppLayoutMinorSection>
          <SideBar>
            <TopLevelNavGroup activeURL={ADD_NEW_LESSON_URL} />
          </SideBar>
        </AppLayoutMinorSection>
        <AppLayoutMajorSection>
          <AppLayoutTopSection>
            <TopBar />
          </AppLayoutTopSection>
          <AppLayoutMainSection>
            <NewLessonDataContext.Provider value={newLessonDataContextValue}>
              <LessonCreationSection />
            </NewLessonDataContext.Provider>
          </AppLayoutMainSection>
        </AppLayoutMajorSection>
      </AppLayout>
    </ChakraUIProvider>
  )
}

NewLessonCreationPage.accessPolicies = [
  {
    type: AccessPolicyTypes.USER_IS_AUTHENTICATED,
    alternateSource: SIGN_IN_PAGE_URL
  }
]
