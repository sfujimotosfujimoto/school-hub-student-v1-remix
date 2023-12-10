import { formatDate } from "~/lib/utils"
import type { User } from "~/types"
import AdminRow from "./AdminRow"

export default function AdminCard({ user }: { user: User }) {
  return (
    <div
      data-name="AdminCards"
      className={`card ${
        user.activated ? "bg-sfgreen-200" : "bg-slate-400"
      } shadow-lg  lg:card-side `}
    >
      <div className="p-4 card-body sm:p-8">
        <div className="flex justify-between card-title">
          <img src={user.picture} alt="icon" className="w-5 h-5 rounded-full" />
          <h1 className="flex-grow">
            {user.last}
            {user.first}
          </h1>
          <span className="w-12 text-base">ID: {user.id}</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <AdminRow label="Email: ">{user.email}</AdminRow>

          <AdminRow label="Role: ">
            <span
              className={`rounded-md p-1 font-semibold ${
                user.role === "ADMIN"
                  ? "bg-sfyellow-300 text-sfblue-300"
                  : "bg-sfred-300 text-sfblue-300"
              }`}
            >
              {user.role}
            </span>
          </AdminRow>

          <AdminRow label="Activated: ">
            {String(user.activated).toUpperCase()}
          </AdminRow>

          <AdminRow label="Created: ">{formatDate(user.createdAt)}</AdminRow>

          <AdminRow label="Updated: ">{formatDate(user.updatedAt)}</AdminRow>

          {user.credential && (
            <AdminRow label="Expiry: ">
              {formatDate(new Date(Number(user.credential.expiry)))}
            </AdminRow>
          )}
          {user.stats && (
            <>
              <AdminRow label="Count: ">{Number(user.stats.count)}</AdminRow>
              <AdminRow label="Last Visited: ">
                {formatDate(new Date(user.stats.lastVisited))}
              </AdminRow>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
