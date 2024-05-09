# rsbuild-plugin-mass-svg

Importing `.svg` is a mass of mass. Let's organize it.

Document is WIP.

## Why

Assuming that you're using two ui libraries called `library-a` and `library-b`.

And `library-a` desires an url when importing a svg:

```tsx
import logo from './logo.svg';

const image = <img src={logo} alt="" />
```

While `library-b` desires a React component when importing a svg:

```tsx
import Logo from './logo.svg';

const image = <Logo />
```

This plugin helps you to add an asset rule for `library-a` and a svgr rule for `library-b`.

## Usage

```ts
import { defineConfig } from "@rsbuild/core";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginMassSvg } from "rsbuild-plugin-mass-svg";

export default defineConfig({
  plugins: [
    pluginReact(),
    // pluginSvgr is required.
    pluginSvgr(),
    pluginMassSvg({
      rules: [
        { issuer: /library-a/, defaultExport: "component" },
        { issuer: /library-b/, defaultExport: "asset/resource" },
      ],
    }),
  ],
});
```
