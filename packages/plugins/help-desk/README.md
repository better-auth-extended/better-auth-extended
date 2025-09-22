<h1>
    @better-auth-extended/help-desk
    <div style="display:flex;align-items:center;gap:0.5rem;margin-top:1rem;margin-bottom:0.5rem" aria-hidden="true">
        <a href="https://www.npmjs.com/package/@better-auth-extended/help-desk">
          <img alt="NPM Version" src="https://img.shields.io/npm/v/@better-auth-extended/help-desk?style=flat-square">
        </a>
        <a href="https://www.npmjs.com/package/@better-auth-extended/help-desk">
          <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@better-auth-extended/help-desk?style=flat-square">
        </a>
        <a href="#">
          <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@better-auth-extended/help-desk?style=flat-square">
        </a>
        <a href="https://github.com/jslno/better-auth-extended/blob/feat/onboarding/packages/plugins/help-desk/LICENSE.md">
          <img alt="NPM License" src="https://img.shields.io/npm/l/@better-auth-extended/help-desk?style=flat-square">
        </a>
    </div>
</h1>

The Help Desk plugin allows users to submit support tickets, track their status and give admins tools to respond and resolve issues.

## Installation

### 1. Install the plugin

```bash
npm install @better-auth-extended/help-desk
```

### 2. Add the plugin to your auth config

To use the Help Desk plugin, add it to your auth config.

```ts
import { betterAuth } from "better-auth";
import { helpDesk } from "@better-auth-extended/help-desk";

export const auth = betterAuth({
    // ... other configuration options
    plugins: [
        helpDesk(),
    ],
});
```

### 3. Add the client plugin

Include the Help Desk client plugin in your authentication client instance.

```ts
import { createAuthClient } from "better-auth/client";
import { helpDeskClient } from "@better-auth-extended/help-desk/client";

const authClient = createAuthClient({
    plugins: [helpDeskClient()],
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
