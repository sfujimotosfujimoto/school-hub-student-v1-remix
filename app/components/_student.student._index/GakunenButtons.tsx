import { useState } from "react"

export default function GakunenButtons() {
  const [gakunen, setGakunen] = useState<string>("J1")
  return (
    <ul
      className={`menu rounded-box menu-compact menu-horizontal mt-6 bg-warning font-bold sm:menu-normal`}
    >
      <li>
        <button
          className={gakunen === "J1" ? "active" : undefined}
          onClick={() => {
            setGakunen("J1")
          }}
        >
          J1
        </button>
      </li>
      <li>
        <button
          className={gakunen === "J2" ? "active" : undefined}
          onClick={() => {
            setGakunen("J2")
          }}
        >
          J2
        </button>
      </li>
      <li>
        <button
          className={gakunen === "J3" ? "active" : undefined}
          onClick={() => {
            setGakunen("J3")
          }}
        >
          J3
        </button>
      </li>
      <li>
        <button
          className={gakunen === "H1" ? "active" : undefined}
          onClick={() => {
            setGakunen("H1")
          }}
        >
          H1
        </button>
      </li>
      <li>
        <button
          className={gakunen === "H2" ? "active" : undefined}
          onClick={() => {
            setGakunen("H2")
          }}
        >
          H2
        </button>
      </li>
      <li>
        <button
          className={gakunen === "H3" ? "active" : undefined}
          onClick={() => {
            setGakunen("H3")
          }}
        >
          H3
        </button>
      </li>
    </ul>
  )
}
