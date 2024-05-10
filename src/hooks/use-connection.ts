import { WSContext } from "@/providers/ws";
import { useContext, useEffect, useRef } from "react";

type UseConnectionProps = {
  onOpen: () => void;
};

export const useConnection = ({ onOpen }: UseConnectionProps) => {
  const conn = useContext(WSContext);
  const triggered = useRef(false);

  useEffect(() => {
    if (conn?.isReady && !triggered.current) {
      triggered.current = true;
      onOpen();
    }
  }, [conn]);

  return {
    conn,
  };
};
