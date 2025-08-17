import { useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl, getAuthToken } from "@/config/api";

const OperationsSuite = () => {
  const [height, setHeight] = useState<number>(window.innerHeight - 64);
  const [path, setPath] = useState<string>('/suite/');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const app = params.get('app');
    if (app === 'fleet') setPath('/suite/fleet/');
    else if (app === 'atlas') setPath('/suite/atlas/');
    else if (app === 'mapper') setPath('/suite/mapper/');
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

  const iframeSrc = import.meta.env.DEV
    ? (path.endsWith('/') ? `${path}index.html` : `${path}/index.html`)
    : path;

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded bg-secondary" onClick={() => setPath('/suite/')}>Operations Home</button>
        <button className="px-3 py-1 rounded bg-secondary" onClick={() => setPath('/suite/fleet/')}>Fleet Focus Manager</button>
        <button className="px-3 py-1 rounded bg-secondary" onClick={() => setPath('/suite/atlas/')}>Atlas Hub</button>
        <button className="px-3 py-1 rounded bg-secondary" onClick={() => setPath('/suite/mapper/')}>Patrick County Mapper</button>
      </div>
      <iframe
        key={iframeSrc}
        ref={iframeRef}
        title="Operations Suite App"
        src={iframeSrc}
        style={{ width: '100%', height }}
        className="rounded-md border border-border bg-background"
      />
    </div>
  );
};

export default OperationsSuite;