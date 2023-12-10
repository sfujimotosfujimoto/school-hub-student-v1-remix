import type { MetaFunction } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

export default function AdminLayoutPage() {
  return <Outlet />
}

export const meta: MetaFunction = () => {
  return [{ title: `ADMIN | SCHOOL HUB` }]
}
