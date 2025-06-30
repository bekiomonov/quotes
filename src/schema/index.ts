export type UserInfo = {
  id: string
  name: string
  sessionId: string
  favorites: (number | string)[]
}

export type Quote = {
  content: string
  author: string
  id: string | number
  source: string
  rating: number
  isFavorite: boolean
}
