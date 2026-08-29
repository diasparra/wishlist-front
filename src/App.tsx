import { Fragment } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './contexts/SessionContext'
import DemoBanner from './ui/DemoBanner.tsx'
import GateScreen from './ui/GateScreen.tsx'
import MemberPicker from './ui/MemberPicker.tsx'
import OverviewPage from './ui/OverviewPage.tsx'
import MemberListPage from './ui/MemberListPage.tsx'

function Screen() {
  const { unlocked, memberId } = useSession()

  if (!unlocked) {
    return <GateScreen />
  }

  if (!memberId) {
    return <MemberPicker />
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/list/:memberId" element={<MemberListPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default function App() {
  return (
    <Fragment>
      <DemoBanner />
      <Screen />
    </Fragment>
  )
}
