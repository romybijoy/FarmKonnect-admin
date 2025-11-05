import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} style={{ color: '#9AB106' }} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Users Management',
  },

  {
    component: CNavGroup,
    name: 'Users',
    icon: <CIcon icon={cilUser} style={{ color: '#9AB106' }} customClassName="nav-icon" />,
    style: { color: '#9AB106' },
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/users',
      },
    ],
  },

  
  {
    component: CNavTitle,
    name: 'Posts Management',
  },

  {
    component: CNavGroup,
    name: 'Posts',
    icon: <CIcon icon={cilUser} style={{ color: '#9AB106' }} customClassName="nav-icon" />,
    style: { color: '#9AB106' },
    items: [
      {
        component: CNavItem,
        name: 'Posts',
        to: '/posts',
      },
    ],
  },
]

export default _nav
