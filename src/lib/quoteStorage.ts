import { Quote } from '@schema'
import { LocalStorageAdapter } from '@service/storage'
import { getRandomInt } from './utils'

export class QuoteStorage extends LocalStorageAdapter {
  quotesMap: Record<Quote['id'], Quote> = {}
  #initialized: boolean = false

  constructor() {
    super()
    this.#initialized = !!this.getItem<Quote[]>('quotes')
    if (!this.#initialized) {
      this.setItem('quotes', [])
      this.#initialized = true
    } else {
      const quotes = this.getItem<Quote[]>('quotes')
      if (Array.isArray(quotes)) {
        quotes.forEach((item) => {
          this.quotesMap[item.id] = item
        })
      }
    }
  }

  /**Sets quote into the storage. If storage has quote with the same id, no operations will be performed */
  setQuote(quote: Quote) {
    if (this.quotesMap[quote.id]) {
      console.log('Cache Hit')
      return
    }

    const quotes = this.getItem<Quote[]>('quotes')
    if (Array.isArray(quotes)) {
      quotes.push(quote)
      this.setItem<Quote[]>('quotes', quotes)
      this.quotesMap[quote.id] = quote
    }
  }

  /**Gets quote by id */
  getQuote(id: string | number) {
    const quotes = this.getQuotes()
    if (Array.isArray(quotes)) {
      return quotes.find((item) => item.id === id)
    }
  }

  /**Gets random quote */
  getRandom() {
    const quotes = this.getQuotes()
    if (Array.isArray(quotes)) {
      const randomIndex = getRandomInt(0, quotes.length - 1)
      return quotes[randomIndex]
    }
  }

  /**Gets list of quotes */
  getQuotes() {
    return this.getItem<Quote[]>('quotes')
  }

  removeQuote(id: string | number) {
    const quotes = this.getQuotes()
    if (Array.isArray(quotes)) {
      const indx = quotes.findIndex((it) => it.id === id)
      if (indx > -1) {
        delete quotes[indx]
        this.setItem('quotes', quotes)
        return true
      }
    }
    return false
  }

  updateQuote(quote: Quote) {
    const quotes = this.getQuotes()
    if (Array.isArray(quotes)) {
      for (let i = 0; i < quotes.length; i++) {
        if (quote.id === quotes[i].id) {
          quotes[i] = quote
          this.setItem('quotes', quotes)
          return quote
        }
      }
    }
  }

  updateRating(id: string | number, value: number) {
    const quote = this.getQuote(id)
    if (quote) {
      return this.updateQuote({ ...quote, rating: value })
    }
  }

  updateLike(id: string | number, value: boolean) {
    const quote = this.getQuote(id)
    if (quote) {
      return this.updateQuote({ ...quote, isFavorite: value })
    }
  }
}

export const quoteStorage = new QuoteStorage()
