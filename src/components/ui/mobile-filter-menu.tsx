import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Calendar, Gamepad } from 'lucide-react'

const FilterMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleViewTransitionStart = () => {
      setIsOpen(false)
    }

    document.addEventListener('astro:before-swap', handleViewTransitionStart)

    return () => {
      document.removeEventListener(
        'astro:before-swap',
        handleViewTransitionStart,
      )
    }
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          title="Menu"
        >
          <Search size={16} />
          <span className="sr-only">Search filtering</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        <DropdownMenuItem asChild>
          <a
            href="/collection"
            className="w-full text-lg font-medium capitalize"
            onClick={() => setIsOpen(false)}
          >
            <Calendar size={16} className='mr-2' />
            Find By Month
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="/games"
            className="w-full text-lg font-medium capitalize"
            onClick={() => setIsOpen(false)}
          >
            <Gamepad size={16} className='mr-2' />
            Find By Game
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FilterMenu
