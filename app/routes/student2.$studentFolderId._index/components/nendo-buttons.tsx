import { NavLink, useNavigation } from "@remix-run/react"
import React from "react"
// import { useDriveFilesContext } from "~/context/drive-files-context"
// import { useNendoTags } from "~/context/nendos-tags-context"
import clsx from "clsx"

export default function NendoButtons({
  url,
  studentFolderId,
  nendos,
  nendo,
  color, // currentNendo,
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

  // let newestNendo
  // if (!showAll) {
  //   // get the newest nendo from the nendos set
  //   newestNendo =
  //     Array.from(nendos)
  //       .sort((a, b) => Number(b) - Number(a))
  //       .filter((n): n is string => n !== null)
  //       .at(0) ?? "ALL"
  // } else {
  //   newestNendo = "ALL"
  // }

  // // set the current nendo to the newest nendo
  // const [currentNendo] = React.useState(newestNendo ?? "ALL")

  // const { nendo, setNendo } = useNendoTags()
  // const { driveFilesDispatch } = useDriveFilesContext()
  // const [nendosArr, setNendosArr] = React.useState<string[]>([])

  // // set nendosArr to the nendos set
  // React.useEffect(() => {
  //   const tmpArr = Array.from(nendos)
  //     .sort((a, b) => Number(b) - Number(a))
  //     .filter((n): n is string => n !== null)

  //   setNendosArr(tmpArr)
  //   setNendo(currentNendo)
  // }, [nendos, currentNendo, setNendo])

  // // filter by nendo
  // React.useEffect(() => {
  //   if (!showAll) {
  //     // then filter by nendo
  //     driveFilesDispatch({
  //       type: "FILTER_BY_NENDO",
  //       payload: { nendo: currentNendo, driveFiles: baseDriveFiles },
  //     })
  //   }
  // }, [baseDriveFiles, currentNendo, driveFilesDispatch, showAll])

  return (
    <div data-name="NendoButtons.tsx" className={`flex gap-2`}>
      <NavLink
        to={`/student2/${studentFolderId}?nendo=ALL`}
        className={({ isActive, isPending }) =>
          clsx(
            `btn btn-xs border-none shadow-md ${color}   font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfred-200`,
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
              `btn btn-xs border-none shadow-md ${color}   font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfred-200`,
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

// className={({ isActive, isPending }) =>
// isPending ? "pending" : isActive ? "active" : ""
// }

// type ListLinkItemProps = HTMLAttributes<HTMLLIElement> & {
//   children: React.ReactNode;
//   to: string;
//   isActive?: boolean;
//   deleteProps?: DeleteProps;
// };

// export function ListLinkItem({ isActive, className = '', to, deleteProps, children, ...props }: ListLinkItemProps) {
//   const fetcher = useFetcher<{ success: boolean }>();

//   const isSubmitting = fetcher.state !== 'idle';
//   const hasFailed = fetcher.data?.success === false;
//   if (isSubmitting) {
//     return null;
//   }

//   return (
//     <li
//       className={clsx(
//         'w-full flex flex-row items-center border',
//         isActive
//           ? 'bg-secondary dark:bg-darkSecondary border-secondary dark:border-darkSecondary'
//           : 'hover:bg-backgroundPrimary dark:hover:bg-darkBackgroundPrimary border-background dark:border-darkBackground hover:border-secondary dark:hover:border-darkSecondary',
//         {
//           'text-red-600 dark:text-red-400 hover:text-red-700dark:hover:text-red-500 focus:text-red-700 dark:focus:text-red-500':
//             hasFailed,
//         },
//         className,
//       )}
//       {...props}
//     >
//       <NavLink to={to} className="block w-full p-4">
//         {children}
//       </NavLink>
//       )}
//     </li>
//   );
// }
