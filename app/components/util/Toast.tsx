"use client"

import { useState } from "react"

export default function Toast({ text }: { text: string }) {
  const [visible, setVisible] = useState<boolean>(true)
  const [startAnimate, setStartAnimate] = useState(false)

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
          className={`toast-end toast ${
            startAnimate && "translate-x-96 transition-transform duration-700"
          } `}
        >
          <div
            className='alert alert-error hover:bg-opacity-80'
            onClick={handleClick}
          >
            <div>
              <span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </span>
              <span>{text}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
