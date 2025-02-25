import { xxh64 } from "@node-rs/xxhash";

export function getStableHash(str: string) {
    return xxh64(str, 0n);
}