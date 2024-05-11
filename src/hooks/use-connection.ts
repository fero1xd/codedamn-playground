import { WSContext } from "@/providers/ws";
import { useContext, useEffect } from "react";

type UseConnectionProps = {
  onOpenOrReconnect?: () => void;
};

export const useConnection = (params?: UseConnectionProps) => {
  const conn = useContext(WSContext);

  useEffect(() => {
    if (conn?.isReady) {
      // triggered.current = true;
      params?.onOpenOrReconnect?.();
    }
  }, [conn]);

  return {
    conn,
  };
};
