import type { Gakunen } from "~/types"

export default function GakunenButtons({
  gakunen,
  setGakunen,
}: {
  gakunen: Gakunen
  setGakunen: React.Dispatch<React.SetStateAction<Gakunen>>
}) {
  return (
    <ul
      className={`menu rounded-box menu-compact menu-horizontal  bg-warning font-bold sm:menu-normal`}
    >
      <li>
        <button
          className={gakunen === "J1" ? "active" : undefined}
          onClick={() => {
            setGakunen((prev) => (prev === "J1" ? "ALL" : "J1"))
          }}
        >
          J1
        </button>
      </li>
      <li>
        <button
          className={gakunen === "J2" ? "active" : undefined}
          onClick={() => {
            setGakunen((prev) => (prev === "J2" ? "ALL" : "J2"))
          }}
        >
          J2
        </button>
      </li>
      <li>
        <button
          className={gakunen === "J3" ? "active" : undefined}
          onClick={() => {
            setGakunen((prev) => (prev === "J3" ? "ALL" : "J3"))
          }}
        >
          J3
        </button>
      </li>
      <li>
        <button
          className={gakunen === "H1" ? "active" : undefined}
          onClick={() => {
            setGakunen((prev) => (prev === "H1" ? "ALL" : "H1"))
          }}
        >
          H1
        </button>
      </li>
      <li>
        <button
          className={gakunen === "H2" ? "active" : undefined}
          onClick={() => {
            setGakunen((prev) => (prev === "H2" ? "ALL" : "H2"))
          }}
        >
          H2
        </button>
      </li>
      <li>
        <button
          className={gakunen === "H3" ? "active" : undefined}
          onClick={() => {
            setGakunen((prev) => (prev === "H3" ? "ALL" : "H3"))
          }}
        >
          H3
        </button>
      </li>
    </ul>
  )
}
