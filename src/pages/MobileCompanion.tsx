import { useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl } from "@/config/api";

const MobileCompanion = () => {
  const [height, setHeight] = useState<number>(window.innerHeight - 64);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const initialContext = useMemo(() => ({
    type: 'mobile_context',
    payload: {
      apiBaseUrl: getApiBaseUrl(),
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
  }, [initialContext]);

  const mobileSrc = import.meta.env.DEV ? "/mobile/index.html" : "/mobile/";

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Embedded mobile companion served from /mobile/ (Expo web).
      </div>
      <iframe
        ref={iframeRef}
        title="Mobile Companion"
        src={mobileSrc}
        style={{ width: '100%', height }}
        className="rounded-md border border-border bg-background"
      />
    </div>
  );
};

export default MobileCompanion;