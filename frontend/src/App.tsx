import { NavLink, Route, Routes } from 'react-router-dom'

import { AnalyticsView } from './views/AnalyticsView'
import { BattingStatsView } from './views/BattingStatsView'
import { BowlingStatsView } from './views/BowlingStatsView'
import { ContractsView } from './views/ContractsView'
import { MatchesView } from './views/MatchesView'
import { PlayersView } from './views/PlayersView'
import { SeasonsView } from './views/SeasonsView'
import { TeamsView } from './views/TeamsView'
import { VenuesView } from './views/VenuesView'

function App() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-full px-4 py-2 text-sm font-semibold transition',
      isActive
        ? 'bg-amber-400 text-slate-950'
        : 'text-slate-200 hover:bg-white/10 hover:text-white',
    ].join(' ')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
            Cricket Analytics Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">League Intelligence Hub</h1>
          <nav className="mt-4 flex flex-wrap gap-2">
            <NavLink to="/players" className={navLinkClass}>
              Players
            </NavLink>
            <NavLink to="/matches" className={navLinkClass}>
              Matches
            </NavLink>
            <NavLink to="/contracts" className={navLinkClass}>
              Contracts
            </NavLink>
            <NavLink to="/teams" className={navLinkClass}>
              Teams
            </NavLink>
            <NavLink to="/seasons" className={navLinkClass}>
              Seasons
            </NavLink>
            <NavLink to="/venues" className={navLinkClass}>
              Venues
            </NavLink>
            <NavLink to="/batting-stats" className={navLinkClass}>
              Batting Stats
            </NavLink>
            <NavLink to="/bowling-stats" className={navLinkClass}>
              Bowling Stats
            </NavLink>
            <NavLink to="/analytics" className={navLinkClass}>
              Analytics
            </NavLink>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<PlayersView />} />
            <Route path="/players" element={<PlayersView />} />
            <Route path="/matches" element={<MatchesView />} />
            <Route path="/contracts" element={<ContractsView />} />
            <Route path="/teams" element={<TeamsView />} />
            <Route path="/seasons" element={<SeasonsView />} />
            <Route path="/venues" element={<VenuesView />} />
            <Route path="/batting-stats" element={<BattingStatsView />} />
            <Route path="/bowling-stats" element={<BowlingStatsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
