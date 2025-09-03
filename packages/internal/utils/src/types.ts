export type IsExactlyEmptyObject<T> = keyof T extends never // no keys
	? T extends {} // is assignable to {}
		? {} extends T
			? true
			: false // and {} is assignable to it
		: false
	: false;

type CommonKeys<T extends object> = keyof T;
type AllKeys<T> = T extends any ? keyof T : never;
type Subtract<A, C> = A extends C ? never : A;
type NonCommonKeys<T extends object> = Subtract<AllKeys<T>, CommonKeys<T>>;

type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any }
	? T[K]
	: undefined;

export type Merge<T extends object> = {
	[k in CommonKeys<T>]: PickTypeOf<T, k>;
} & {
	[k in NonCommonKeys<T>]?: PickTypeOf<T, k>;
};

type PickTypeOf<T, K extends string | number | symbol> = K extends AllKeys<T>
	? PickType<T, K>
	: never;
