import { useMemo, useRef, useState } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Dimensions } from "../lib/types";
import { Terminal } from "@xterm/xterm";
import { useDebouncedCallback } from "use-debounce";

export function useTerminal() {
  const fitAddon = useRef(new FitAddon());

  const [terminal] = useState(() => {
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

    console.log("new fit addon");

    t.loadAddon(fitAddon.current);

    return t;
  });

  // Maybe later debounce this
  const [dimensions, _setDimensions] = useState<Dimensions>();

  const setDimensionsDebounce = useDebouncedCallback((value: Dimensions) => {
    _setDimensions(value);
  }, 500);

  const fitTerm = useDebouncedCallback(() => {
    fitAddon.current.fit();

    const { rows, cols } = terminal;
    _setDimensions({ rows, cols });
  }, 750);

  const forceFit = () => {
    fitAddon.current.fit();
    const { rows, cols } = terminal;
    setDimensionsDebounce({ rows, cols });
  };

  return { terminal, dimensions, fitTerm, fitAddon, forceFit };
}
