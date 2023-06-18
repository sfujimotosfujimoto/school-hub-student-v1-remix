import { Link, useNavigate } from "@remix-run/react"
import { LeftArrow } from "~/components/icons"

export default function BackButton({
  isButton = false,
  to,
}: {
  isButton?: boolean
  to?: string
}) {
  const navigate = useNavigate()

  if (!isButton && to) {
    return (
      <Link to={to} className="shadow-md btn-success btn hover:bg-sfgreen-400">
        <LeftArrow className="w-5 h-5 mr-2" />
        Back
      </Link>
    )
  } else {
    return (
      <button
        onClick={() => navigate(-1)}
        className="shadow-md btn-success btn hover:bg-sfgreen-400"
      >
        <LeftArrow className="w-5 h-5 mr-2" />
        Back
      </button>
    )
  }
}
