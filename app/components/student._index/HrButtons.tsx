import type { Hr } from "~/types"

export default function HrButtons({
  hr,
  setHr,
}: {
  hr: Hr
  setHr: React.Dispatch<React.SetStateAction<Hr>>
}) {
  return (
    <ul
      className={`menu rounded-box menu-compact menu-horizontal bg-warning font-bold sm:menu-normal`}
    >
      <li>
        <button
          className={hr === "A" ? "active" : undefined}
          onClick={() => {
            setHr((prev) => (prev === "A" ? "ALL" : "A"))
          }}
        >
          A
        </button>
      </li>
      <li>
        <button
          className={hr === "B" ? "active" : undefined}
          onClick={() => {
            setHr((prev) => (prev === "B" ? "ALL" : "B"))
          }}
        >
          B
        </button>
      </li>
      <li>
        <button
          className={hr === "C" ? "active" : undefined}
          onClick={() => {
            setHr((prev) => (prev === "C" ? "ALL" : "C"))
          }}
        >
          C
        </button>
      </li>
      <li>
        <button
          className={hr === "D" ? "active" : undefined}
          onClick={() => {
            setHr((prev) => (prev === "D" ? "ALL" : "D"))
          }}
        >
          D
        </button>
      </li>
      <li>
        <button
          className={hr === "E" ? "active" : undefined}
          onClick={() => {
            setHr((prev) => (prev === "E" ? "ALL" : "E"))
          }}
        >
          E
        </button>
      </li>
    </ul>
  )
}
