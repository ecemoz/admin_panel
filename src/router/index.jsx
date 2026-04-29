import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { AchievementPage } from '../pages/admin/AchievementPage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { LessonCreatePage } from '../pages/admin/LessonCreatePage'
import { LessonEditPage } from '../pages/admin/LessonEditPage'
import { LessonsPage } from '../pages/admin/LessonsPage'
import { LoginPage } from '../pages/admin/LoginPage'
import { QuizEditPage } from '../pages/admin/QuizEditPage'
import { QuizzesPage } from '../pages/admin/QuizzesPage'
import { TopicCreatePage } from '../pages/admin/TopicCreatePage'
import { TopicEditPage } from '../pages/admin/TopicEditPage'
import { TopicsPage } from '../pages/admin/TopicsPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'topics', element: <TopicsPage /> },
          { path: 'topics/create', element: <TopicCreatePage /> },
          { path: 'topics/:id/edit', element: <TopicEditPage /> },
          { path: 'lessons', element: <LessonsPage /> },
          { path: 'lessons/create', element: <LessonCreatePage /> },
          { path: 'lessons/:id/edit', element: <LessonEditPage /> },
          { path: 'quizzes', element: <QuizzesPage /> },
          { path: 'quizzes/:id/edit', element: <QuizEditPage /> },
          { path: 'achievements', element: <AchievementPage /> },
          { path: 'users', element: <UsersPage /> },
        ],
      },
    ],
  },
])
