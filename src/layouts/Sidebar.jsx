import { X, LayoutDashboard, BookOpen, Library, Trophy, CircleHelp, Users, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const menuItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/topics', label: 'Topics', icon: Library },
  { to: '/admin/lessons', label: 'Lessons', icon: BookOpen },
  { to: '/admin/quizzes', label: 'Quizzes', icon: CircleHelp },
  { to: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <>
      <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <p className="font-heading text-lg font-semibold text-slate-900">Menu</p>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent onLogout={handleLogout} onNavigate={onClose} />
      </aside>
    </>
  )
}

function SidebarContent({ onLogout, onNavigate }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-50">Control Center</p>
        <p className="mt-2 font-heading text-xl font-semibold">Learning Admin</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  )
}
