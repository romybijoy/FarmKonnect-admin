import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appConfig } from '../../config'

const token = localStorage.getItem('token')

const ip = `${appConfig.ip}/api/post`

/* ================= FETCH PENDING ================= */
export const fetchAppeals = createAsyncThunk(
  'adminAppeals/fetchPending',
  async ({status}, { rejectWithValue }) => {
    try {
      const res = await fetch(`${ip}/admin/posts/appeals?status=${status}&size=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      })

      if (!res.ok) throw new Error('Failed to fetch appeals')

      return await res.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

/* ================= APPROVE ================= */
export const approveAppeal = createAsyncThunk(
  'adminAppeals/approve',
  async ({ appealId, adminId }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${ip}/admin/posts/appeals/${appealId}/review?adminId=${adminId}&action=approve`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ adminId }),
        },
      )

      if (!res.ok) throw new Error('Failed to approve')

      return appealId
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

/* ================= REJECT ================= */
export const rejectAppeal = createAsyncThunk(
  'adminAppeals/reject',
  async ({ appealId, adminId }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${ip}/admin/posts/appeals/${appealId}/review?adminId=${adminId}&action=reject`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ adminId }),
        },
      )

      if (!res.ok) throw new Error('Failed to reject')

      return appealId
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const AppealSlice = createSlice({
  name: 'appeals',
  initialState: {
    items: [],
    appealLoading: false,
    error: null,
  },
  reducers: {
    appealRealtime: (state, action) => {
      state.items.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppeals.pending, (state) => {
        state.appealLoading = true
      })
      .addCase(fetchAppeals.fulfilled, (state, action) => {
        state.appealLoading = false
        state.items = action.payload.content
      })
      .addCase(fetchAppeals.rejected, (state, action) => {
        state.appealLoading = false
        state.error = action.payload
      })
      .addCase(approveAppeal.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload)
      })
      .addCase(rejectAppeal.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload)
      })
  },
})

export const { appealRealtime } = AppealSlice.actions
export default AppealSlice.reducer
