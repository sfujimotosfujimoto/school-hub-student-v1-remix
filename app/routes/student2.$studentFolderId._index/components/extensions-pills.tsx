import { useNavigation } from "@remix-run/react"

import { NavLinkPill } from "~/components/buttons/button"

function setSearchParams(url: string, key: string, value: string) {
  const _url = new URL(url)
  _url.searchParams.set(key, value ? value : "ALL")
  return _url.href
}

export default function ExtensionPills({
  url,
  extensions,
}: {
  url: string
  extensions: string[]
}) {
  const _url = new URL(url)
  // const currentSegment = _url.searchParams.get("segments")

  const navigate = useNavigation()

  const isNavigating = navigate.state !== "idle"
  const navSearch = navigate.location?.search

  return (
    <>
      {extensions &&
        extensions
          .sort()
          .map((ext, idx) => (
            <NavLinkPill
              to={`${setSearchParams(_url.href, "extensions", ext)}`}
              key={idx}
              url={_url}
              hoverColor="bg-sky-400"
              navSearch={navSearch}
              isNavigating={isNavigating}
              name={ext}
              searchParam="extensions"
            />
          ))}
    </>
  )
}
