import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appConfig } from '../../config'

const token = localStorage.getItem('token')

const ip = `${appConfig.ip}/api/post`

/**
 * fetchReports thunk:
 * payload: { status = "PENDING", page = 0, size = 20 }
 * returns: { content: [], totalElements, ... } or raw array depending on backend
 */
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async ({ status = 'PENDING', page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${ip}/admin/posts/reports?status=${encodeURIComponent(status)}&page=${page}&size=${size}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        },
      )

      if (!res.ok) {
        const txt = await res.text()
        return rejectWithValue(txt || `Failed to fetch reports (${res.status})`)
      }

      const json = await res.json()
      // Normalize to { items, total, page, size } shape so UI doesn't need to care
      const items = json.content ?? json
      const total = json.totalElements ?? (Array.isArray(items) ? items.length : 0)
      return { items, total, page, size }
    } catch (err) {
      return rejectWithValue(err.message || 'Network error')
    }
  },
)

/**
 * reviewReport thunk:
 * payload: { reportId, action: "REMOVE_POST"|"DISMISS", reason }
 */

export const reviewReport = createAsyncThunk(
  'reports/reviewReport',
  async ({ adminId, reportId, action, reason }, { rejectWithValue }) => {
    console.log(adminId)
    try {
      const url = `${ip}/admin/posts/reports/${reportId}/review`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, adminId, reason }),
      })

      // Auth
      if (res.status === 401 || res.status === 403) {
        return rejectWithValue(`Unauthorized (${res.status}). Check admin token.`)
      }

      // Non-OK handling: try to extract json or text for helpful message
      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        const body = ct.includes('application/json')
          ? await res.json().catch(() => null)
          : await res.text().catch(() => null)
        const message =
          (body && (body.message || (typeof body === 'string' ? body : JSON.stringify(body)))) ||
          `Failed to review report (${res.status})`
        return rejectWithValue(message)
      }

      // Success: parse JSON if present (your controller returns JSON)
      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : null

      // Return meaningful payload for reducer
      return { reportId, action, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Network error')
    }
  },
)

export const fetchReportsbyDate = createAsyncThunk(
  'reports/fetchReportsbyDate',
  async ({ startDate, endDate, filter, page = 0, size = 50 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (filter) params.append('filter', filter)
      if (startDate) {
        // convert Date to ISO string (start of day)
        const fromIso = new Date(startDate).toISOString()
        params.append('from', fromIso)
      }
      if (endDate) {
        // set end of day -> 23:59:59.999 to include whole day
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        params.append('to', d.toISOString())
      }
      params.append('page', page)
      params.append('size', size)

      const res = await fetch(`${ip}/admin/posts/dateReports?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to fetch reports')
      }
      const json = await res.json()
      return json // Page<ReportDTO>
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  items: [], // normalized list of reports
  total: 0,
  page: 0,
  size: 20,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  reviewStatus: 'idle',
  reviewError: null,
  data: null,
  loading: false,
}

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // For stomp events: add, remove by id, remove by postId
    addReport(state, action) {
      const normalized = normalizeReport(action.payload)
      // add at top (newest)
      state.items.unshift(normalized)
      state.total = state.total + 1
    },
    removeReportById(state, action) {
      const id = action.payload
      state.items = state.items.filter((r) => r.id !== id)
      state.total = Math.max(0, state.total - 1)
    },
    removeReportsByPostId(state, action) {
      const postId = action.payload
      state.items = state.items.filter((r) => r.postId !== postId)
      // Recalculate total
      state.total = state.items.length
    },
    clearReports(state) {
      state.items = []
      state.total = 0
      state.page = 0
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = (action.payload.items || []).map(normalizeReport)
        state.total = action.payload.total ?? state.items.length
        state.page = action.payload.page ?? state.page
        state.size = action.payload.size ?? state.size
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      .addCase(reviewReport.pending, (state) => {
        state.reviewStatus = 'loading'
        state.reviewError = null
      })
      .addCase(reviewReport.fulfilled, (state, action) => {
        state.reviewStatus = 'succeeded'
        const { reportId } = action.payload
        state.items = state.items.filter((r) => r.id !== reportId)
        state.total = Math.max(0, state.total - 1)
      })
      .addCase(reviewReport.rejected, (state, action) => {
        state.reviewStatus = 'failed'
        state.reviewError = action.payload || action.error.message
      })
      .addCase(fetchReportsbyDate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReportsbyDate.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchReportsbyDate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

function normalizeReport(item) {
  return {
    id: item.id ?? item.reportId,
    postId: item.postId,
    reason: item.reason,
    details: item.details,
    reporterId: item.reporterId,
    createdAt: item.createdAt,
    raw: item,
  }
}

export const { addReport, removeReportById, removeReportsByPostId, clearReports } =
  reportsSlice.actions

export default reportsSlice.reducer
