import { useState, useEffect } from 'react';

// https://neemzy.org/articles/forcing-an-iframe-to-rerender-with-react
export default function useChecksum(value: any) {
  const [checksum, setChecksum] = useState(0);

  useEffect(() => {
    setChecksum((checksum) => checksum + 1);
  }, [value]);

  return checksum;
}
