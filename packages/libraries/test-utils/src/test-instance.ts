import {
	betterAuth,
	type Auth,
	type AuthContext,
	type BetterAuthOptions,
	type Session,
	type User,
} from "better-auth";
import {
	createAuthClient,
	type BetterAuthClientOptions,
	type FetchEsque,
	type SuccessContext,
} from "better-auth/client";
import { bearer } from "better-auth/plugins/bearer";
import { getMigrations, getAuthTables } from "better-auth/db";
import { parseSetCookieHeader, setCookieToHeader } from "better-auth/cookies";
import { getBaseURL } from "@better-auth-extended/internal-utils";
import type { DBAdapter } from "better-auth/adapters";

const defaultOptions = {
	secret: "better-auth.secret",
	emailAndPassword: {
		enabled: true,
	},
	rateLimit: {
		enabled: false,
	},
	advanced: {
		cookies: {},
	},
	logger: {
		level: "debug",
	},
} as const satisfies BetterAuthOptions;

type InferOptions<
	O extends
		| {
				options?: BetterAuthOptions;
				auth?: never;
		  }
		| {
				auth?: { api: any; options: BetterAuthOptions };
				options?: never;
		  },
> = O extends {
	options: infer T extends BetterAuthOptions;
}
	? T
	: never;

export type TestInstance<
	O extends
		| {
				options?: BetterAuthOptions;
				auth?: never;
		  }
		| {
				auth?: { api: any; options: BetterAuthOptions };
				options?: never;
		  },
	C extends BetterAuthClientOptions,
> = {
	auth: ReturnType<
		typeof betterAuth<
			InferOptions<O> extends undefined
				? typeof defaultOptions
				: InferOptions<O> & typeof defaultOptions
		>
	>;
	client: ReturnType<typeof createAuthClient<C>>;
	testUser: User & Record<string, any>;
	cookieSetter: typeof setCookieToHeader;
	customFetchImpl: FetchEsque;
	sessionSetter: (headers: Headers) => (context: SuccessContext) => void;
	context: AuthContext<
		InferOptions<O> extends undefined
			? typeof defaultOptions
			: InferOptions<O> & typeof defaultOptions
	>;
	db: DBAdapter;
	signUpWithTestUser: () => Promise<{
		token: string | null;
		session: Session & Record<string, any>;
		user: User & Record<string, any>;
		headers: Headers;
		setCookie: (name: string, value: string) => void;
	}>;
	signInWithTestUser: () => Promise<{
		token: string | null;
		session: Session & Record<string, any>;
		user: User & Record<string, any>;
		headers: Headers;
		setCookie: (name: string, value: string) => void;
	}>;
	signInWithUser: (
		email: string,
		password: string,
	) => Promise<{
		token: string | null;
		session: Session & Record<string, any>;
		user: User & Record<string, any>;
		headers: Headers;
		setCookie: (name: string, value: string) => void;
	}>;
	resetDatabase: (tables?: string[]) => Promise<void>;
};

export const getTestInstance = async <
	O extends
		| {
				options?: BetterAuthOptions;
				auth?: never;
		  }
		| {
				auth?: { api: any; options: BetterAuthOptions };
				options?: never;
		  },
	C extends BetterAuthClientOptions,
>(
	config?: O & {
		clientOptions?: C;
		port?: number;
		disableTestUser?: boolean;
		testUser?: Partial<User>;
		shouldRunMigrations?: boolean;
	},
): Promise<TestInstance<O, C>> => {
	const auth = (
		config?.auth
			? config.auth
			: betterAuth({
					baseURL:
						config?.options?.baseURL ||
						"http://localhost:" + (config?.port || 3000),
					...defaultOptions,
					...config?.options,
					advanced: {
						disableCSRFCheck: true,
						...config?.options?.advanced,
					},
					plugins: [bearer(), ...(config?.options?.plugins || [])],
				})
	) as Auth;

	const options: BetterAuthOptions = auth.options;
	const SESSION_TOKEN_COOKIE_NAME = getSessionTokenCookieName(options);

	const customFetchImpl = async (
		url: string | URL | Request,
		init?: RequestInit,
	) => {
		const req = new Request(url.toString(), init);
		return auth.handler(req);
	};

	const sessionSetter = (headers: Headers) => (context: SuccessContext) => {
		const header = context.response.headers.get("set-cookie");
		if (header) {
			const cookies = parseSetCookieHeader(header || "");
			const signedCookie = cookies.get(SESSION_TOKEN_COOKIE_NAME)?.value;
			headers.set("cookie", `${SESSION_TOKEN_COOKIE_NAME}=${signedCookie}`);
		}
	};

	const client = createAuthClient({
		...(config?.clientOptions as C extends undefined ? {} : C),
		plugins: [
			// TODO: bearerClient(),
			...((config?.clientOptions?.plugins as C["plugins"]) || []),
		],
		baseURL: getBaseURL(
			config?.options?.baseURL || "http://localhost:" + (config?.port || 3000),
			config?.options?.basePath || "/api/auth",
		),
		fetchOptions: {
			customFetchImpl,
		},
	});

	const testUser = {
		email: "test@test.com",
		password: "test123456",
		name: "test user",
		...config?.testUser,
	} as User & Record<string, any>;

	if (config?.shouldRunMigrations) {
		const { runMigrations } = await getMigrations(auth.options);
		await runMigrations();
	}

	const useHeaders = () => {
		const headers = new Headers();
		const setCookie = (name: string, value: string) => {
			const current = headers.get("cookie");
			headers.set("cookie", `${current || ""}; ${name}=${value}`);
		};

		return {
			headers,
			setCookie,
		};
	};

	async function signUpWithTestUser() {
		if (config?.disableTestUser) {
			throw new Error("Test user is disabled");
		}
		const { headers, setCookie } = useHeaders();
		// @ts-expect-error
		const { data, error } = await client.signUp.email({
			email: testUser.email,
			password: testUser.password,
			name: testUser.name,
			fetchOptions: {
				// @ts-expect-error
				onSuccess(context) {
					const header = context.response.headers.get("set-cookie");
					const cookies = parseSetCookieHeader(header || "");
					const signedCookie = cookies.get(SESSION_TOKEN_COOKIE_NAME)?.value;
					headers.set("cookie", `${SESSION_TOKEN_COOKIE_NAME}=${signedCookie}`);
				},
			},
		});
		if (error) {
			console.error(error);
			throw error;
		}
		return {
			token: (data.token ?? null) as string | null,
			session: data.session as Session & Record<string, any>,
			user: data.user as User & Record<string, any>,
			headers,
			setCookie,
		};
	}

	async function signInWithTestUser() {
		if (config?.disableTestUser) {
			throw new Error("Test user is disabled");
		}
		const { headers, setCookie } = useHeaders();
		// @ts-expect-error
		const { data, error } = await client.signIn.email({
			email: testUser.email,
			password: testUser.password,
			fetchOptions: {
				// @ts-expect-error
				onSuccess(context) {
					const header = context.response.headers.get("set-cookie");
					const cookies = parseSetCookieHeader(header || "");
					const signedCookie = cookies.get(SESSION_TOKEN_COOKIE_NAME)?.value;
					headers.set("cookie", `${SESSION_TOKEN_COOKIE_NAME}=${signedCookie}`);
				},
			},
		});

		return {
			token: (data.token ?? null) as string | null,
			session: data.session as Session & Record<string, any>,
			user: data.user as User & Record<string, any>,
			headers,
			setCookie,
		};
	}

	async function signInWithUser(email: string, password: string) {
		const { headers, setCookie } = useHeaders();
		// @ts-expect-error
		const { data } = await client.signIn.email({
			email,
			password,
			fetchOptions: {
				// @ts-expect-error
				onSuccess(context) {
					const header = context.response.headers.get("set-cookie");
					const cookies = parseSetCookieHeader(header || "");
					const signedCookie = cookies.get(SESSION_TOKEN_COOKIE_NAME)?.value;
					headers.set("cookie", `${SESSION_TOKEN_COOKIE_NAME}=${signedCookie}`);
				},
			},
		});

		return {
			token: (data.token ?? null) as string | null,
			session: data.session as Session & Record<string, any>,
			user: data.user as User & Record<string, any>,
			headers,
			setCookie,
		};
	}

	async function resetDatabase(
		tables: string[] = Object.values(getAuthTables(options)).map(
			(def) => def.modelName,
		),
	) {
		const ctx = await auth.$context;
		const adapter = ctx.adapter;
		for (const modelName of tables) {
			const allRows = await adapter.findMany<{ id: string }>({
				model: modelName,
				limit: 1000,
			});
			for (const row of allRows) {
				await adapter.delete({
					model: modelName,
					where: [{ field: "id", value: row.id }],
				});
			}
		}
		console.log("Database successfully reset.");
	}

	const context: any = await auth.$context;

	return {
		auth: auth as unknown as ReturnType<
			typeof betterAuth<
				InferOptions<O> extends undefined
					? typeof defaultOptions
					: InferOptions<O> & typeof defaultOptions
			>
		>,
		client: client as unknown as ReturnType<typeof createAuthClient<C>>,
		testUser,
		cookieSetter: setCookieToHeader,
		customFetchImpl,
		sessionSetter,
		context,
		db: context.adapter,
		signUpWithTestUser,
		signInWithTestUser,
		signInWithUser,
		resetDatabase,
	};
};

const getSessionTokenCookieName = (options: BetterAuthOptions) => {
	const cookiePrefix = options.advanced?.cookiePrefix ?? "better-auth";
	const sessionTokenName =
		options.advanced?.cookies?.session_token?.name ?? "session_token";
	return `${cookiePrefix}.${sessionTokenName}`;
};
