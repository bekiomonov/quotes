import { QuoteContent } from '@components/ui'

export default async function Home() {
  return (
    <main data-testid='main' className='flex items-center justify-center w-full'>
      <QuoteContent />
    </main>
  )
}
