import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("tools/:toolId", "routes/tools.$toolId.tsx"),
] satisfies RouteConfig;
