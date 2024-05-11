import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getSubDomain } from "@/lib/utils";

export function InfoAlert({ pgId }: { pgId: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Starters Guide</AlertDialogTitle>
          <AlertDialogDescription>
            <ul className="space-y-2 list-disc pl-4">
              <li>
                Use Bun, Yarn or Pnpm as your package manager instead of npm
              </li>
              <li>
                There are 2 ports available for your playground, 42069 and 42070
              </li>
              <li>
                You can access both these ports on
                <ol className="space-y-1 mt-2 pl-2">
                  <li>
                    <a
                      href={getSubDomain(pgId)}
                      target="_blank"
                      className="links"
                    >
                      {getSubDomain(pgId)}
                    </a>
                  </li>
                  <li>
                    <a
                      href={getSubDomain(`${pgId}-42070`)}
                      target="_blank"
                      className="links"
                    >
                      {getSubDomain(`${pgId}-42070`)}
                    </a>
                  </li>
                </ol>
              </li>
              <li>Port 42069 is open for both https and websocket traffic</li>
              <li>Port 42079 is only open for https traffic</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
