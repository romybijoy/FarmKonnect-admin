import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appConfig } from '../../config'

const token = localStorage.getItem('token')
const dateConverter = (dateString) => {
  const dateObject = new Date(dateString)

  // Extract parts of the date
  const year = dateObject.getFullYear()
  const month = String(dateObject.getMonth() + 1).padStart(2, '0') // Months are zero-indexed
  const day = String(dateObject.getDate()).padStart(2, '0')
  const hours = String(dateObject.getHours()).padStart(2, '0')
  const minutes = String(dateObject.getMinutes()).padStart(2, '0')
  const seconds = String(dateObject.getSeconds()).padStart(2, '0')

  // Format the date
  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`

  return formattedDate
}

//read action
export const showChartData = createAsyncThunk(
  'showChartData',
  async (data, { rejectWithValue }) => {
    let response
    if (data === 'Month') {
      response = await fetch(`${appConfig.ip}/admin/dashboard/monthly`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } else if (data === 'Date') {
      response = await fetch(`${appConfig.ip}/admin/dashboard/daily`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } else {
      response = await fetch(`${appConfig.ip}/admin/dashboard/yearly`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    try {
      const result = await response.json()
      return result
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

//read action
export const showCounts = createAsyncThunk('showCounts', async (data, { rejectWithValue }) => {
  let response
  response = await fetch(`${appConfig.ip}/admin/dashboard/count`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  try {
    const result = await response.json()
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const showTop10Product = createAsyncThunk(
  'showTop10Product',
  async (data, { rejectWithValue }) => {
    let response
    response = await fetch(`${appConfig.ip}/product/top10`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    try {
      const result = await response.json()
      return result
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const showTop10Category = createAsyncThunk(
  'showTop10Category',
  async (data, { rejectWithValue }) => {
    let response
    response = await fetch(`${appConfig.ip}/category/top10`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    try {
      const result = await response.json()
      return result
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    chartData: [],
    loading: false,
    error: null,
    searchData: [],
    counts: '',
    top10Product: [],
    top10Category: [],
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(showChartData.pending, (state) => {
        state.loading = true
      })
      .addCase(showChartData.fulfilled, (state, action) => {
        state.loading = false
        state.chartData = action.payload
      })
      .addCase(showChartData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(showCounts.pending, (state) => {
        state.loading = true
      })
      .addCase(showCounts.fulfilled, (state, action) => {
        state.loading = false
        state.counts = action.payload
      })
      .addCase(showCounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(showTop10Product.pending, (state) => {
        state.loading = true
      })
      .addCase(showTop10Product.fulfilled, (state, action) => {
        state.loading = false
        state.top10Product = action.payload
      })
      .addCase(showTop10Product.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(showTop10Category.pending, (state) => {
        state.loading = true
      })
      .addCase(showTop10Category.fulfilled, (state, action) => {
        state.loading = false
        state.top10Category = action.payload
      })
      .addCase(showTop10Category.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default salesSlice.reducer
