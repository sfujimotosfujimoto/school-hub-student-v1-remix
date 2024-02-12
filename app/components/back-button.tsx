import { LeftArrowIcon } from "~/components/icons"

import { useNavigate } from "@remix-run/react"
import { Button, LinkButton } from "./buttons/button"

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
      <LinkButton to={to} size="sm" className="text-sfblue-400">
        <LeftArrowIcon className="mr-2 h-5 w-5 " />
        Back
      </LinkButton>
    )
  } else {
    return (
      <Button
        variant="primary"
        onClick={() => navigate(-1)}
        size="sm"
        className="text-sfblue-400"
      >
        <LeftArrowIcon className="mr-2 h-5 w-5" />
        Back
      </Button>
    )
  }
}
