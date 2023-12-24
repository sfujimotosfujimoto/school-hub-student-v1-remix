import { NavLink, useNavigation } from "@remix-run/react"

import clsx from "clsx"

export default function NendoButtons({
  url,
  studentFolderId,
  nendos,
  nendo,
  color,
}: {
  url: string
  studentFolderId: string
  nendos: string[]
  nendo: string
  color: string
}) {
  const _url = new URL(url)
  const currentNendo = _url.searchParams.get("nendo")

  const navigate = useNavigation()

  const isNavigating = navigate.state !== "idle"
  const navSearch = navigate.location?.search
  return (
    <div data-name="NendoButtons.tsx" className={`flex gap-2`}>
      <NavLink
        to={`/student2/${studentFolderId}?nendo=ALL`}
        className={({ isActive, isPending }) =>
          clsx(
            `btn btn-xs border-none shadow-md ${color} font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfred-200`,
            { disabled: isPending },
            { "nendo-active": currentNendo === "ALL" },
            {
              "nendo-active-navigating":
                navSearch?.includes(`nendo=${encodeURI(nendo)}`) &&
                isNavigating,
            },
          )
        }
      >
        ALL
      </NavLink>
      {nendos.map((_nendo) => (
        <NavLink
          to={`/student2/${studentFolderId}?nendo=${_nendo}`}
          key={_nendo}
          className={({ isActive, isPending }) =>
            clsx(
              `btn btn-xs border-none shadow-md ${color} font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfred-200`,
              { disabled: isPending },
              { "nendo-active": currentNendo === _nendo },
              {
                "nendo-active-navigating":
                  navSearch?.includes(`nendo=${encodeURI(_nendo)}`) &&
                  isNavigating,
              },
            )
          }
        >
          {_nendo}
        </NavLink>
      ))}
    </div>
  )
}
