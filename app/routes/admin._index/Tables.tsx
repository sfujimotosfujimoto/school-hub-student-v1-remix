import React from "react"
import TableRow from "./TableRow"
import { formatDate } from "~/lib/utils"
import type { User } from "~/types"

export default function Tables({ users }: { users: User[] }) {
  return (
    <table className="table text-sm border rounded-lg table-xs table-pin-rows table-zebra">
      <thead>
        <tr>
          <th />
          <th>姓</th>
          <th>名</th>
          <th>アクセス回数</th>
          <th>更新日</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr
            key={u.id}
            className={`hover ${!u.activated ? "opacity-30" : null}`}
          >
            <TableRow href={`/admin/${u.id}`} isHeader={true}>
              <div className="tooltip tooltip-right" data-tip={`${u.email}`}>
                {u.id}
              </div>
            </TableRow>
            <TableRow href={`/admin/${u.id}`}>{u.last}</TableRow>
            <TableRow href={`/admin/${u.id}`}>{u.first}</TableRow>
            <TableRow href={`/admin/${u.id}`}>{u.stats?.count || 1}</TableRow>
            <TableRow href={`/admin/${u.id}`}>
              {formatDate(new Date(u.stats?.lastVisited || u.updatedAt))}
            </TableRow>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
