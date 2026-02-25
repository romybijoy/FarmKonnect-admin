import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Users = React.lazy(() => import('./views/users/Users'))
const Posts = React.lazy(() => import('./views/posts/Posts'))
const ReportPost = React.lazy(() => import('./views/reportPost/ReportPost'))
const AppealsPage = React.lazy(() => import('./views/appeals/AppealsPage'))

const routes = [
  { path: '/home', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: Users },
  { path: '/posts', name: 'Posts', element: Posts },
  { path: '/reports', name: 'ReportPosts', element: ReportPost },
  { path: '/appeals', name: 'Appeals', element: AppealsPage },

]

export default routes
