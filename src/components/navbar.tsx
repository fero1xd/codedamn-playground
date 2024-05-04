import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <div className="h-[7vh] z-[100] w-full flex items-center justify-center gap-8 bg-black __nav__">
      <Link
        to="/"
        className="flex items-center gap-2 hover:underline underline-offset-1"
      >
        Home
      </Link>

      <a
        href="https://github.com/fero1xd/codedamn-playground"
        className="flex items-center gap-2 hover:underline underline-offset-1"
        target="_blank"
      >
        ⭐︎ Github
      </a>
    </div>
  );
}
