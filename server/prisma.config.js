import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "lib/prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
