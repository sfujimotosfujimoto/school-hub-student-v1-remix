import { NavLink, useNavigation } from "@remix-run/react"
import clsx from "clsx"
import React from "react"

function setSearchParams(url: string, tag: string) {
  const _url = new URL(url)
  _url.searchParams.set("tags", tag ? tag : "ALL")
  return _url.href
}

export default function TagButtons({
  url,
  tags,
  tag,
  color,
}: {
  url: string
  tags: string[]
  tag: string
  color: string
}) {
  const _url = new URL(url)
  const currentTag = _url.searchParams.get("tags")
  const navigate = useNavigation()

  const isNavigating = navigate.state !== "idle"
  const navSearch = navigate.location?.search

  return (
    <div data-name="TagsButtons.tsx" className={`flex flex-wrap gap-2`}>
      <NavLink
        to={`${_url.pathname}?tags=ALL`}
        className={({ isActive, isPending }) =>
          clsx(
            `btn btn-xs border-none shadow-md ${color}   font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfgreen-300`,
            { disabled: isPending },
            { "tag-active": currentTag === "ALL" },
            {
              "tag-active-navigating":
                navSearch?.includes(`tags=ALL`) && isNavigating,
            },
          )
        }
      >
        ALL
      </NavLink>
      {tags.map((t) => (
        <NavLink
          to={`${setSearchParams(_url.href, t)}`}
          key={t}
          className={({ isActive, isPending }) =>
            clsx(
              `btn btn-xs border-none shadow-md ${color}   font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfgreen-200 `,
              { disabled: isPending },
              { "tag-active": currentTag === t },
              {
                "tag-active-navigating":
                  navSearch?.includes(`tags=${encodeURI(t)}`) && isNavigating,
              },
            )
          }
        >
          {t}
        </NavLink>
      ))}
    </div>
  )

  // const { driveFilesDispatch } = useDriveFilesContext()
  // const { tag, setTag } = useNendoTags()

  // React.useEffect(() => {
  //   setTag("ALL")
  // }, [setTag])

  // return (
  //   <div data-name="TagsButtons.tsx" className={`flex flex-wrap gap-2`}>
  //     <button
  //       onClick={() => {
  //         driveFilesDispatch({
  //           type: "SET_AND_UPDATE_META_SELECTED",
  //           payload: { driveFiles: baseDriveFiles, selected: true },
  //         })
  //         setTag("ALL")
  //       }}
  //       className={` ${
  //         tag === "ALL" ? "tag-active" : ""
  //       } btn btn-xs border-none shadow-md ${color}   font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfgreen-300`}
  //     >
  //       ALL
  //     </button>
  //     {Array.from(tags).map((t) => (
  //       <button
  //         key={t}
  //         onClick={() => {
  //           driveFilesDispatch({
  //             type: "FILTER_BY_TAG",
  //             payload: { tag: t, driveFiles: baseDriveFiles },
  //           })
  //           setTag(t)
  //         }}
  //         className={`${
  //           t === tag ? "tag-active" : ""
  //         } btn btn-xs border-none shadow-md ${color}   font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfgreen-200 `}
  //       >
  //         {t}
  //       </button>
  //     ))}
  //   </div>
}
