import { useIframe } from "@/hooks/use-iframe";
import { useRef } from "react";

export function Browser({ containerUrl }: { containerUrl: string }) {
  const [key, refreshIframe] = useIframe();
  const ref = useRef<HTMLIFrameElement | null>(null);

  return (
    <>
      <div
        className="w-full border rounded-md flex items-center cursor-pointer"
        onClick={() => {
          refreshIframe();
        }}
      >
        <div className="p-3 border-r w-max">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </div>

        <div className="flex-1 p-3 flex items-center justify-start text-neutral-400 cursor-not-allowed">
          <span>http://twitch.tv/s0mcs</span>
        </div>

        <div
          className="border-l w-max p-3 cursor-pointer"
          onClick={() => {
            open(containerUrl, "_blank");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
            />
          </svg>
        </div>
      </div>
      <iframe
        key={key}
        className="h-full w-full p-2"
        src="https://www.twitch.tv/embed/s0mcs/chat?parent=localhost&darkpopout"
        ref={ref}
        onLoad={() => {
          console.log("loaded iframe");
        }}
      ></iframe>
    </>
  );
}
