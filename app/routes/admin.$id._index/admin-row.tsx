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
        <p className="w-20 flex-grow-0">{label}</p>
        <p className="flex-grow">{children}</p>
      </div>
      <hr />
    </>
  )
}
