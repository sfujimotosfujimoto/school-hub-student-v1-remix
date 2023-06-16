import type { V2_MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import React from "react"

export default function AdminLayoutPage() {
  return <Outlet />
}

export const meta: V2_MetaFunction = () => {
  return [{ title: `ADMIN | SCHOOL HUB` }]
}
