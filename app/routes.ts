import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("tools", "routes/tools.tsx", [
    index("routes/tools._index.tsx"),
    route(":toolId", "routes/tools.$toolId.tsx"),
  ]),
] satisfies RouteConfig;
