import { useEffect, useRef } from 'react';

interface PreviewFrameProps {
  url: string | null;
  installLog: string[];
  installing: boolean;
  chatCompleted: boolean;
}

export function PreviewFrame({ url, installLog, installing, chatCompleted }: PreviewFrameProps) {
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [installLog]);

  if (url) {
    return <iframe className="w-full h-full bg-white border-0" src={url} title="Preview" />;
  }

  const statusText = !chatCompleted
    ? 'Waiting for code generation...'
    : installing
    ? 'Installing dependencies & starting dev server...'
    : 'Preparing preview...';

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-xs">
      <div className="border-b border-border/40 px-4 py-2 flex items-center space-x-2 bg-secondary/30 flex-shrink-0">
        {installing ? (
          <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        )}
        <span className="text-muted-foreground">{statusText}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {installLog.length === 0 ? (
          <div className="text-muted-foreground/70">
            The live preview will appear here once the dev server is ready.
          </div>
        ) : (
          <>
            {installLog.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-all leading-relaxed">
                {line}
              </div>
            ))}
            <div ref={logEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
