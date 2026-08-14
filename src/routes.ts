import { createBrowserRouter } from 'react-router'
import Root from './components/Root'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import WorkDetailPage from './pages/WorkDetailPage'
import ArtisanPage from './pages/ArtisanPage'
import LoginPage from './pages/LoginPage'
import ConsultPage from './pages/ConsultPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'category/:id', Component: CategoryPage },
      { path: 'work/:id', Component: WorkDetailPage },
      { path: 'artisan/:id', Component: ArtisanPage },
      { path: 'consult/:id', Component: ConsultPage },
      { path: 'login', Component: LoginPage },
      { path: 'book', Component: LoginPage },
      { path: 'search', Component: HomePage },
    ],
  },
])
