import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import { createRequire } from "node:module";

// render the app's own code (voucher templates, real UI components) instead of re-drawing it
const APP = path.resolve(process.cwd(), "../studying-report");
const local = (p: string) => path.resolve(process.cwd(), p);
// the bundler's own webpack copy; a second instance can't parse its modules
const fromBundler = createRequire(createRequire(local("package.json")).resolve("@remotion/bundler/package.json"));
const { ProvidePlugin } = fromBundler("webpack") as typeof import("webpack");

Config.setVideoImageFormat("jpeg");
// each tab renders the full app UI; the default (half the cores) ran this machine out of memory
Config.setConcurrency(2);
Config.overrideWebpackConfig((config) =>
  enableTailwind({
    ...config,
    // some app modules build JSX at module scope, before any component imports React
    plugins: [...(config.plugins ?? []), new ProvidePlugin({ React: local("node_modules/react") })],
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        "@/shared/components/BrandIcon$": local("src/shared/app/stubs/brand-icon.tsx"),
        "@/shared/components/ui/popover$": local("src/shared/app/stubs/popover.tsx"),
        "@/shared/components/ui/dialog$": local("src/shared/app/stubs/dialog.tsx"),
        "@": path.join(APP, "src"),
        // one React for Remotion and the app's components, or hooks break
        react: local("node_modules/react"),
        "react-dom": local("node_modules/react-dom"),
        "next/link": local("src/shared/app/stubs/next-link.tsx"),
        "next/image": local("src/shared/app/stubs/next-image.tsx"),
        "next/navigation": local("src/shared/app/stubs/next-navigation.ts"),
        "@sentry/nextjs": local("src/shared/app/stubs/sentry.ts"),
      },
      modules: [
        ...(config.resolve?.modules ?? ["node_modules"]),
        path.join(APP, "node_modules"),
      ],
    },
  }),
);
