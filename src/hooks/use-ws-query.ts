import { useQuery } from '@tanstack/react-query';
import { useConnection } from './use-connection';
import { FetchEvents } from '@/queries/types';
import { Conn } from '@/providers/ws';

type TParams<T extends FetchEvents> =
  Parameters<Conn['queries'][T]> extends [...infer Rest] ? Rest : never;

export type QueryKey<T extends FetchEvents> = [T, ...params: TParams<T>];

export function useWSQuery<K extends FetchEvents>(
  key: QueryKey<K>,
  staleTime?: number
) {
  const connection = useConnection();
  const queries = connection!.queries;

  type QueryReturnType = Awaited<ReturnType<(typeof queries)[K]>>;

  return useQuery<QueryReturnType>({
    queryKey: key,
    queryFn: async () => {
      if (!connection) throw new Error('something went very wrong');

      console.log('connection is not null, sending req');

      // Some weird type issue
      /* eslint-disable-next-line */
      const fn = connection.queries[key[0]] as any;

      return await fn(...(key.length > 1 ? key.slice(1) : []));
    },
    enabled:
      !!connection &&
      !!connection.ws &&
      connection.ws.readyState === 1 &&
      !!connection.queries,
    refetchOnWindowFocus: false,
    staleTime: staleTime === undefined ? 0 : staleTime,
  });
}
