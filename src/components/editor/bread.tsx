import { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export function Bread({
  selectedFile,
  rootPath,
}: {
  selectedFile: string;
  rootPath: string;
}) {
  const parts = useMemo(() => {
    return selectedFile
      .replace("file://", "")
      .replace(rootPath + "/", "")
      .split("/");
  }, [selectedFile]);

  return (
    <Breadcrumb className="bg-[#0f111a] pl-10">
      <BreadcrumbList className="text-xs gap-1 sm:gap-0.5 pt-2">
        {parts.length > 1 &&
          parts.map((p, i) => (
            <>
              <BreadcrumbItem key={p + Math.random()}>{p}</BreadcrumbItem>
              {i !== parts.length - 1 && (
                <BreadcrumbSeparator key={p + Math.random()} />
              )}
            </>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
