<h1>
    @better-auth-extended/test-utils
    <div style="display:flex;align-items:center;gap:0.5rem;margin-top:1rem;margin-bottom:0.5rem" aria-hidden="true">
        <a href="https://www.npmjs.com/package/@better-auth-extended/test-utils">
          <img alt="NPM Version" src="https://img.shields.io/npm/v/@better-auth-extended/test-utils?style=flat-square">
        </a>
        <a href="https://www.npmjs.com/package/@better-auth-extended/test-utils">
          <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@better-auth-extended/test-utils?style=flat-square">
        </a>
        <a href="#">
          <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@better-auth-extended/test-utils?style=flat-square">
        </a>
        <a href="https://github.com/jslno/better-auth-extended/blob/feat/onboarding/packages/libraries/test-utils/LICENSE.md">
          <img alt="NPM License" src="https://img.shields.io/npm/l/@better-auth-extended/test-utils?style=flat-square">
        </a>
    </div>
</h1>

This library comes with test utilities to assist you in writing code to test your Better-Auth plugins.

## Installation

```bash
npm install @better-auth-extended/test-utils
```

## Usage

```ts
import { betterAuth } from "better-auth";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { myPlugin, myPluginClient } from "./my-plugin";

const { auth, db, client, testUser, signUpWithTestUser } =
  await getTestInstance({
    options: {
      database: new Database(), // Your database adapter
      plugins: [myPlugin()],
    },
    clientOptions: {
      plugins: [myClientPlugin()],
    },
  });
```

or

```ts
import { betterAuth } from "better-auth";
import { getTestInstance } from "@better-auth-extended/test-utils";
import { myPlugin, myPluginClient } from "./my-plugin";

const auth = betterAuth({
  database: new Database(), // Your database adapter
  plugins: [myPlugin()],
  secret: "better-auth.secret",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  rateLimit: {
    enabled: false,
  },
  advanced: {
    disableCSRFCheck: true,
    cookies: {},
  },
});

const { db, client, testUser, signUpWithTestUser } = await getTestInstance({
  auth,
  clientOptions: {
    plugins: [myClientPlugin()],
  },
});
```

## Writing Tests

You can now use the test APIs to test your plugin:

```ts
const { headers, user } = await signUpWithTestUser();

describe("My Plugin", () => {
  it("should do something cool", async () => {
    const result = await client.myPlugin.doSomethingCool();

    expect(result).toBe(true);
  });
});
```

Then run the tests, for example, using Vitest:

```bash
vitest foobar
```

## API

### `getTestInstance`

Optionally takes a single config object with options for the `betterAuth` instance and test instance configuration.

You can configure the betterAuth client instance inside the config object.

```ts
const {
  auth,
  db,
  client,
  testUser,
  signUpWithTestUser,
  signInWithTestUser,
  signInWithUser,
  cookieSetter,
  customFetchImpl,
  sessionSetter,
  context,
  resetDatabase,
} = await getTestInstance({
  options: {
    // Better-Auth options
    plugins: [myPlugin()],
  },
  clientOptions: {
    // Client options
    plugins: [myClientPlugin()],
  },
});
```

### Options

- `options` - The options for the Better-Auth instance.
- `auth` - An existing Better-Auth instance to use instead of creating a new one.
- `clientOptions` - The options for the Better-Auth client instance.
- `port` - The baseURL port for the better-auth instance.
- `disableTestUser` - Whether to disable the test user.
- `testUser` - The test user to use for the test instance.
- `shouldRunMigrations` - Whether to run database migrations on initialization.

### Methods

- `auth` - The Better-Auth server instance.
- `client` - The Better-Auth client instance.
- `signUpWithTestUser` - Sign up with the premade test user.
- `signInWithTestUser` - Sign in with the premade test user.
- `signInWithUser` - Sign in with a custom user.
- `cookieSetter` - Set the cookie for the test instance.
- `customFetchImpl` - The custom fetch implementation for the test instance.
- `sessionSetter` - Set the session for the test instance.
- `resetDatabase` - Reset the database by clearing all auth tables.

---

#### `auth`

The Better-Auth server instance.

#### `client`

The Better-Auth client instance.

#### `testUser`

The premade test user.

#### `signUpWithTestUser`

```ts
const { headers, user, session, token } = await signUpWithTestUser();
```

#### `signInWithTestUser`

```ts
const { headers, user, session, token } = await signInWithTestUser();
```

#### `signInWithUser`

```ts
const { headers, user, session, token } = await signInWithUser(email, password);
```

#### `cookieSetter`

Useful for getting the session of a successful sign in and applying that to a new headers object's cookie.

```ts
const headers = new Headers();
await client.signIn.email(
  {
    email: testUser.email,
    password: testUser.password,
  },
  {
    onSuccess: cookieSetter(headers),
  }
);
```

#### `customFetchImpl`

By default, when using the auth client, we make a fetch request to the better-auth server whenever you call an endpoint.
However, you can optionally provide the `customFetchImpl` to bypass this and it will skip the fetch request to the better-auth server, and instead directly invoke the endpoint on the server.

```ts
const client = createAuthClient({
  baseURL: "http://localhost:3000",
  fetchOptions: {
    customFetchImpl,
  },
});
```

#### `sessionSetter`

Useful for getting the session from the response of a successful sign in and applying that to a new headers object.

```ts
const headers = new Headers();
await client.signIn.email(
  {
    email: testUser.email,
    password: testUser.password,
  },
  {
    onSuccess: sessionSetter(headers),
  }
);

const response = await client.listSessions({
  fetchOptions: {
    headers,
  },
});
```

#### `context`

The Better-Auth context object.

#### `db`

The database adapter.

```ts title="example"
await db.create({
  model: "sometable",
  data: {
    hello: "world",
  },
});
```

#### `resetDatabase`

Reset the database by clearing all auth tables.

```ts
// Reset all auth tables
await resetDatabase();

// Reset specific tables
await resetDatabase(["user", "session"]);
```

## License

[MIT](LICENSE.md)
