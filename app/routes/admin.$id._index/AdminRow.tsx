import React from "react"

export default function AdminRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex justify-between">
        <p className="flex-grow-0 w-20">{label}</p>
        <p className="flex-grow">{children}</p>
      </div>
      <hr />
    </>
  )
}
