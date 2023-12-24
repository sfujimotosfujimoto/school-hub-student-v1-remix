import React from "react"
import TableRow from "./TableRow"
import { formatDate } from "~/lib/utils"
import type { User } from "~/types"

export default function Tables({ users }: { users: User[] }) {
  console.log("✅ admin._index/Tables.tsx ~ 	😀 users", users)
  return (
    <table className="table table-pin-rows table-xs rounded-lg border bg-slate-50 text-sm text-sfblue-400">
      <thead className="text-sfblue-300">
        <tr>
          <th />
          <th>姓</th>
          <th>名</th>
          <th>アクセス回数</th>
          <th>更新日</th>
        </tr>
      </thead>
      <tbody className="text-sfblue-400">
        {users.map((u) => (
          <tr key={u.id} className={`hover`}>
            <TableRow href={`/admin/${u.id}`} isHeader={true}>
              <div className="tooltip tooltip-right" data-tip={`${u.email}`}>
                {u.id}
              </div>
            </TableRow>
            <TableRow href={`/admin/${u.id}`}>{u.last}</TableRow>
            <TableRow href={`/admin/${u.id}`}>{u.first}</TableRow>
            <TableRow href={`/admin/${u.id}`}>{u.stats?.count || 0}</TableRow>

            {u.stats ? (
              <TableRow href={`/admin/${u.id}`}>
                {formatDate(new Date(u.stats?.lastVisited))}
              </TableRow>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
