import React from "react"

// type AlertType =
//   | "alert-warning"
//   | "alert-primary"
//   | "alert-error"
//   | "alert-secondary"

export default function Toast({ text }: { text: string }) {
  const [visible, setVisible] = React.useState<boolean>(true)
  const [startAnimate, setStartAnimate] = React.useState(false)

  const timeOut = 3000

  React.useEffect(() => {
    setTimeout(() => {
      setStartAnimate((prev) => true)
    }, timeOut)

    setTimeout(() => {
      setVisible((prev) => false)
    }, timeOut + 700)
  }, [])

  function handleClick() {
    setStartAnimate(true)
    setTimeout(() => {
      setVisible((prev) => !prev)
    }, 700)
  }

  return (
    <>
      {visible && (
        <div
          className={` ${
            startAnimate && "translate-x-96 transition-transform duration-700"
          } `}
        >
          <div
            className="alert alert-error hover:bg-opacity-80"
            onClick={handleClick}
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
            <span>{text}</span>
          </div>
        </div>
      )}
    </>
  )
}
