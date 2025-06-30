import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'

export const getCookies = async <T extends string | string[] | void = undefined, A extends boolean = true>(
  asString?: A,
  name?: T
): Promise<
  T extends string
    ? A extends true
      ? string
      : A extends false
        ? ReadonlyRequestCookies | undefined
        : never
    : T extends string[]
      ? A extends true
        ? string
        : A extends false
          ? ReadonlyRequestCookies[]
          : never
      : T extends void
        ? A extends false
          ? string[]
          : string
        : never
> => {
  if (typeof asString === 'undefined') {
    asString = true as A
  }
  if (typeof name === 'string') {
    const cookie = await cookies()
    return asString ? (`${cookie.get(name)?.name}=${cookie.get(name)?.value}` as any) : (cookie.get(name) as any)
  } else if (Array.isArray(name)) {
    const cookie = await cookies()
    return asString
      ? (cookie
          .getAll()
          .filter((cookie) => name.includes(cookie.name))
          .map(({ name, value }) => `${name}=${value}`)
          .join('; ') as any)
      : (cookie.getAll().filter((cookie) => name.includes(cookie.name)) as any)
  } else {
    const cookie = await cookies()
    return asString
      ? (cookie
          .getAll()
          ?.map(({ name, value }) => `${name}=${value}`)
          .join('; ') as any)
      : (cookie.getAll()?.map(({ name, value }) => `${name}=${value}`) as any)
  }
}
