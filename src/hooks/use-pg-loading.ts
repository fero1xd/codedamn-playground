import { useMemo, useState } from "react";

export type PlaygroundStatus = {
  [x in
    | "terminal"
    | "editor"
    | "fileTree"
    | "sentContainerReq"
    | "containerBooted"]: { loading: boolean; success: boolean };
};

export const messageMap: Record<keyof PlaygroundStatus, string> = {
  terminal: "Waiting for terminal access",
  editor: "Setting up your code editor",
  fileTree: "Fetching project files",
  sentContainerReq: "Sending container request",
  containerBooted: "Waiting for your container to be online",
};

export function usePgLoading() {
  const [status, _setStatus] = useState<PlaygroundStatus>({
    terminal: { loading: true, success: false },
    editor: { loading: true, success: false },
    fileTree: { loading: true, success: false },
    sentContainerReq: { loading: true, success: false },
    containerBooted: { loading: true, success: false },
  });

  const isReady = useMemo(() => {
    const vals = Object.values(status);
    for (const val of vals) {
      if (val.loading === true || val.success === false) return false;
    }

    return true;
  }, [status]);

  type PlaygroundState = PlaygroundStatus["containerBooted"];

  const setStatus = (
    k: keyof PlaygroundStatus,
    cb: (prev: PlaygroundState) => PlaygroundState
  ) => {
    _setStatus((prev) => ({
      ...prev,
      [k]: cb(prev[k]),
    }));
  };

  return { isReady, status, setStatus };
}
