import { Checkmark } from "@/components/ui/checkmark";
import { Spinner } from "@/components/ui/loading";
import { X } from "@/components/ui/X";
import { messageMap, PlaygroundStatus } from "@/hooks/use-pg-loading";
import { cn } from "@/lib/utils";

export function LoadingPanel({ status }: { status: PlaygroundStatus }) {
  return (
    <div className="z-[90] h-full w-full absolute flex flex-col justify-center bg-black">
      <div className="flex flex-col items-start justify-center ml-auto mr-auto gap-3">
        {/* @ts-expect-error stupid ts */}
        {Object.keys(status).map((st: keyof PlaygroundStatus) => {
          const s = status[st];

          return (
            <div className="flex gap-4 items-center justify-center" key={st}>
              {s.loading ? (
                <Spinner className="w-[30px]" />
              ) : s.success ? (
                <Checkmark className="w-[30px] h-[30px] stroke-green-500" />
              ) : (
                <X className="stroke-red-500 w-[30px] h-[30px]" />
              )}
              <p
                className={cn(
                  "text-lg",
                  !s.loading && s.success && "text-green-500",
                  !s.loading && !s.success && "text-red-500"
                )}
              >
                {messageMap[st]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
