import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/tools.tsx"),
    route("tools/:toolId", "routes/tools.$toolId.tsx"),
    route("*", "routes/404.tsx"),
  ]),
] satisfies RouteConfig;
