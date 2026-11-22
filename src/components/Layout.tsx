import type { MouseEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, LayoutGrid, Moon, Settings, Sun, Users } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/plots', label: 'Plots', icon: LayoutGrid },
  { to: '/family', label: 'Family', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function setGlowPosition(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

export function Layout() {
  const { theme, toggleTheme, isDark } = useTheme();


  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-100 dark:bg-gray-800 p-2">
      <header className="border-[color:var(--glass-border)] backdrop-blur-2xl">
        <nav className="border items-center gap-2 rounded-full p-1.5 flex shadow-sm w-fit mx-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to + label} to={to} end={end}>
              {({ isActive }) => (
                <span
                  onMouseMove={setGlowPosition}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm rounded-full',
                    isActive ? 'text-blue-600 dark:text-white bg-transparent ring-2 ring-blue-600/25 transition-all duration-200 ease-in-out' : 
                    'text-muted-foreground hover:text-black dark:hover:text-white hover:bg-transparent hover:ring-2 hover:ring-gray-600/25 transition-all duration-200 ease-in-out'
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden lg:inline">{label}</span>
                </span>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Theme: ${theme}`}
            onClick={toggleTheme}
            className="theme-toggle ml-1 cursor-pointer"
          >
            <span className="theme-toggle-thumb">
              {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
            </span>
            <span className="flex w-full items-center justify-between px-1.5 text-[10px] font-bold tracking-wide text-muted-foreground">
              <Sun className="size-3.5 opacity-70" />
              <Moon className="size-3.5 opacity-70" />
            </span>
          </button>
        </nav>
      </header>

      <main className="mx-auto w-full py-4">
        <Outlet />
      </main>
    </div>
  )
}
