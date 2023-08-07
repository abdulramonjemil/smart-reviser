import { Html, Head, Main, NextScript } from "next/document"
import { SITE_TITLE, SITE_TAGLINE } from "../constants/site-details"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/assets/site-icon.ico" />
        <meta name="description" content={SITE_TAGLINE} />
        <meta name="og:title" content={SITE_TITLE} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
