import { useRouter } from "next/router"
import { AccessPolicyTypes } from "../controllers/policy"
import { ALL_LESSONS_URL, SIGN_IN_PAGE_URL } from "../constants/page-urls"

export default function Home() {
  const router = useRouter()
  // The home page should go to the lessons page automatically
  router.replace(ALL_LESSONS_URL)
  return ""
}

Home.accessPolicies = [
  {
    type: AccessPolicyTypes.USER_IS_AUTHENTICATED,
    alternateSource: SIGN_IN_PAGE_URL
  }
]
