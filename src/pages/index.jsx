import { AccessPolicyTypes } from "../controllers/firewall"
import { BasicLayout } from "../components/layout"
import { SIGN_IN_PAGE_URL } from "../constants/page-urls"
import { SITE_TITLE } from "../constants/site-details"

export default function Home() {
  return (
    <BasicLayout pageTitle={`Home | ${SITE_TITLE}`}>
      Please eat your food
    </BasicLayout>
  )
}

Home.accessPolicies = [
  {
    type: AccessPolicyTypes.USER_IS_AUTHENTICATED,
    alternateSource: SIGN_IN_PAGE_URL
  }
]
