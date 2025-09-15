<h1>
    @better-auth-extended/preferences
    <div style="display:flex;align-items:center;gap:0.5rem;margin-top:1rem;margin-bottom:0.5rem" aria-hidden="true">
        <a href="https://www.npmjs.com/package/@better-auth-extended/preferences">
          <img alt="NPM Version" src="https://img.shields.io/npm/v/@better-auth-extended/preferences?style=flat-square">
        </a>
        <a href="https://www.npmjs.com/package/@better-auth-extended/preferences">
          <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@better-auth-extended/preferences?style=flat-square">
        </a>
        <a href="#">
          <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@better-auth-extended/preferences?style=flat-square">
        </a>
        <a href="https://github.com/jslno/better-auth-extended/blob/feat/onboarding/packages/plugins/preferences/LICENSE.md">
          <img alt="NPM License" src="https://img.shields.io/npm/l/@better-auth-extended/preferences?style=flat-square">
        </a>
    </div>
</h1>

TODO

## Installation

### 1. Install the plugin

```bash
npm install @better-auth-extended/preferences
```

### 2. Add the plugin to your auth config

To use the Preferences plugin, add it to your auth config.

```ts
import { betterAuth } from "better-auth";
import { preferences } from "@better-auth-extended/preferences";

export const auth = betterAuth({
    // ... other configuration options
    plugins: [preferences()],
});
```

### 3. Add the client plugin

Include the Preferences client plugin in your authentication client instance.

```ts
import { createAuthClient } from "better-auth/client";
import { preferencesClient } from "@better-auth-extended/preferences/client";

const authClient = createAuthClient({
    plugins: [preferencesClient()],
});
```

### 4. Run migrations

```bash
npx @better-auth/cli migrate
```

or generate

```bash
npx @better-auth/cli generate
```

## License

[MIT](LICENSE.md)
