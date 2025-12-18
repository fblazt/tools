import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/tools.tsx"),
  route("tools/:toolId", "routes/tools.$toolId.tsx"),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
