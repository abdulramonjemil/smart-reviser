import { Box, Flex, useBreakpointValue } from "@chakra-ui/react"
import Head from "next/head"
import { createContext, useContext, useMemo, useState } from "react"

export function BasicLayout({ pageTitle, children }) {
  return (
    <main>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {children}
    </main>
  )
}

const AppLayoutContext = createContext({
  isOnDesktopMode: true,
  minorSectionIsOpen: false,
  setMinorSectionOpenState: () => {}
})

export const useAppLayout = () => useContext(AppLayoutContext)

const DESKTOP_MODE_BREAK_POINT = "md" // Mobile first approach

/*
  The app layout components are meant to be used as follows:
  <AppLayout>
    <AppLayoutMinorSection />
    <AppLayoutMajorSection>
      <AppLayoutTopSection />
      <AppLayoutMainSection />
    </AppLayoutMajorSection>
  </AppLayout>
*/
export function AppLayout({ children, pageTitle }) {
  const [appLayoutMinorSectionIsOpen, setAppLayoutMinorSectionIsOpen] =
    useState(false)

  const appIsOnDesktopMode = useBreakpointValue(
    { base: false, [DESKTOP_MODE_BREAK_POINT]: true },
    { ssr: false }
  )

  const appLayoutContextValue = useMemo(
    () => ({
      isOnDesktopMode: appIsOnDesktopMode,
      minorSectionIsOpen: appLayoutMinorSectionIsOpen,
      setMinorSectionOpenState: (openState) => {
        setAppLayoutMinorSectionIsOpen(Boolean(openState))
      }
    }),
    [appIsOnDesktopMode, appLayoutMinorSectionIsOpen]
  )

  return (
    <AppLayoutContext.Provider value={appLayoutContextValue}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Flex bg="white" flexDir="row" h="100vh" overflow="hidden">
        {children}
      </Flex>
    </AppLayoutContext.Provider>
  )
}

export function AppLayoutMinorSection({ children }) {
  const {
    isOnDesktopMode: appIsOnDesktopMode,
    minorSectionIsOpen: appMinorSectionIsOpen
  } = useAppLayout()

  if (!appIsOnDesktopMode && !appMinorSectionIsOpen) return ""

  return (
    <Box
      bg="white"
      flex="0 0 250px"
      h="100vh"
      overflow="hidden"
      position={appIsOnDesktopMode ? "static" : "absolute"}
      w="250px"
      zIndex={1}
    >
      {children}
    </Box>
  )
}

export function AppLayoutMajorSection({ children }) {
  const { isOnDesktopMode: appIsOnDesktopMode, minorSectionIsOpen } =
    useAppLayout()

  return (
    <Flex
      bg="white"
      flex="1 1 300px"
      flexDir="column"
      h="100vh"
      overflow="hidden"
      position="relative"
    >
      {children}
      {/* Used as an overlay for when the minor section is open */}
      {minorSectionIsOpen && !appIsOnDesktopMode && (
        <Box
          bg="blackAlpha.700"
          h="100%"
          left="0"
          position="absolute"
          top="0"
          w="100%"
        />
      )}
    </Flex>
  )
}

export function AppLayoutTopSection({ children }) {
  const { isOnDesktopMode: appIsOnDesktopMode } = useAppLayout()
  if (appIsOnDesktopMode) return ""

  return (
    <Box bg="white" flex="0 0 60px" overflow="hidden">
      {children}
    </Box>
  )
}

export function AppLayoutMainSection({ children }) {
  return (
    <Box bg="blackAlpha.100" flex="1 1 200px" overflow="auto">
      {children}
    </Box>
  )
}
