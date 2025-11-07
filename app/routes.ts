import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("api/auth/*", "routes/api.auth.$.ts"),
  route("dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard.users.tsx"),
  ]),
] satisfies RouteConfig;
