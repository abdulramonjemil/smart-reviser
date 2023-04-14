import { AccessPolicyIDs } from "../controllers/firewall"
import Layout from "../components/layout"
import { SIGN_IN_PAGE_URL } from "../constants/page-urls"
import { SITE_TITLE } from "../constants/site-details"

export default function Home() {
  return (
    <Layout pageTitle={`Home | ${SITE_TITLE}`}>Please eat your food</Layout>
  )
}

Home.accessPolicies = [
  {
    id: AccessPolicyIDs.USER_IS_AUTHENTICATED,
    alternateSource: SIGN_IN_PAGE_URL
  }
]
