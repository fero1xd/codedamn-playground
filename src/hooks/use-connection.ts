import { WSContext } from "@/providers/ws";
import { useContext, useEffect, useRef } from "react";

type UseConnectionProps = {
  onOpen?: () => void;
};

export const useConnection = (params?: UseConnectionProps) => {
  const conn = useContext(WSContext);
  const triggered = useRef(false);

  useEffect(() => {
    if (conn?.isReady && !triggered.current) {
      triggered.current = true;
      params?.onOpen?.();
    }
  }, [conn]);

  return {
    conn,
  };
};
