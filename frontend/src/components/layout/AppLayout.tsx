import { NavLink, Outlet } from 'react-router';

const MENU = [
  { to: '/players', label: 'Jogadores' },
  { to: '/clubs', label: 'Clubes' },
  { to: '/matches', label: 'Partidas' },
  { to: '/standings', label: 'Classificação' },
];

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="bg-emerald-800 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <span className="text-lg font-bold tracking-wide">Passe</span>
          <nav aria-label="Menu principal" className="flex flex-wrap gap-1">
            {MENU.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-white/20' : 'hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
