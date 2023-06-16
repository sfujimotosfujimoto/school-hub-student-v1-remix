import { Link, useNavigate } from "@remix-run/react"
import { LeftArrow } from "~/components/icons"

export default function BackButton({
  isLink = false,
  to,
}: {
  isLink?: boolean
  to?: string
}) {
  const navigate = useNavigate()

  if (!isLink && to) {
    return (
      <Link to={to} className="btn-success btn shadow-md hover:bg-sfgreen-400">
        <LeftArrow className="mr-2 h-5 w-5" />
        Back
      </Link>
    )
  } else {
    return (
      <button
        onClick={() => navigate(-1)}
        className="btn-success btn shadow-md hover:bg-sfgreen-400"
      >
        <LeftArrow className="mr-2 h-5 w-5" />
        Back
      </button>
    )
  }
}
