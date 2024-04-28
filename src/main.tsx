import React from "react";
import ReactDOM from "react-dom/client";
import "@/styles/globals.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";
import { Spinner } from "./components/ui/loading";
import { ReactQueryProvider } from "./providers/react-query";
import { WebSocketProvider } from "./providers/ws";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPendingComponent: () => <Spinner />,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <WebSocketProvider>
        <ReactQueryProvider>
          <RouterProvider router={router} />
        </ReactQueryProvider>
      </WebSocketProvider>
    </React.StrictMode>
  );
}
