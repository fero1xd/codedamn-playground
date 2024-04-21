import { useQuery } from '@tanstack/react-query';
import { useConnection } from './use-connection';
import { queries, QueryKeys } from '@/queries';

type TParams<T extends QueryKeys> =
  Parameters<(typeof queries)[T]> extends [_, ...infer Rest] ? Rest : never;

export function useWSQuery<K extends QueryKeys, P extends TParams<K>>(
  key: K,
  params?: P
) {
  const connection = useConnection();

  type QueryReturnType = Awaited<ReturnType<(typeof queries)[K]>>;

  return useQuery<QueryReturnType>({
    queryKey: [key],
    queryFn: async () => {
      if (!connection) throw new Error('something went very wrong');

      console.log('connection is not null, sending req');

      // Some weird type issue
      /* eslint-disable-next-line */
      const fn = queries[key] as any;

      return await fn(connection, ...(params || []));
    },
    enabled: !!connection && !!connection.ws && connection.ws.readyState === 1,
    refetchOnWindowFocus: false,
  });
}
