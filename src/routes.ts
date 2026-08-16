import { createBrowserRouter, redirect } from 'react-router'
import Root from './components/Root'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import CategoriesPage from './pages/CategoriesPage'
import WorkDetailPage from './pages/WorkDetailPage'
import ArtisanPage from './pages/ArtisanPage'
import ArtisansPage from './pages/ArtisansPage'
import LoginPage from './pages/LoginPage'
import ConsultPage from './pages/ConsultPage'
import BookPage from './pages/BookPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProfilePage from './pages/ProfilePage'
import ArtisanStudioPage from './pages/ArtisanStudioPage'
import FeaturePage from './pages/FeaturePage'
import TimelineTheaterPage from './pages/TimelineTheaterPage'
import DailyTreasurePage from './pages/DailyTreasurePage'
import DailyCheckInPage from './pages/DailyCheckInPage'

export const router = createBrowserRouter([
  { path: '/', loader: () => redirect('/login') },
  { path: '/login', Component: LoginPage },

  {
    Component: Root,
    children: [
      { path: 'home', Component: HomePage },
      { path: 'category/:id', Component: CategoryPage },
      { path: 'categories', Component: CategoriesPage },
      { path: 'work/:id', Component: WorkDetailPage },
      { path: 'artisan/:id', Component: ArtisanPage },
      { path: 'artisans', Component: ArtisansPage },
      { path: 'consult/:id', Component: ConsultPage },
      { path: 'book', Component: BookPage },
      { path: 'book/:id', Component: BookPage },
      { path: 'bookings', Component: MyBookingsPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'artisan-studio', Component: ArtisanStudioPage },
      { path: 'timeline-theater', Component: TimelineTheaterPage },
      { path: 'daily-treasure', Component: DailyTreasurePage },
      { path: 'daily-check-in', Component: DailyCheckInPage },
      { path: 'search', Component: HomePage },
    ],
  },
], { basename: import.meta.env.BASE_URL })