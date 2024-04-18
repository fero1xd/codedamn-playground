import { useQuery } from '@tanstack/react-query';
import { useConnection } from './use-connection';
import { queries, QueryKeys } from '@/queries';

export function useWSQuery<K extends QueryKeys>(key: K) {
  const connection = useConnection();

  type QueryReturnType = Awaited<ReturnType<(typeof queries)[K]>>;

  return useQuery<QueryReturnType>({
    queryKey: [key],
    queryFn: async () => {
      if (!connection) throw new Error('something went very wrong');

      console.log('connection is not null, sending req');

      // Some weird type issue
      /* eslint-disable-next-line */
      return (await queries[key](connection)) as any;
    },
    enabled: !!connection,
    refetchOnWindowFocus: false,
  });
}
