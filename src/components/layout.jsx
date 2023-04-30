import { Box, Flex } from "@chakra-ui/react"
import Head from "next/head"

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

export function AppLayout({ children, pageTitle }) {
  return (
    <Flex flexDir="row" minW="850px">
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {children}
    </Flex>
  )
}

export function AppLayoutSidebar({ children }) {
  return (
    <Box flex="0 0 250px" h="100vh">
      {children}
    </Box>
  )
}

export function AppLayoutMainSection({ children }) {
  return (
    <Box flex="1 1 300px" h="100vh" overflow="auto">
      {children}
    </Box>
  )
}
