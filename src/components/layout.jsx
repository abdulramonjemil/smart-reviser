import Head from "next/head"

export default function Layout({ pageTitle, children }) {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <main>{children}</main>
    </>
  )
}
