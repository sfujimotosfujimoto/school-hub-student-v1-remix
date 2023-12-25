import React from "react"

export default function TableRow({
  children,
  href,
  isHeader = false,
}: {
  href: string
  isHeader?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      {isHeader ? (
        <th>
          <a href={href}>{children}</a>
        </th>
      ) : (
        <td>
          <a href={href}>{children}</a>
        </td>
      )}
    </>
  )
}
