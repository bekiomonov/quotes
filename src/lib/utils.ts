import { HTTPQuery, RequestOpts } from '@types'
import { clsx, type ClassValue } from 'clsx'
import qs from 'qs'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class ResponseError extends Error {
  override name: 'ResponseError' = 'ResponseError'
  constructor(
    public response: Response,
    msg?: string
  ) {
    super(msg)
  }
}

export class FetchError extends Error {
  override name: 'FetchError' = 'FetchError'
  constructor(
    public cause: Error,
    msg?: string
  ) {
    super(msg)
  }
}

export class RequiredError extends Error {
  override name: 'RequiredError' = 'RequiredError'
  constructor(
    public field: string,
    msg?: string
  ) {
    super(msg)
  }
}

export class ApiInstance {
  #basePath: string = ''
  #requestInit: RequestInit = {}

  constructor(base: string, init?: RequestInit) {
    this.#basePath = base.replace(/\/+$/, '')
    this.#requestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...(init && init),
    }
  }

  async #request(ctx: RequestOpts, init?: RequestInit) {
    let queryParams: string | undefined
    if (ctx.query) {
      queryParams = `?${qs.stringify(ctx.query, ctx.stringifyOptions)}`
    }
    const url = `${this.#basePath}${ctx.path || ''}${queryParams ? `?${queryParams}` : ''}`
    const response = await this.#fetchApi(url, {
      ...this.#requestInit,
      ...init,
    })
    if (response && response.status >= 200 && response.status < 300) {
      return response
    }
    throw new ResponseError(response, 'Response returned an error code')
  }

  async #fetchApi(input: string, init?: RequestInit) {
    let response: Response | undefined = undefined
    try {
      response = await fetch(input, init)
    } catch (error) {
      if (response === undefined) {
        if (error instanceof Error || error instanceof AggregateError) {
          throw new FetchError(error, 'The request failed and the interceptors did not return an alternative response')
        } else {
          throw error
        }
      }
    }
    return response
  }

  async getRaw(
    input: Omit<RequestOpts, 'method'> | string,
    config?: {
      query?: HTTPQuery
      init?: RequestInit
      beforeRequest?: (controller: AbortController) => void
    }
  ) {
    const controller = new AbortController()
    config?.beforeRequest && config.beforeRequest(controller)
    let response: Response | undefined = undefined

    if (typeof input === 'string') {
      response = await this.#request(
        {
          path: input,
          method: 'GET',
          query: config?.query,
        },
        { ...(config?.init && config.init), signal: controller.signal }
      )
    } else {
      response = await this.#request(
        {
          ...input,
          method: 'GET',
        },
        { ...(config?.init && config.init), signal: controller.signal }
      )
    }
    return response
  }
  async get<ResponseData>(
    input: Omit<RequestOpts, 'method'> | string,
    config?: {
      query?: HTTPQuery
      init?: RequestInit
      beforeRequest?: (controller: AbortController) => void
    }
  ) {
    const controller = new AbortController()
    let response: Response | undefined = undefined

    config?.beforeRequest && config.beforeRequest(controller)

    if (typeof input === 'string') {
      response = await this.#request(
        {
          path: input,
          method: 'GET',
          query: config?.query,
        },
        { ...(config?.init && config.init), signal: controller.signal }
      )
    } else {
      response = await this.#request(
        {
          ...input,
          method: 'GET',
        },
        { ...(config?.init && config.init), signal: controller.signal }
      )
    }
    return response.json() as ResponseData
  }
}
