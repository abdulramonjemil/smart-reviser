import { Link } from "@chakra-ui/next-js"
import {
  Avatar,
  Box,
  Flex,
  Heading,
  Icon,
  Image,
  List,
  ListIcon,
  ListItem,
  VStack
} from "@chakra-ui/react"

import { AiOutlineUser } from "react-icons/ai"
import { BsCollection } from "react-icons/bs"
import { CgAddR } from "react-icons/cg"
import { FiLogOut } from "react-icons/fi"

import { ADD_NEW_LESSON_URL, ALL_LESSONS_URL } from "../constants/page-urls"
import { SITE_TITLE } from "../constants/site-details"
import { useAuth } from "../controllers/auth"

export function NavItem({ children, href, icon, isActive = false }) {
  const itemColor = isActive ? "white" : "gray.300"
  const itemFontWeight = isActive ? "700" : "400"

  return (
    <ListItem>
      <Link
        alignItems="center"
        borderRadius="4px"
        color={itemColor}
        display="flex"
        fontSize=".9rem"
        fontWeight={itemFontWeight}
        href={href}
        m="0 10px"
        p="8px"
        textDecor="none"
        _focus={{ bg: "blackAlpha.400" }}
        _hover={{ bg: "blackAlpha.400" }}
      >
        <ListIcon as={icon} color={itemColor} fontSize="1.2rem" />
        {children}
      </Link>
    </ListItem>
  )
}

export function NavGroup({ heading, children }) {
  return (
    <List display="flex" flexDir="column" gap="5px" mb="20px">
      <Heading
        as="div"
        color="gray.300"
        fontFamily="fonts.body"
        fontSize=".85rem"
        fontWeight="500"
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
        icon={BsCollection}
        isActive={activeURL === ALL_LESSONS_URL}
      >
        View all lessons
      </NavItem>
    </NavGroup>
  )
}

export function SideBar({ children }) {
  const { user } = useAuth()

  return (
    <Flex
      as="aside"
      bg="brand.primary"
      flexDir="column"
      h="100vh"
      overflow="auto"
    >
      <Image
        alt={`${SITE_TITLE} logo`}
        borderRadius="4px"
        flex="0 0 max-content"
        h="50px"
        m="20px 20px 40px"
        w="50px"
        src="/assets/site-logo-bg-white.svg"
      />

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
              {user.attributes.name}
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
