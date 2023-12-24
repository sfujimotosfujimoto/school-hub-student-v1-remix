import { NavLink } from "@remix-run/react"
import { clsx } from "clsx"
import type { ButtonHTMLAttributes } from "react"
import React from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "info" | "secondary" | "success" | "error" | "warning"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "wide"
}

type NavLinkProps = {
  variant?: "primary" | "info" | "secondary" | "success" | "error" | "warning"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "wide"
  to: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
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
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "wide"
  name: string
  searchParam: "nendo" | "tags"
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
  hoverColor = "bg-sfgreen-300",
  size = "xs",
  navSearch,
  isNavigating,
}: NavLinkPillProps) {
  const bgHoverColor = `hover:${hoverColor}`
  const currentTag = url.searchParams.get(searchParam)

  let btnSize = setSize(size)

  // const styles = {
  //   tagActive: currentTag === name && {
  //     backgroundColor: "hsl(182, 41%, 62%)",
  //     textDecoration: "underline solid #222 1px",
  //     textUnderlineOffset: "2px",
  //   },
  //   tagNavigating: navSearch?.includes(`tags=${encodeURI(name)}`) &&
  //     isNavigating && {
  //       backgroundColor: "hsl(182, 61%, 62%)",
  //     },
  // }

  return (
    <NavLink
      to={to}
      className={({ isPending }) =>
        clsx(
          searchParam,
          `btn ${btnSize} border-none bg-slate-400 
          font-bold shadow-md duration-300 hover:scale-105 ${bgHoverColor} `,
          className,
          { disabled: isPending || disabled },
          { "tag-active": currentTag === name },
          {
            "tag-navigating":
              navSearch?.includes(`tags=${encodeURI(name)}`) && isNavigating,
          },
        )
      }
    >
      {name}
    </NavLink>
  )
}

export { Button, NavLinkButton, NavLinkPill }

/*


.tag-active {
  background-color: hsl(182, 41%, 62%);
  text-decoration: underline solid #222 1px;
  text-underline-offset: 2px;
}
.tag-active-navigating {
  background-color: hsl(182, 61%, 62%);
}

  <NavLink
        to={`${_url.pathname}?tags=ALL`}
        className={({ isActive, isPending }) =>
          clsx(
            `btn btn-xs border-none shadow-md ${color}   font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfgreen-300`,
            { disabled: isPending },
            { "tag-active": currentTag === "ALL" },
            {
              "tag-active-navigating":
                navSearch?.includes(`tags=ALL`) && isNavigating,
            },
          )
        }
      >
        ALL
      </NavLink>
      {tags.map((t) => (
        <NavLink
          to={`${setSearchParams(_url.href, t)}`}
          key={t}
          className={({ isActive, isPending }) =>
            clsx(
              `btn btn-xs border-none shadow-md ${color} font-bold duration-300 hover:-translate-y-[1px] hover:bg-sfgreen-200 `,
              { disabled: isPending },
              { "tag-active": currentTag === t },
              {
                "tag-active-navigating":
                  navSearch?.includes(`tags=${encodeURI(t)}`) && isNavigating,
              },
            )
          }
        >
          {t}
        </NavLink>
      ))}




              <NavLink
                to={`/student2/${studentLink}`}
                className={`btn btn-success btn-xs  border-0 shadow-md hover:bg-opacity-70 `}
              >
                <UserIcon className="h-5 w-5 sm:hidden" />

                <span className="hidden sm:block">生徒</span>
              </NavLink> */
