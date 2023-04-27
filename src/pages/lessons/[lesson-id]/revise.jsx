import {
  AppLayout,
  AppLayoutMainSection,
  AppLayoutSidebar
} from "../../../components/layout"
import { SideBar, TopLevelNavGroup } from "../../../components/sidebar"
import { SITE_TITLE } from "../../../constants/site-details"
import { ChakraUIProvider } from "../../../controllers/chakra-ui"

export default function ReviseSpecificLesson() {
  return (
    <ChakraUIProvider>
      <AppLayout pageTitle={`My Lessons | ${SITE_TITLE}`}>
        <AppLayoutSidebar>
          <SideBar>
            <TopLevelNavGroup />
          </SideBar>
        </AppLayoutSidebar>
        <AppLayoutMainSection>I don't like this</AppLayoutMainSection>
      </AppLayout>
    </ChakraUIProvider>
  )
}
