import { Link } from '@/i18n/navigation'
import {
  Avatar,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@components/core'
import { useAuth } from '@context'

export function ProfileDropdown() {
  const authInfo = useAuth()
  const initials =
    authInfo?.name
      ?.split('')
      ?.map((str) => str[0].toUpperCase())
      ?.join('') || ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' asChild>
          <Avatar>
            <AvatarImage alt={authInfo?.name || ''} />
            {/* {initials ? <AvatarFallback>{initials}</AvatarFallback> : null} */}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='start'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/favorites'>Favorites</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
