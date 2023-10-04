export const nonNullable = <T>(value: T): value is NonNullable<T> => value !== null;

export type Overwrite<T, U extends { [Key in keyof T]?: unknown }> = Omit<T, keyof U> & U;

export type SimpleObject<T = never> = { [key: string]: SimpleObject<T> | T };