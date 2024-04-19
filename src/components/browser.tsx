import { useIframe } from '@/hooks/use-iframe';
import { useEffect, useRef } from 'react';

export function Browser() {
  const [key, refreshIframe] = useIframe();
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const url = ref.current.contentWindow?.location.toString();

    console.log(url);
  }, [ref]);

  return (
    <>
      <button
        className='px-6 py-2 bg-neutral-100 text-black'
        onClick={refreshIframe}
      >
        Refresh
      </button>
      <iframe
        key={key}
        className='h-full w-full p-3'
        src='http://sample.localhost'
        ref={ref}
        onLoad={(_) => {
          console.log('loaded iframe');
        }}
      ></iframe>
    </>
  );
}
