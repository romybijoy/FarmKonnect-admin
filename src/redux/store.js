import { configureStore } from '@reduxjs/toolkit'
import UserSlice from './slices/UserSlice'
import AuthSlice from './slices/AuthSlice'
import { ApiSlice } from './slices/ApiSlice'
import SidebarSlice from './slices/SidebarSlice'
import DashboardSlice from './slices/DashboardSlice'
import PostSlice from './slices/PostSlice'
import ReportsSlice from './slices/ReportsSlice'

const store = configureStore({
  reducer: {
    [ApiSlice.reducerPath]: ApiSlice.reducer,
    app: UserSlice,
    auth: AuthSlice,
    sidebar: SidebarSlice,
    dashboard: DashboardSlice,
    post: PostSlice,
    reports: ReportsSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  devTools: true,
})

export default store
