import { h64 } from "xxhashjs";

export function getStableHash(str: string): `${bigint}` {
    return h64(0).update(str).digest().toString() as `${bigint}`;
}