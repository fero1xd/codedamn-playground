import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import '@/styles/xterm.css';

export function TerminalX({ fit: fitAddon }: { fit: FitAddon }) {
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

    const attachAddon = new AttachAddon(ws);

    terminal.loadAddon(fitAddon);

    ws.onopen = () => {
      console.log('terminal session opened');
      terminal.loadAddon(attachAddon);

      termRef.current && terminal.open(termRef.current);
      fitAddon.fit();
    };

    ws.onclose = () => {
      console.log('terminal session closed from backend');
    };
  }, [termRef, socket, fitAddon]);

  return (
    <div style={{ height: '100%' }} className='text-left' ref={termRef}></div>
  );
}
