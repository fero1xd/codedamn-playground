import { WSContext } from "@/providers/ws";
import { useContext } from "react";

export const useConnection = () => {
  return useContext(WSContext);
};
