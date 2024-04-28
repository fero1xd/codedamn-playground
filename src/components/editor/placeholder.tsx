import { Code2 } from "lucide-react";

export function Placeholder() {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-2">
      <Code2 size={100} color="gray" />
      <p className="text-neutral-400">Get started by opening a file</p>
    </div>
  );
}
