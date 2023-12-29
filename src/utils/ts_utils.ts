export const nonNullable = <T>(value: T): value is NonNullable<T> => value !== null;

export type Overwrite<T, U extends { [Key in keyof T]?: unknown }> = Omit<T, keyof U> & U;

export type SimpleObject<T = never> = { [key: string]: SimpleObject<T> | T };

export type SimpleMap<K, V> = Map<K, SimpleMap<K, V> | V>;

export function getValuesFromSimpleMap<K, V>(map: SimpleMap<K, V>): V[] {
    const values: V[] = [];
    map.forEach((value) => {
        if (value instanceof Map) {
            values.push(...getValuesFromSimpleMap(value));
        } else {
            values.push(value);
        }
    });
    return values;
}

export function getKeysFromSimpleMap<K, V>(map: SimpleMap<K, V>): K[] {
    const keys: K[] = [];
    map.forEach((_, key) => {
        keys.push(key);
        if (map.get(key) instanceof Map) {
            keys.push(...getKeysFromSimpleMap(map.get(key) as SimpleMap<K, V>));
        }
    });
    return keys;
}