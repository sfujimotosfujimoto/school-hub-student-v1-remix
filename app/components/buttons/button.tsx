import { Link, NavLink } from "@remix-run/react"
import { clsx } from "clsx"
import type { ButtonHTMLAttributes } from "react"
import React from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "info" | "secondary" | "success" | "error" | "warning"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "wide"
}

function setVariant(variant: string) {
  let btnVariant = ""
  switch (variant) {
    case "info":
      btnVariant = "btn-info"
      break
    case "secondary":
      btnVariant = "btn-secondary"
      break
    case "success":
      btnVariant = "btn-success"
      break
    case "error":
      btnVariant = "btn-error"
      break
    case "warning":
      btnVariant = "btn-warning"
      break
    default:
      btnVariant = "btn-primary"
  }
  return btnVariant
}

function setSize(size: string) {
  let btnSize = ""
  switch (size) {
    case "xs":
      btnSize = "btn-xs"
      break
    case "sm":
      btnSize = "btn-sm"
      break
    case "md":
      btnSize = "btn-md"
      break
    case "lg":
      btnSize = "btn-lg"
      break
    case "xl":
      btnSize = "btn-xl"
      break
    case "wide":
      btnSize = "btn-wide"
      break
    default:
      btnSize = "btn-md"
  }
  return btnSize
}

const Button = React.forwardRef(function Button(
  {
    className,
    disabled,
    variant = "success",
    size = "md",
    children,
    ...props
  }: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const btnVariant = setVariant(variant)

  let btnSize = setSize(size)

  return (
    <button
      ref={ref}
      className={clsx(
        `btn btn-${variant} ${btnVariant} ${btnSize} shadow-lg hover:scale-[102%]`,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})

type NavLinkProps = {
  variant?: "primary" | "info" | "secondary" | "success" | "error" | "warning"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "wide"
  to: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

const NavLinkButton = function NavLinkButton({
  to,
  className,
  disabled,
  variant = "success",
  size = "md",
  children,
}: NavLinkProps) {
  const btnVariant = setVariant(variant)

  let btnSize = setSize(size)

  return (
    <NavLink
      to={to}
      className={clsx(
        `btn btn-${variant} ${btnVariant} ${btnSize} shadow-lg hover:scale-[102%]`,
        className,
        { disabled: disabled },
      )}
    >
      {children}
    </NavLink>
  )
}

type NavLinkPillProps = {
  to: string
  hoverColor?: string
  baseColor?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "wide"
  name: string
  searchParam: "nendo" | "tags" | "segments" | "extensions" | "none"
  url: URL
  className?: string
  disabled?: boolean
  navSearch?: string
  isNavigating?: boolean
}

const NavLinkPill = function NavLinkPill({
  to,
  name,
  searchParam,
  url,
  className,
  disabled,
  baseColor = "bg-slate-400",
  hoverColor = "bg-sfgreen-300",
  size = "xs",
  navSearch,
  isNavigating,
}: NavLinkPillProps) {
  // const bgHoverColor = `hover:bg-sfyellow-300`
  const bgHoverColor = `hover:${hoverColor}`
  const currentTag = url.searchParams.get(searchParam)

  let btnSize = setSize(size)

  return (
    <NavLink
      to={to}
      className={({ isPending }) =>
        clsx(
          searchParam,
          { [baseColor]: true },
          { [bgHoverColor]: true },
          `btn ${btnSize} border-none 
          font-bold shadow-md duration-300 hover:scale-105`,
          className,
          { disabled: isPending || isNavigating || disabled },
          { [`${searchParam}-active`]: currentTag === name },
          {
            [`${searchParam}-navigating`]:
              navSearch?.includes(`${searchParam}=${encodeURI(name)}`) &&
              isNavigating,
          },
        )
      }
    >
      {name}
    </NavLink>
  )
}

type LinkProps = {
  variant?: "primary" | "info" | "secondary" | "success" | "error" | "warning"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "wide"
  to: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

const LinkButton = function LinkButton({
  to,
  className,
  disabled,
  variant = "success",
  size = "md",
  children,
}: LinkProps) {
  const btnVariant = setVariant(variant)

  let btnSize = setSize(size)

  return (
    <Link
      to={to}
      className={clsx(
        `btn btn-${variant} ${btnVariant} ${btnSize} shadow-lg hover:scale-[102%]`,
        className,
        { disabled: disabled },
      )}
    >
      {children}
    </Link>
  )
}

export { Button, NavLinkButton, NavLinkPill, LinkButton }

/*

export default function BackButton({
  isLink = false,
  to,
}: {
  isLink?: boolean
  to?: string
}) {
  const navigate = useNavigate()
  const btnCss = `btn-success btn btn-sm shadow-md hover:bg-sfgreen-400 hover:-translate-y-[1px] duration-300 text-sfblue-300}`
  if (!isLink && to) {
    return (
      <Link to={to} className={btnCss}>
        <LeftArrow className="mr-2 h-5 w-5" />
        Back
      </Link>
    )
  } else {
    return (
      <button onClick={() => navigate(-1)} className={btnCss}>
        <LeftArrow className="mr-2 h-5 w-5" />
        Back
      </button>
    )
  }
}

*/
