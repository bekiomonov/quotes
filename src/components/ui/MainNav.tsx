'use client'

import { Link } from '@/i18n/navigation'
import { Button, ModeToggle } from '../core'
import { ProfileDropdown } from './ProfileDropdown'

export function MainNav() {
  return (
    <nav className='flex w-full justify-between items-center'>
      <Button asChild variant='ghost'>
        <Link href='/'>Quotes</Link>
      </Button>
      <div className='flex items-center justify-end gap-4'>
        <ModeToggle />
        <ProfileDropdown />
      </div>
    </nav>
  )
}
