'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Video,
  Users,
  Film,
  Tv,
  Star,
  MessageSquare,
  Settings,
  BarChart3,
  Layers,
  Upload,
  FileText,
  Calendar,
  Briefcase,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Videos',
    href: '/videos',
    icon: Video,
    children: [
      { name: 'All Videos', href: '/videos' },
      { name: 'Movies', href: '/videos?type=MOVIE' },
      { name: 'Series', href: '/videos?type=SERIES' },
    ],
  },
  {
    name: 'Seasons & Episodes',
    href: '/seasons',
    icon: Tv,
  },
  {
    name: 'Genres',
    href: '/genres',
    icon: Layers,
  },
  {
    name: 'Cast Members',
    href: '/casts',
    icon: Users,
  },
  {
    name: 'Ratings',
    href: '/ratings',
    icon: Star,
  },
  {
    name: 'Comments',
    href: '/comments',
    icon: MessageSquare,
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
  },
  {
    name: 'Storage',
    href: '/storage',
    icon: Upload,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Audit Logs',
    href: '/audit-logs',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Film className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">ChauPhim</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? 'bg-gray-50 text-indigo-600'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={cn(
                          pathname === item.href
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-indigo-600',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
