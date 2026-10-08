import { lazy } from 'react'
import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { GuestRoute, ProtectedRoute } from './guards'


const Landing = lazy(() => import('../pages/public/Landing'))
const Jobs = lazy(() => import('../pages/public/Jobs'))
const JobDetails = lazy(() => import('../pages/public/JobDetails'))
const Login = lazy(() => import('../pages/public/Login'))
const Register = lazy(() => import('../pages/public/Register'))
const NotFound = lazy(() => import('../pages/public/NotFound'))

const Dashboard = lazy(() => import('../pages/candidate/Dashboard'))
const Applications = lazy(() => import('../pages/candidate/Applications'))
const ApplicationDetails = lazy(() => import('../pages/candidate/ApplicationDetails'))
const CvAnalyzer = lazy(() => import('../pages/candidate/CvAnalyzer'))
const Interviews = lazy(() => import('../pages/candidate/Interviews'))
const NewInterview = lazy(() => import('../pages/candidate/NewInterview'))
const InterviewSession = lazy(() => import('../pages/candidate/InterviewSession'))
const Profile = lazy(() => import('../pages/shared/Profile'))

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const Companies = lazy(() => import('../pages/admin/Companies'))
const AdminJobs = lazy(() => import('../pages/admin/AdminJobs'))
const Skills = lazy(() => import('../pages/admin/Skills'))
const AdminUsers = lazy(() => import('../pages/admin/Users'))

function Root() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Landing /> },
          { path: '/jobs', element: <Jobs /> },
          { path: '/jobs/:jobId', element: <JobDetails /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <Login /> },
              { path: '/register', element: <Register /> },
            ],
          },
        ],
      },
      {
        path: '/app',
        element: <ProtectedRoute role="candidate" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'applications', element: <Applications /> },
              { path: 'applications/:applicationId', element: <ApplicationDetails /> },
              { path: 'profile', element: <Profile /> },
            ],
          },
        ],
      },
      {
        path: '/dashboard',
        element: <ProtectedRoute role="candidate" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <Navigate to="/app" replace /> },
              { path: 'cv', element: <CvAnalyzer /> },
              { path: 'interviews', element: <Interviews /> },
              { path: 'interviews/new', element: <NewInterview /> },
              { path: 'interviews/:interviewId', element: <InterviewSession /> },
            ],
          },
        ],
      },
      {
        path: '/admin',
        element: <ProtectedRoute role="admin" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'companies', element: <Companies /> },
              { path: 'jobs', element: <AdminJobs /> },
              { path: 'skills', element: <Skills /> },
              { path: 'users', element: <AdminUsers /> },
              { path: 'profile', element: <Profile /> },
            ],
          },
        ],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL })
