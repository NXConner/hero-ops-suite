import { useEffect, useMemo, useRef, useState } from "react";

const OperationsSuite = () => {
  const [height, setHeight] = useState<number>(window.innerHeight - 64);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const initialContext = useMemo(() => ({
    type: 'suite_context',
    payload: {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
      // If you add auth later, pass a token here
      authToken: null,
      appName: 'Operations Suite',
      timestamp: Date.now(),
    }
  }), []);

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight - 64);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onLoad = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(initialContext, window.location.origin);
      } catch {
        // ignore cross-origin errors in case of dev
      }
    };
    const iframe = iframeRef.current;
    if (iframe) iframe.addEventListener('load', onLoad);
    return () => iframe?.removeEventListener('load', onLoad);
  }, [initialContext]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return; // basic guard
      if (typeof event.data !== 'object' || !event.data) return;
      if (event.data.type === 'suite_event') {
        // Handle events emitted by the sub-app if needed
        // e.g., navigation requests, notifications, analytics hooks
        // console.log('Suite event:', event.data.payload);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Embedded suite is served from /suite/ inside this deployment.
      </div>
      <iframe
        ref={iframeRef}
        title="Operations Suite"
        src="/suite/"
        style={{ width: '100%', height }}
        className="rounded-md border border-border bg-background"
      />
    </div>
  );
};

export default OperationsSuite;