<h1>
    @better-auth-extended/onboarding
    <div style="display:flex;align-items:center;gap:0.5rem;margin-top:1rem;margin-bottom:0.5rem" aria-hidden="true">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/@better-auth-extended/onboarding?style=flat-square">
        <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@better-auth-extended/onboarding?style=flat-square">
        <img alt="NPM License" src="https://img.shields.io/npm/l/@better-auth-extended/onboarding?style=flat-square">
    </div>
</h1>

The Onboarding plugin allows you to create multi-step onboarding flows for new users. It automatically tracks completion status, enforces step requirements, and integrates seamlessly with your authentication flow.

## Features

- **Multi-step onboarding flows** with custom validation
- **Automatic completion tracking** per user
- **Required step enforcement** before marking onboarding complete
- **One-time step protection** to prevent duplicate completions
- **Built-in presets** for common onboarding scenarios
- **Client-side integration** with automatic redirects

## Installation

### 1. Install the Plugin

```bash
npm install @better-auth-extended/onboarding
```

### 2. Add the plugin to your auth config

To use the Onboarding plugin, add it to your auth config.

```ts
import { betterAuth } from "better-auth";
import {
  onboarding,
  createOnboardingStep,
} from "@better-auth-extended/onboarding";
import { z } from "zod";

export const auth = betterAuth({
  // ... other config options
  plugins: [
    onboarding({
      steps: {
        legalConsent: createOnboardingStep({
          input: z.object({
            tosAccepted: z.boolean(),
            privacyPolicyAccepted: z.boolean(),
            marketingConsent: z.boolean().optional().default(false),
          }),
          async handler(ctx) {
            const { tosAccepted, privacyPolicyAccepted, marketingConsent } =
              ctx.body;

            if (!tosAccepted || !privacyPolicyAccepted) {
              // Don't mark step as completed
              throw ctx.error("UNAVAILABLE_FOR_LEGAL_REASONS");
            }
          },
          required: true,
          once: true,
        }),
        profile: createOnboardingStep({
          input: z.object({
            bio: z.string().optional(),
            gender: z.enum(["m", "f", "d"]).optional(),
            dateOfBirth: z.date().optional(),
          }),
          async handler(ctx) {
            // Create or update user profile
            const profile = await createProfile(ctx.body);
            return profile;
          },
        }),
      },
      completionStep: "profile",
    }),
  ],
});
```

### 3. Add the client plugin

Include the client plugin in your auth client instance.

```ts
import { createAuthClient } from "better-auth/client";
import { onboardingClient } from "@better-auth-extended/onboarding/client";
import type { auth } from "./your/path"; // Import as type

const authClient = createAuthClient({
  plugins: [
    onboardingClient<typeof auth>({
      onOnboardingRedirect: () => {
        window.location.href = "/onboarding";
      },
    }),
  ],
});
```

### 4. Run migrations

This plugin adds additional fields to the user table. [Click here to see the schema](#schema)

```bash
npx @better-auth/cli migrate
```

or

```bash
npx @better-auth/cli generate
```

## Usage

The Onboarding plugin provides several endpoints to manage the onboarding flow. Users can check if they need onboarding, complete steps, and verify their progress.

### Check if user needs onboarding

Use the `shouldOnboard` function to check if a user needs to complete onboarding.

**Client**:

```ts
const { data: needsOnboarding } = await authClient.onboarding.shouldOnboard();

if (needsOnboarding) {
  // Redirect to onboarding flow
  router.push("/onboarding");
}
```

**Server**:

```ts
const needsOnboarding = await auth.api.shouldOnboard();

if (needsOnboarding) {
  // Redirect to onboarding flow
  redirect("/onboarding");
}
```

### Complete onboarding step

Use the `onboardingStep` function to complete a specific onboarding step. The step name is derived from your step configuration.

**Client**:

```ts
const { data, error } = await authClient.onboarding.step.profile({
  bio: "Software developer",
});

if (error) {
  console.error("Failed to complete profile step:", error);
} else {
  console.log("Completed steps:", data.completedSteps);
}

const profile = data.data;
```

**Server**:

```ts
const profile = await auth.api.onboardingStepProfile({
  body: {
    bio: "Software developer",
  },
});
```

### Check step access

Use the `canAccessOnboardingStep` function to check if a user can access a specific step. This is useful for preventing access to steps that shouldn't be available.

```ts
const canAccess = await auth.api.canAccessOnboardingStepLegalConsent();
```

### Skip Onboarding Step

For optional completion steps, users can skip them if they're not required. This is useful when the completion step is optional but you still want to mark onboarding as complete.

**Client**:

```ts
// Only available for optional completion steps
const { data, error } = await authClient.onboarding.skipStep.myCompletionStep();
```

**Server**:

```ts
// Only available for optional completion steps
const data = await auth.api.skipOnboardingStepMyCompletionStep();
```

### Handle onboarding redirects

The plugin automatically handles onboarding redirects when users sign up or get their session. Configure the redirect behavior in the client plugin.

```ts
onboardingClient<typeof auth>({
  onOnboardingRedirect: () => {
    // Custom redirect logic
    window.location.href = "/onboarding";
  },
});
```

## Defining steps

Steps are defined using the `createOnboardingStep` function. Each step requires a handler function and can include input validation and completion rules.

```ts
import { createOnboardingStep } from "@better-auth-extended/onboarding";

const step = createOnboardingStep({
  async handler(ctx) {
    // process step
  },
  // ... other configuration
});
```

### Options

- **input**: `ZodType` - Zod schema for request body validation.
- **handler**: `<R>(ctx: GenericEndpointContext) => R | Promise<R>` - Function that processes the step.
- **once**: `boolean` - If `true`, step can only be completed once. (default: `true`)
- **required**: `boolean` - If `true`, step must be completed before onboarding is done. (default: `false`)
- **requireHeader**: `boolean` - If `true`, headers are required in context.
- **requireRequest**: `boolean` - If `true`, request object is required.
- **cloneRequest**: `boolean` - Clone the request object from router.

### Example

```ts
import { createOnboardingStep } from "@better-auth-kit/onboarding";
import { z } from "zod";

const preferencesStep = createOnboardingStep({
  input: z.object({
    theme: z.enum(["light", "dark", "system"]).optional().default("system"),
    notifications: z.boolean().optional().default(false),
  }),
  async handler(ctx) {
    const { theme, notifications } = ctx.body;

    const preferences = await ctx.context.adapter.update({
      model: "preferences",
      where: [
        {
          field: "userId",
          value: ctx.context.session.id,
        },
      ],
      update: {
        theme,
        notifications,
      },
    });

    return preferences;
  },
  once: false,
});
```

## Presets

### Setup New Password

Prompt the user to enter and confirm a new password.

This this particularly useful to applications where the user was given a temporary password.

```ts
import { setupNewPasswordStep } from "@better-auth-extended/onboarding/presets";

onboarding({
  steps: {
    newPassword: setupNewPasswordStep({
      required: true,
      passwordSchema: {
        minLength: 12,
        maxLength: 128,
      },
    }),
  },
  completionStep: "newPassword",
});
```

### Setup 2FA

Allows the user to enable two-factor authentication.

```ts
import { setup2FAStep } from "@better-auth-extended/onboarding/presets";

onboarding({
  steps: {
    twoFactor: setup2FAStep({
      required: true,
    }),
  },
  completionStep: "twoFactor",
});
```

## Schema

The plugin adds additional fields to the `user` table.

Table Name: `user`

| Field Name     | Type      | Key | Description                                   |
| -------------- | --------- | --- | --------------------------------------------- |
| shouldOnboard  | `boolean` | `?` | Whether the user needs to complete onboarding |
| completedSteps | `string`  | `?` | JSON string array of completed step IDs       |

## Options

**steps**: `Record<string, OnboardingStep>` - Object mapping step IDs to step configurations. Each step defines the input validation, handler function, and completion rules.

**completionStep**: `keyof Steps` - the step ID that marks onboarding as complete. Once this step is completed, the user's `shouldOnboard` field is set to `false`.

**autoEnableOnSignUp**: `boolean` | `(ctx: GenericEndpointContext) => Promise<boolean> | boolean` - Whether to automatically enable onboarding for new users during sign up. (default: `true`)

**secondaryStorage**: `boolean` - Whether to use secondary storage instead of the database. (default: `false`)

**schema**: Custom schema configuration for renaming fields or adding additional configuration.

## Best Practises

### 1. Progressive Disclosure

Break down onboarding into logical, digestible steps:

```ts
const steps = {
  welcome: createOnboardingStep({
    /* welcome step */
  }),
  profile: createOnboardingStep({
    /* basic profile */
  }),
  preferences: createOnboardingStep({
    /* user preferences */
  }),
  verification: createOnboardingStep({
    /* email/phone verification */
  }),
};
```

### 2. Input Validation

Always validate user input with Zod schemas:

```ts
createOnboardingStep({
  input: z
    .object({
      email: z.email("Invalid email address"),
      phone: z.regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
    })
    .refine((data) => data.email || data.phone, {
      message: "Either email or phone is required",
      path: ["email"],
    }),
  async handler(ctx) {
    // ...
  },
});
```

### 3. Required vs Optional Steps

Use the `required` flag to distinguish between essential and optional steps:

```ts
const steps = {
  terms: createOnboardingStep({ required: true }), // Must complete
  profile: createOnboardingStep({ required: false }), // Optional
  preferences: createOnboardingStep(), // Optional
};
```

### 4. One-Time vs Repeatable Steps

Use the `once` flag to distinguish between one-time and repeatable steps:

```ts
const steps = {
  terms: createOnboardingStep(), // Submit only once
  profile: createOnboardingStep({ once: true }), // Submit only once
  preferences: createOnboardingStep({ once: false }), // Allow multiple submits
};
```

### 5. Secondary Storage

If applicable, use secondary storage instead of the main database.

```ts
onboarding({
  secondaryStorage: true,
});
```

## License

[MIT](LICENSE.md)
