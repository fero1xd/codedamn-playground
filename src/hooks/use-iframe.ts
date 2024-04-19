import useChecksum from './use-checksum';
import { useState } from 'react';

export function useIframe(): [checkSum: number, changeCheckSum: () => void] {
  const [refresh, setRefresh] = useState(false);

  const checkSum = useChecksum(refresh);

  const changeCheckSum = () => {
    setRefresh((r) => !r);
  };

  return [checkSum, changeCheckSum];
}
