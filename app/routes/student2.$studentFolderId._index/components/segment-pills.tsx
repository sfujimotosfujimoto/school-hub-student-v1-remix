import { NavLink, useNavigation } from "@remix-run/react"
import clsx from "clsx"

function setSearchParams(url: string, key: string, value: string) {
  const _url = new URL(url)
  _url.searchParams.set(key, value ? value : "ALL")
  return _url.href
}

export default function SegmentPills({
  url,
  extensions,
  segments,
}: {
  url: string
  extensions: string[]
  segments: string[]
}) {
  const _url = new URL(url)
  const currentSegment = _url.searchParams.get("segments")

  const navigate = useNavigation()

  const isNavigating = navigate.state !== "idle"
  const navSearch = navigate.location?.search

  return (
    <div className="mt-4">
      <div className={`flex flex-wrap gap-2`}>
        <NavLink
          to={`${_url.pathname}?extensions=ALL&segments=ALL`}
          key="ALL"
          className={`btn btn-xs border-none bg-sfred-200 shadow-md duration-200 hover:-translate-y-[1px] hover:bg-sfred-300`}
        >
          ALL
        </NavLink>
        {extensions &&
          extensions.sort().map((ext, idx) => (
            <NavLink
              to={`${setSearchParams(_url.href, "extensions", ext)}`}
              key={idx}
              className={({ isActive, isPending }) =>
                clsx(
                  `btn btn-xs border-none bg-sky-300 shadow-md duration-200 hover:-translate-y-[1px] hover:bg-sky-400`,
                  { disabled: isPending },
                  {
                    "extension-active":
                      _url.searchParams.get("extensions") === ext,
                  },
                )
              }
            >
              {ext}
            </NavLink>
          ))}
        {segments &&
          segments.sort().map((segment, idx) => (
            <NavLink
              to={`${setSearchParams(_url.href, "segments", segment)}`}
              key={idx}
              className={({ isActive, isPending }) =>
                clsx(
                  `btn btn-warning btn-xs border-none shadow-md duration-200 hover:-translate-y-[1px] hover:bg-sfyellow-200`,
                  { disabled: isPending },
                  { "segment-active": currentSegment === segment },
                  {
                    "segment-active-navigating":
                      navSearch?.includes(`segments=${encodeURI(segment)}`) &&
                      isNavigating,
                  },
                )
              }
            >
              {segment}
            </NavLink>
          ))}
      </div>
    </div>
  )
}
