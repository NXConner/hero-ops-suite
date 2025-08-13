import { useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl, getAuthToken } from "@/config/api";

const OperationsSuite = () => {
  const [height, setHeight] = useState<number>(window.innerHeight - 64);
  const [path, setPath] = useState<string>('/suite/');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'fleet') setPath('/suite/fleet/');
  }, []);

  const initialContext = useMemo(() => ({
    type: 'suite_context',
    payload: {
      apiBaseUrl: getApiBaseUrl(),
      authToken: getAuthToken(),
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
      } catch (_e) { /* ignore */ }
    };
    const iframe = iframeRef.current;
    if (iframe) iframe.addEventListener('load', onLoad);
    return () => iframe?.removeEventListener('load', onLoad);
  }, [initialContext, path]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (typeof event.data !== 'object' || !event.data) return;
      if (event.data.type === 'suite_event') {
        void 0;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded bg-secondary" onClick={() => setPath('/suite/')}>Operations Home</button>
        <button className="px-3 py-1 rounded bg-secondary" onClick={() => setPath('/suite/fleet/')}>Fleet Focus Manager</button>
      </div>
      <iframe
        key={path}
        ref={iframeRef}
        title="Fleet & Field Ops"
        src={path}
        style={{ width: '100%', height }}
        className="rounded-md border border-border bg-background"
      />
    </div>
  );
};

export default OperationsSuite;