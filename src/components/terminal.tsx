import { Terminal } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import '@/styles/xterm.css';
import { Dimensions } from '@/lib/types';

export function TerminalX({
  dimensions,
  terminal,
  fitTerm,
}: {
  terminal: Terminal;
  dimensions: Dimensions | undefined;
  fitTerm: () => void;
}) {
  const termRef = useRef<HTMLDivElement | null>(null);
  const socket = useRef<WebSocket>();

  useEffect(() => {
    if (!termRef.current || socket.current) return;

    // This will be later the actual container url
    const ws = new WebSocket('ws://localhost:3001');
    socket.current = ws;

    ws.onmessage = (e) => {
      const json = JSON.parse(e.data);

      if (json.serverEvent && json.serverEvent === 'TERMINAL_DATA') {
        terminal.write(json.data);
        console.log(typeof json.data);
      }
    };

    terminal.onData((cmd) => {
      ws.send(
        JSON.stringify({
          nonce: '__ignored__',
          event: 'TERMINAL_USER_CMD',
          cmd,
        })
      );
    });

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: 'TERMINAL_SESSION_START',
          nonce: '__terminal__start',
        })
      );

      console.log('opening terminal');
      fitTerm();

      if (termRef.current) {
        terminal.open(termRef.current);
        setTimeout(() => {
          fitTerm();
          fitTerm();
        }, 500);
      }
    };

    ws.onclose = () => {
      console.log('terminal session closed from backend');
    };
  }, [termRef, socket, terminal, fitTerm]);

  useEffect(() => {
    const onResizeWindow = () => {
      console.log('window resize, forcing fit');
      fitTerm();
    };

    window.addEventListener('resize', onResizeWindow);
    return () => {
      window.removeEventListener('resize', onResizeWindow);
    };
  }, [fitTerm]);

  useEffect(() => {
    if (
      !dimensions ||
      !socket.current ||
      socket.current.readyState !== 1 ||
      !terminal
    )
      return;

    console.log('**sending resize request**');
    socket.current.send(
      JSON.stringify({
        event: 'RESIZE_TERMINAL',
        nonce: '__ignore__',
        data: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
      })
    );
  }, [dimensions, socket, terminal]);

  return (
    <div style={{ height: '100%' }} className='text-left' ref={termRef}></div>
  );
}
