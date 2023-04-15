import Head from "next/head"

// eslint-disable-next-line import/prefer-default-export
export function BasicLayout({ pageTitle, children }) {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <main>{children}</main>
    </>
  )
}
