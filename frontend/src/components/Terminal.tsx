import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebContainer } from '@webcontainer/api';
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  webContainer: WebContainer | null;
  installCommand?: string[]; // e.g. ['npm', 'install']
  devCommand?: string[]; // e.g. ['npm', 'run', 'dev']
}

export function Terminal({ webContainer, installCommand = ['pnpm', 'install'], devCommand = ['pnpm', 'dev'] }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const processRef = useRef<any>(null);

  useEffect(() => {
    if (!terminalRef.current || !webContainer) return;

    // Initialize xterm.js
    const term = new XTerm({
      convertEol: true,
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        cursor: '#ffffff',
        black: '#000000',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
        brightBlack: '#6272a4',
        brightRed: '#ff6e67',
        brightGreen: '#5af78e',
        brightYellow: '#f4f99d',
        brightBlue: '#caa9fa',
        brightMagenta: '#ff92d0',
        brightCyan: '#9aedfe',
        brightWhite: '#f8f8f2',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    // Helper to pipe process output to terminal
    const pipeOutput = (process: any) => {
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            term.write(data);
          },
        })
      );
    };

    // Run install, then dev, then open shell
    const runSetup = async () => {
      // Show welcome message
      term.writeln('\x1b[1;36m=== CodeDock Terminal ===\x1b[0m\r\n');

      // Install dependencies
      term.writeln('\x1b[1;33m[1/3] Installing dependencies...\x1b[0m');
      term.writeln(`$ ${installCommand.join(' ')}`);
      const installProcess = await webContainer.spawn(installCommand[0], installCommand.slice(1), {
        terminal: {
          cols: term.cols,
          rows: term.rows,
        },
      });
      pipeOutput(installProcess);
      const installExit = await installProcess.exit;
      if (installExit === 0) {
        term.writeln('\x1b[1;32m✓ Dependencies installed successfully\x1b[0m\r\n');
      } else {
        term.writeln(`\x1b[1;31m✗ Installation failed with code ${installExit}\x1b[0m\r\n`);
      }

      // Start development server
      term.writeln('\x1b[1;33m[2/3] Starting development server...\x1b[0m');
      term.writeln(`$ ${devCommand.join(' ')}`);
      const devProcess = await webContainer.spawn(devCommand[0], devCommand.slice(1), {
        terminal: {
          cols: term.cols,
          rows: term.rows,
        },
      });
      pipeOutput(devProcess);

      // Handle server-ready event
      webContainer.on('server-ready', (port: number, url: string) => {
        term.writeln(`\x1b[1;32m✓ Server ready at ${url}\x1b[0m\r\n`);
      });

      // Open shell for user input
      term.writeln('\x1b[1;33m[3/3] Opening shell for user input...\x1b[0m\r\n');
      const shellProcess = await webContainer.spawn('sh', {
        terminal: {
          cols: term.cols,
          rows: term.rows,
        },
      });
      processRef.current = shellProcess;
      pipeOutput(shellProcess);
      const writer = shellProcess.input.getWriter();
      term.onData((data: string) => {
        writer.write(data);
      });
    };

    runSetup();

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
      if (processRef.current) {
        processRef.current.resize({
          cols: term.cols,
          rows: term.rows,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      if (processRef.current) {
        processRef.current.kill();
      }
    };
  }, [webContainer, installCommand, devCommand]);

  return (
    <div 
      ref={terminalRef} 
      className="h-full w-full p-2"
      style={{ backgroundColor: '#1a1a1a' }}
    />
  );
} 