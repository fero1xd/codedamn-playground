import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import { useDarkMode } from "@/hooks/use-dark-mode";

interface Context {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<Context>()({
  component: () => {
    useDarkMode();

    return (
      <div className="">
        <Outlet />

        <Toaster />
        <TanStackRouterDevtools />
        <ReactQueryDevtools />
      </div>
    );
  },
});
