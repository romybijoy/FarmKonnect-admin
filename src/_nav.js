import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilPeople,
  cilListRich,
  cilListFilter,
  cilDescription,
  cilBalanceScale,
  cilWarning,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  // ================= DASHBOARD =================
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} style={{ color: '#9AB106' }} customClassName="nav-icon" />,
  },

  // ================= USER MANAGEMENT =================
  {
    component: CNavTitle,
    name: 'User Management',
  },

  {
    component: CNavGroup,
    name: 'Users',
    icon: <CIcon icon={cilPeople} style={{ color: '#9AB106' }} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Users',
        to: '/users',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      },
    ],
  },

  // ================= CONTENT MANAGEMENT =================
  {
    component: CNavTitle,
    name: 'Content Management',
  },

  {
    component: CNavGroup,
    name: 'Posts',
    icon: <CIcon icon={cilListRich} style={{ color: '#9AB106' }} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Posts',
        to: '/posts',
        icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      },
    ],
  },

  // ================= MODERATION =================
  {
    component: CNavTitle,
    name: 'Moderation',
  },

  {
    component: CNavGroup,
    name: 'Moderation',
    icon: <CIcon icon={cilListFilter} style={{ color: '#9AB106' }} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Reports',
        to: '/reports',
        icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Appeals',
        to: '/appeals',
        icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
      },
    ],
  },
]

export default _nav
