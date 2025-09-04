<h1>
    @better-auth-extended/app-invite
    <div style="display:flex;align-items:center;gap:0.5rem;margin-top:1rem;margin-bottom:0.5rem" aria-hidden="true">
        <a href="https://www.npmjs.com/package/@better-auth-extended/app-invite">
          <img alt="NPM Version" src="https://img.shields.io/npm/v/@better-auth-extended/app-invite?style=flat-square">
        </a>
        <a href="https://www.npmjs.com/package/@better-auth-extended/app-invite">
          <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@better-auth-extended/app-invite?style=flat-square">
        </a>
        <a href="#">
          <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@better-auth-extended/app-invite?style=flat-square">
        </a>
        <a href="https://github.com/jslno/better-auth-extended/blob/feat/onboarding/packages/plugins/app-invite/LICENSE.md">
          <img alt="NPM License" src="https://img.shields.io/npm/l/@better-auth-extended/app-invite?style=flat-square">
        </a>
    </div>
</h1>

The App Invite plugin enables you to invite users to your application through email invitations. It supports two types of invitations:

- **Personal Invitations**: Targeted to specific email addresses, ensuring only the intended recipient can use the invitation
- **Public Invitations**: Can be used by multiple users, making it ideal for open sign-up scenarios

This plugin is particularly useful for invite-only applications.

## Installation

### 1. Install the plugin

```bash
npm install @better-auth-extended/app-invite
```

### 2. Add the plugin to your auth config

To use the App Invite plugin, add it to your auth config.

```ts
import { betterAuth } from "better-auth";
import { appInvite } from "@better-auth-extended/app-invite";

export const auth = betterAuth({
  // ... other config options
  plugins: [
    appInvite({
      // required for personal invites
      sendInvitationEmail: (data) => {
        // ... send invitation to the user
      },
    }),
  ],
});
```

### 3. Add the client plugin

Include the App Invite client plugin in your authentication client instance.

```ts
import { createAuthClient } from "better-auth/client";
import { appInviteClient } from "@better-auth-extended/app-invite/client";

const authClient = createAuthClient({
  plugins: [appInviteClient()],
});
```

### 4. Run migrations

This plugin adds an additional table to the database. [Click here to see the schema](#schema)

```bash
npx @better-auth/cli migrate
```

or generate

```bash
npx @better-auth/cli generate
```

## Usage

To add members to the application, we first need to send an invitation to the user.
The user will receive an email with the invitation link. Once the user accepts the invitation, they will be signed up to the application.

### Setup Invitation Email

For personal invites to work we first need to provide `sendInvitationEmail` to the `better-auth` instance.
This function is responsible for sending the invitation email to the user.

You'll need to construct and send the invitation link to the user. The link should include the invitation ID,
which will be used with the `acceptInvitation` function when the user clicks on it.

This is only required for personal invites. Sharing public invitations is up to the inviter.

```ts
import { betterAuth } from "better-auth";
import { appInvite } from "@better-auth-extended/app-invite";
import { sendAppInvitation } from "./email";

export const auth = betterAuth({
  plugins: [
    appInvite({
      async sendInvitationEmail(data) {
        const inviteLink = `https://example.com/accept-invitation/${data.id}`;
        sendAppInvitation({
          name: data.name,
          email: data.email,
          invitedByUsername: data.inviter.name,
          invitedByEmail: data.inviter.email,
          inviteLink,
        });
      },
    }),
  ],
});
```

### Send Invitation

To invite users to the app, you can use the `invite` function provided by the client.
the `invite` function takes an object with the following properties:

- `email`: The email address of the user to invite. Leave empty to create a public invitation.
- `resend`: A boolean value that determines whether to resend the invitation email,
  if the user is already invited. Defaults to `false`
- `domainWhitelist`: An optional comma-separated list of domains that allows public invitations to be accepted only from approved domains (e.g., `example.com,*.example.org`).

```ts
await authClient.inviteUser({
  email: "test@email.com",
});
```

### Accept Invitation

When a user receives an invitation email, they can click on the invitation link to accept the invitation.
The link should include the invitation ID, which will be used to accept the invitation.

```ts
await authClient.acceptInvitation({
  invitationId: "invitation-id",
  name: "John Doe", // overridden if predefined in the invitation
  email: "test@email.com", // must be set for public invites
  password: "password123456",
});
```

### Update Invitation Status

To update the status of invitations you can use the `acceptInvitation`, `rejectInvitation`, `cancelInvitation`
function provided by the client. The functions take the invitation id as an argument.

```ts
// cancel invitation (by default only the inviter can cancel invitations)
await authClient.cancelInvitation({
  invitationId: "invitation-id",
});

// reject invitation (this is only available for personal invites)
await authClient.rejectInvitation({
  invitationId: "invitation-id",
});
```

### Get Invitation

To get an invitation you can use the `getAppInvitation` function provided by the client. You need to provide the
invitation id as a query parameter.

```ts
await authClient.getAppInvitation({
  query: {
    id: params.id,
  },
});
```

### List Invitations

Allows a user to list all invitations issued by themselves.

```ts
await authClient.listInvitations({
  query: {
    limit: 10,
  },
});
```

By default 100 invitations are returned. You can adjust the limit and offset using the following query parameters:

- `searchField`: The field to search on, which can be `email`, `name`, or `domainWhitelist`.
- `searchOperator`: The operator to use for the search. It can be `contains`, `starts_with`, or `ends_with`.
- `searchValue`: The value to search for.
- `limit`: The number of invitations to return.
- `offset`: The number of invitations to skip.
- `sortBy`: The field to sort the invitations by.
- `sortDirection`: The direction to sort the invitations by. Defaults to `asc`.
- `filterField`: The field to filter the invitations by.
- `filterOperator`: The operator to use for the filter. It can be `eq`, `ne`, `lt`, `lte`, `gt`, or `gte`.
- `filterValue`: The value to filter the invitations by.

```ts
await authClient.listInvitations({
  query: {
    searchField: "domainWhitelist",
    searchOperator: "contains",
    searchValue: "example.com",
    limit: 10,
    offset: 0,
    sortBy: "createdAt",
    sortDirection: "desc",
    filterField: "expiresAt",
    filterOperator: "lt",
    filterValue: new Date().toISOString(),
  },
});
```

## Schema

The plugin requires an additional table in the database.

Table Name: `appInvitation`

| Field Name      | Type     | Key  | Description                                                    |
| --------------- | -------- | ---- | -------------------------------------------------------------- |
| id              | `string` | `PK` | Unique identifier for each invitation                          |
| name            | `string` | `?`  | The name of the user                                           |
| email           | `string` | `?`  | The email address of the user                                  |
| inviterId       | `string` | `FK` | The ID of the inviter                                          |
| status          | `string` |      | The status of the invitation                                   |
| domainWhitelist | `string` | `?`  | A comma separated whitelist of domains for a public invitation |
| expiresAt       | `Date`   | `?`  | Timestamp of when the invitation expires                       |
| createdAt       | `Date`   |      | Timestamp of when the invitation was created                   |

## Options

**canCreateInvitation**: `((ctx: GenericEndpointContext) => Promise<boolean> | boolean)` | `boolean` - A function that determines whether a user can create an invitation. By default, it's `true`. You can set it to `false` to restrict users from creating invitations.

**canCancelInvitation** `((ctx: GenericEndpointContext, invite: AppInvitation) => Promise<boolean> | boolean)` | `boolean` - A function that determines whether a user can cancel invitations. By default, the user can only cancel invites they created. You can set it to `false` to restrict users from canceling invitations.

**sendInvitationEmail**: `async (data) => Promise<void>` - A function that sends an invitation email to the user. This is only required for personal invitations.

**invitationExpiresIn**: `number` - How long the invitation link is valid for in seconds. By default an invitation expires after 48 hours (2 days). Set it to `null` to prevent invitations from expiring.

**autoSignIn**: `boolean` - A boolean value that determines whether to prevent automatic sign-up when accepting an invitation. Defaults to `false`.

**cleanupExpiredInvitations**: `boolean` - Clean up expired invitations when a value is fetched. Default `true`.

**cleanupPersonalInvitesOnDecision**: `boolean` - Cleanup personal invitations when a decision is made. Default `false`.

**verifyEmailOnAccept**: `boolean` - Whether to verify email addresses when accepting invitations. Default `true`.

**resendExistingInvite**: `boolean` - Whether to resend existing invitations, instead of creating a new one. Default `false`.

**hooks.create.before**: `(ctx: GenericEndpointContext) => Promise<void> | void` - A function that runs before an invitation is created.

**hooks.create.after**: `(ctx: GenericEndpointContext, invitation: AppInvitation) => Promise<void> | void` - A function that runs after an invitation was created.

**hooks.accept.before**: `(ctx: GenericEndpointContext, userToCreate: Partial<User> & { email: string }) => Promise<{ user?: User; } | void> | { user?: User; } | void;` - A function that runs before an invitation is accepted.

**hooks.accept.after**: `(ctx: GenericEndpointContext, data: { invitation: AppInvitation; user: User; }) => Promise<void> | void` - A function that runs after an invitation was accepted.

**hooks.reject.before**: `(ctx: GenericEndpointContext, invitation: AppInvitation) => Promise<void> | void` - A function that runs before an invitation is rejected.

**hooks.reject.after**: `(ctx: GenericEndpointContext, invitation: AppInvitation) => Promise<void> | void` - A function that runs after an invitation was rejected.

**hooks.cancel.before**: `(ctx: GenericEndpointContext, invitation: AppInvitation) => Promise<void> | void` - A function that runs before an invitation is canceled.

**hooks.cancel.after**: `(ctx: GenericEndpointContext, invitation: AppInvitation) => Promise<void> | void` - A function that runs after an invitation was canceled.

**schema**: The schema for the app-invite plugin. Allows you to infer additional fields for the `user` and `appInvitation` tables. This option is available in the client plugin as well.

~~**allowUserToCreateInvitation**~~: `boolean` | `((user: User, type: "personal" | "public") => Promise<boolean> | boolean)` - A function that determines whether a user can invite others. By defaults it's `true`. You can set it to `false` to restrict users from creating invitations. (deprecated. use `canCreateInvitation` instead.)

~~**allowUserToCancelInvitation**~~: `(data: { user: User, invitation: AppInvitation }) => Promise<boolean> | boolean` - A function that determines whether a user can cancel invitations. By default the user can only cancel invites created by them. You can set it to `false` to restrict users from canceling invitations. (deprecated. use `canCancelInvitation` instead.)

## License

[MIT](LICENSE.md)
