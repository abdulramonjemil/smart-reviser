import { Link } from "@chakra-ui/next-js"
import {
  Avatar,
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  List,
  ListIcon,
  ListItem,
  useToast,
  VStack
} from "@chakra-ui/react"

import { Auth } from "aws-amplify"
import { useRouter } from "next/router"

import { AiOutlineUser } from "react-icons/ai"
import { CgAddR } from "react-icons/cg"
import { FiLogOut } from "react-icons/fi"
import { HiOutlineCollection } from "react-icons/hi"
import { TfiMenu } from "react-icons/tfi"
import { VscChromeClose } from "react-icons/vsc"

import {
  ADD_NEW_LESSON_URL,
  ALL_LESSONS_URL,
  SIGN_IN_PAGE_URL
} from "../constants/page-urls"
import { SITE_TITLE } from "../constants/site-details"
import { useLastAuth } from "../controllers/auth"
import { Fonts } from "../controllers/style"
import {
  AccessPolicyTypes,
  useAccessPolicyManager
} from "../controllers/policy"
import { useAppLayout } from "./layout"

export function NavItem({ children, href, icon, isActive = false, onClick }) {
  return (
    <ListItem>
      <Link
        alignItems="center"
        bg={isActive ? "blackAlpha.400" : "transparent"}
        borderRadius="4px"
        color="gray.300"
        display="flex"
        fontSize=".9rem"
        href={href}
        m="0 10px"
        onClick={onClick}
        p="8px"
        textDecor="none"
        _focus={{ bg: "blackAlpha.400" }}
        _hover={{ bg: "blackAlpha.400" }}
      >
        <ListIcon
          as={icon}
          bg={isActive ? "gray.300" : "transparent"}
          borderRadius="2px"
          color={isActive ? "brand.primary" : "gray.300"}
          fontSize="1.5rem"
          p={isActive ? "3px" : "1px"}
        />
        {children}
      </Link>
    </ListItem>
  )
}

export function NavGroup({ heading, children }) {
  return (
    <List display="flex" flexDir="column" gap="2px" mb="30px">
      <Heading
        as="div"
        color="gray.300"
        fontFamily="fonts.body"
        fontSize=".85rem"
        fontWeight="500"
        mb="-5px"
        padding="0 20px 10px"
        textTransform="uppercase"
      >
        {heading}
      </Heading>
      {children}
    </List>
  )
}

export function TopLevelNavGroup({ activeURL = "" }) {
  return (
    <NavGroup heading="Quick Actions">
      <NavItem
        href={ADD_NEW_LESSON_URL}
        icon={CgAddR}
        isActive={activeURL === ADD_NEW_LESSON_URL}
      >
        Add new lesson
      </NavItem>
      <NavItem
        href={ALL_LESSONS_URL}
        icon={HiOutlineCollection}
        isActive={activeURL === ALL_LESSONS_URL}
      >
        View all lessons
      </NavItem>
    </NavGroup>
  )
}

export function SideBar({ children }) {
  const { user: lastAuthUser } = useLastAuth()
  const router = useRouter()
  const toast = useToast()
  const { isOnDesktopMode: appIsOnDesktopMode, setMinorSectionOpenState } =
    useAppLayout()

  const accessPolicyManager = useAccessPolicyManager()

  async function handleSignOutButtonClick(event) {
    event.preventDefault()
    accessPolicyManager.ignoreType(AccessPolicyTypes.USER_IS_AUTHENTICATED)

    const signOutToastIdRef = toast({
      title: "Attempting sign out",
      description: "You will be signed out shortly",
      status: "info",
      duration: null,
      isClosable: false
    })

    try {
      await Auth.signOut()
      toast.update(signOutToastIdRef, {
        title: "Signed out successfully",
        description: "Redirecting to sign in page",
        status: "success"
      })

      setTimeout(() => {
        router.push(SIGN_IN_PAGE_URL)
      }, 2000)
    } catch (error) {
      accessPolicyManager.includeType(AccessPolicyTypes.USER_IS_AUTHENTICATED)
      toast.update(signOutToastIdRef, {
        title: "Error signing out",
        description: "Could not sign out successfully",
        status: "error",
        duration: 10000,
        isClosable: true
      })
    }
  }

  return (
    <Flex
      as="aside"
      bg="brand.primary"
      flexDir="column"
      h="100%"
      overflow="auto"
    >
      <Flex
        alignItems="flex-start"
        justifyContent="space-between"
        m="20px 10px 40px 20px"
      >
        <Link href="/" _hover={{ opacity: ".9" }}>
          <Image
            alt={`${SITE_TITLE} logo`}
            borderRadius="4px"
            flex="0 0 max-content"
            h="50px"
            w="50px"
            src="/assets/site-logo-bg-white.svg"
          />
        </Link>

        {!appIsOnDesktopMode && (
          <IconButton
            aria-label="Close menu"
            color="white"
            icon={<VscChromeClose />}
            onClick={() => {
              setMinorSectionOpenState(false)
            }}
            size="lg"
            variant="ghost"
            _focus={{ bg: "blackAlpha.400" }}
            _hover={{ bg: "blackAlpha.400" }}
          />
        )}
      </Flex>

      <Flex
        display="flex"
        flex="1 1 max-content"
        flexDir="column"
        justifyContent="space-between"
        padding="0 0 10px"
      >
        <Box>{children}</Box>

        {/* Authentication Actions */}
        <Flex
          borderTop="1px solid"
          borderColor="gray.300"
          flexDir="column"
          pt="10px"
          mt="15px"
        >
          <VStack
            display="flex"
            alignItems="flex-start"
            p="0 20px"
            mb="5px"
            spacing="10px"
          >
            <Avatar
              borderColor="gray.300"
              borderRadius="full"
              borderStyle="solid"
              borderWidth="2px"
              bg="gray.900"
              icon={<AiOutlineUser color="" fontSize="1.5rem" />}
              m="0"
            />
            <Box color="gray.300" p="0 0 10px">
              {lastAuthUser.attributes.name}
            </Box>
          </VStack>

          <Link
            alignItems="center"
            borderRadius="4px"
            color="gray.300"
            display="flex"
            fontSize=".9rem"
            href="#"
            m="0 10px"
            onClick={handleSignOutButtonClick}
            p="8px"
            textDecor="none"
            _focus={{ bg: "blackAlpha.400" }}
            _hover={{ bg: "blackAlpha.400" }}
          >
            <Icon as={FiLogOut} color="gray.300" fontSize="1.2rem" mr=".4rem" />
            Log out
          </Link>
        </Flex>
      </Flex>
    </Flex>
  )
}

export function TopBar() {
  const { setMinorSectionOpenState } = useAppLayout()

  return (
    <Flex
      alignItems="center"
      borderBottom="1px solid gray"
      borderColor="gray.300"
      justifyContent="space-between"
      bg="white"
      h="100%"
      p="0 20px"
      w="100%"
    >
      <Link
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        href="/"
        _hover={{ opacity: ".9" }}
      >
        <Image
          alt={`${SITE_TITLE} logo`}
          borderRadius="4px"
          flex="0 0 max-content"
          h="40px"
          mr="10px"
          w="40px"
          src="/assets/site-logo.svg"
        />
        <Box
          as="span"
          color="brand.primary"
          display={{ base: "none", sm: "block" }}
          fontFamily={Fonts.heading}
          fontSize="1.6rem"
          fontWeight="600"
        >
          {SITE_TITLE}
        </Box>
      </Link>

      <IconButton
        aria-label="Close menu"
        color="brand.primary"
        icon={<TfiMenu />}
        onClick={() => {
          setMinorSectionOpenState(true)
        }}
        size="lg"
        variant="ghost"
        _focus={{ bg: "blackAlpha.200" }}
        _hover={{ bg: "blackAlpha.200" }}
      />
    </Flex>
  )
}
