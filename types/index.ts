import { IStringifyOptions } from 'qs'
import { SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number
}

type Json = any

export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
export type HTTPHeaders = { [key: string]: string }
export type HTTPQuery = {
  [key: string]:
    | string
    | number
    | null
    | boolean
    | Array<string | number | null | boolean>
    | Set<string | number | null | boolean>
    | HTTPQuery
}
export type HTTPBody = Json | FormData | URLSearchParams
export interface RequestOpts {
  path: string
  method: HTTPMethod
  headers?: HTTPHeaders
  query?: HTTPQuery
  body?: HTTPBody
  stringifyOptions?: IStringifyOptions
}
