import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/index/")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div>
      <h1>Layout</h1>
      <Outlet />
    </div>
  );
}
