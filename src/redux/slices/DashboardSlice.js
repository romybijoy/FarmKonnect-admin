import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appConfig } from '../../config'

const token = localStorage.getItem('token')

const ip = `${appConfig.ip}`

export const fetchTopPosts = createAsyncThunk(
  'dashboard/fetchTopPosts',
  async ({ limit }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ip}/api/post/admin/posts/top-posts?limit=${limit}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchRecentUsers = createAsyncThunk(
  'admin/fetchRecentUsers',
  async ({ limit }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ip}/user/admin/recent-users?limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recent users')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

/* =========================
   🔹 Fetch Post Stats
========================= */
export const fetchPostStats = createAsyncThunk(
  "dashboard/fetchPostStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ip}/api/post/admin/posts/post-stats`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch post stats");
      }

      return await response.json();
    } catch (error) {
      console.log(error.message)
      return rejectWithValue(error.message);
    }
  }
);

/* =========================
   🔹 Fetch User Stats
========================= */
export const fetchUserStats = createAsyncThunk(
  "dashboard/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ip}/user/admin/user-stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    topPosts: [],
    recentUsers: [],
    postStats: {
      totalPosts: 0,
      pendingReports: 0,
      pendingAppeals: 0,
    },
    userStats: {
      totalUsers: 0,
      activeToday: 0,
    },
    topLoading: false,
    loadingUsers: false,
    loadingStats: false,
    error: null,

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopPosts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTopPosts.fulfilled, (state, action) => {
        state.loading = false
        state.topPosts = action.payload
      })
      .addCase(fetchTopPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Recent Users
      .addCase(fetchRecentUsers.pending, (state) => {
        state.loadingUsers = true
      })
      .addCase(fetchRecentUsers.fulfilled, (state, action) => {
        state.loadingUsers = false
        state.recentUsers = action.payload
      })
      .addCase(fetchRecentUsers.rejected, (state, action) => {
        state.loadingUsers = false
        state.error = action.payload
      })
       // Post Stats
      .addCase(fetchPostStats.pending, (state) => {
        state.loadingStats = true;
      })
      .addCase(fetchPostStats.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.postStats = action.payload;
      })
      .addCase(fetchPostStats.rejected, (state, action) => {
        state.loadingStats = false;
        state.error = action.payload;
      })

      // User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loadingStats = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loadingStats = false;
        state.error = action.payload;
      });
  },
})

export default dashboardSlice.reducer
