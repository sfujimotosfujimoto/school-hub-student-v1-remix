export default function Footer() {
  return (
    <footer className="">
      <div className="flex items-center justify-center h-8">
        <p className="">
          &copy; {new Date().getFullYear()} by{" "}
          <a
            href="mailto:sfujimotosfujimoto@gmail.com"
            className="underline transition-colors duration-300 hover:text-sky-600"
          >
            sfujimoto
          </a>
          . All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}
