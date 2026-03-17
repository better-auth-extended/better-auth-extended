<h1>
    @better-auth-extended/waitlist
    <div style="display:flex;align-items:center;gap:0.5rem;margin-top:1rem;margin-bottom:0.5rem" aria-hidden="true">
        <a href="https://www.npmjs.com/package/@better-auth-extended/waitlist">
          <img alt="NPM Version" src="https://img.shields.io/npm/v/@better-auth-extended/waitlist?style=flat-square">
        </a>
        <a href="https://www.npmjs.com/package/@better-auth-extended/waitlist">
          <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@better-auth-extended/waitlist?style=flat-square">
        </a>
        <a href="#">
          <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@better-auth-extended/waitlist?style=flat-square">
        </a>
        <a href="https://github.com/jslno/better-auth-extended/blob/feat/onboarding/packages/plugins/waitlist/LICENSE.md">
          <img alt="NPM License" src="https://img.shields.io/npm/l/@better-auth-extended/waitlist?style=flat-square">
        </a>
    </div>
</h1>

This plugin allows you to add a waitlist to your application.

## Installation

### 1. Install the plugin

```bash
npm install @better-auth-extended/waitlist
```

### 2. Add the plugin to your auth config

To use the Waitlist plugin, add it to your auth config.

```ts
import { betterAuth } from "better-auth";
import { waitlist } from "@better-auth-extended/waitlist";

export const auth = betterAuth({
    // ... other configuration options
    plugins: [
        waitlist(),
    ],
});
```

### 3. Add the client plugin

Include the Waitlist client plugin in your authentication client instance.

```ts
import { createAuthClient } from "better-auth/client";
import { waitlistClient } from "@better-auth-extended/waitlist/client";

const authClient = createAuthClient({
    plugins: [waitlistClient()],
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
