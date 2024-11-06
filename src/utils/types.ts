export type EmptyRecord = Record<PropertyKey, never>

// prettier-ignore
export type Join<A extends string, S extends string, B extends string> =
    A extends "" ? B :
    B extends "" ? A :
    `${A}${S}${B}`
