export function Pill({
  name,
  text,
  color,
}: {
  color: string
  name: string
  text: string
}) {
  if (!text) return null
  return (
    <>
      <span
        className={`select-none rounded-lg px-2 py-1 text-xs ${color} border-none font-bold shadow-md`}
      >
        {name}
      </span>
      <h3 className="ml-1 mr-2 select-none">{text}</h3>
    </>
  )
}
