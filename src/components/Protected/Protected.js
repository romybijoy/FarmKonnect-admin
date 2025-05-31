import React from 'react'
import { Navigate } from 'react-router-dom'
import { UserAuth } from '../../context/AuthContext'

const Protected = ({ children }) => {
  const { dbUser } = UserAuth()
  if (!dbUser) {
    return <Navigate to="/login" />
  }

  return children
}

export default Protected
