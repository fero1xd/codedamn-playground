import { useQuery } from "@tanstack/react-query";
import { useConnection } from "./use-connection";
import { Conn } from "@/providers/ws";
import { useEffect } from "react";

type TParams<T extends keyof Conn["queries"]> =
  Parameters<Conn["queries"][T]> extends [...infer Rest] ? Rest : never;

export type QueryKey<T extends keyof Conn["queries"]> = [
  T,
  ...params: TParams<T>,
];

export function useWSQuery<K extends keyof Conn["queries"]>(
  key: QueryKey<K>,
  opts?: {
    staleTime?: number;
    enabled?: boolean;
  }
) {
  const connection = useConnection();
  const queries = connection!.queries;

  type QueryReturnType = Awaited<ReturnType<(typeof queries)[K]>>;

  return useQuery<QueryReturnType>({
    queryKey: key,
    queryFn: async () => {
      if (!connection) throw new Error("something went very wrong");

      console.log("sending req " + key);

      // Some weird type issue
      /* eslint-disable-next-line */
      const fn = connection.queries[key[0]] as any;

      return await fn(...(key.length > 1 ? key.slice(1) : []));
    },
    enabled:
      !!connection &&
      connection.isReady &&
      !!connection.queries &&
      (!opts ? true : opts.enabled === undefined ? true : opts.enabled),
    refetchOnWindowFocus: false,
    staleTime:
      opts === undefined
        ? 0
        : opts.staleTime !== undefined
          ? opts.staleTime
          : 0,
  });
}
