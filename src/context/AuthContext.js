import { useContext, createContext, useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  FacebookAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { useSelector } from 'react-redux'

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const dbUser = useSelector((state) => state.auth.userInfo)

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
    setUser(result.user)
    //  signInWithRedirect(auth, provider)
  }

  const facebookSignIn = () => {
    const provider = new FacebookAuthProvider()
    signInWithPopup(auth, provider)
    setUser(result.user)
    //  signInWithRedirect(auth, provider)
  }

  // const dbUserSignIn = () => {
  //   setDbUser(null);
  // };

  const logOut = () => {
    signOut(auth)
  }

  useEffect(() => {
    if (dbUser != null) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setLoading(false)

        console.log('User', currentUser)
      })
      return () => {
        unsubscribe()
      }
    }
  }, [onAuthStateChanged])

  return (
    <AuthContext.Provider
      value={{
        googleSignIn,
        logOut,
        user,
        // dbUserSignIn,
        dbUser,
        facebookSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const UserAuth = () => {
  return useContext(AuthContext)
}
