import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import '@/styles/xterm.css';

export function TerminalX() {
  const termRef = useRef<HTMLDivElement | null>(null);
  const socket = useRef<WebSocket>();

  useEffect(() => {
    if (!termRef.current || socket.current) return;

    console.log('i am here');
    const ws = new WebSocket('ws://localhost:3001');
    socket.current = ws;

    const terminal = new Terminal({
      theme: {
        background: '#04090F',
      },
      cursorBlink: true,
      scrollOnUserInput: true,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      cursorStyle: 'bar',
    });

    const fitAddon = new FitAddon();
    const attachAddon = new AttachAddon(ws);

    terminal.loadAddon(fitAddon);

    ws.onopen = () => {
      terminal.loadAddon(attachAddon);

      termRef.current && terminal.open(termRef.current);
      fitAddon.fit();
    };
  }, [termRef, socket]);

  return (
    <div style={{ height: '100%' }} className='text-left' ref={termRef}></div>
  );
}
