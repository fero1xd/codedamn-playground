import { useMemo, useState } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Dimensions } from "../lib/types";
import { Terminal } from "@xterm/xterm";
import { useDebouncedCallback } from "use-debounce";

export function useTerminal() {
  const fitAddon = useMemo(() => new FitAddon(), []);

  const terminal = useMemo(() => {
    const t = new Terminal({
      theme: {
        background: "#04090f",
      },
      cursorBlink: true,
      scrollOnUserInput: true,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 14,
      cursorStyle: "bar",
    });

    console.log("loading up fit addon");
    t.loadAddon(fitAddon);

    return t;
  }, [fitAddon]);

  // Maybe later debounce this
  const [dimensions, _setDimensions] = useState<Dimensions>();

  const setDimensionsDebounce = useDebouncedCallback((value: Dimensions) => {
    _setDimensions(value);
  }, 1000);

  const fitTerm = () => {
    fitAddon.fit();

    const { rows, cols } = terminal;
    setDimensionsDebounce({ rows, cols });
  };

  return { terminal, dimensions, fitTerm, fitAddon };
}
