import { Outlet } from 'react-router'
import NavBar from './NavBar'

export default function Root() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi)' }}>
      <NavBar />
      <Outlet />
    </div>
  )
}
