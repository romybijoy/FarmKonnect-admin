import store from './store'
import { refreshToken, setAccessToken, logout } from './slices/UserSlice'

const fetchWrapper = async (url, options = {}) => {
  const state = store.getState()
  const token = state.app.token

  console.log(token)
  const headers = { ...options.headers, 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const fetchOptions = { ...options, headers }
  let response = await fetch(url, fetchOptions)

  console.log(response.json())
  if (response.status === 500 && !options._retry) {
    options._retry = true
    try {
      const refreshResponse = await store.dispatch(refreshToken()).unwrap()
      store.dispatch(setAccessToken(refreshResponse.token))
      headers['Authorization'] = `Bearer ${refreshResponse.token}`
      fetchOptions.headers = headers
      response = await fetch(url, fetchOptions)
    } catch (refreshError) {
      store.dispatch(logout())
      throw refreshError
    }
  }
  if (!response.ok) {
    throw new Error(response.statusText)
  }

  console.log(response)
  return response.json()
}
export default fetchWrapper
