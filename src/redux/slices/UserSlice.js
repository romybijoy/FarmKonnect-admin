import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appConfig } from '../../config'

const token = localStorage.getItem('token')

const ip = `${appConfig.ip}/user`

const MIN_SEARCH_LENGTH = 4

//create action
export const createUser = createAsyncThunk('createUser', async (data, { rejectWithValue }) => {
  console.log('data', data)
  const response = await fetch(`${ip}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  try {
    const result = await response.json()
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const refreshToken = createAsyncThunk('refreshToken', async (data, { rejectWithValue }) => {
  console.log('data', data)
  const response = await fetch(`${ip}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(token),
  })

  try {
    const result = await response.json()
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})
//read action
export const showUser = createAsyncThunk('showUser', async (data, { rejectWithValue }) => {
  try {
    console.log('showUser page:', data.page)
    const response = await fetch(`${ip}/get-all-users?pageNumber=${data.page}&pageSize=5`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const result = await response.json()
    console.log(result)
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const showUsersByKeyword = createAsyncThunk(
  'showUsersByKeyword',
  async (data, { rejectWithValue }) => {
    console.log(data)
    try {
      const keyword = (data.keyword || '').trim()
      console.log('showUsersByKeyword requested keyword:', keyword, 'page:', data.page)

      // SHORT-CIRCUIT: if keyword is present but too short, DO NOT call network
      if (keyword.length > 0 && keyword.length < MIN_SEARCH_LENGTH) {
        console.log(
          `[showUsersByKeyword] blocked network call - keyword length ${keyword.length} < ${MIN_SEARCH_LENGTH}`,
        )
        // Return an empty/neutral payload that your reducer can handle.
        // **Adjust returned shape if your reducer expects other keys.**
        return {
          users: [], // <-- replace key if your reducer expects different shape
          userCount: 0,
        }
      }

      // If keyword is empty, you might want to call the regular endpoint, or
      // you could let callers call showUser instead. We'll still proceed to call the keyword endpoint
      // only when keyword length >= MIN_SEARCH_LENGTH.
      const response = await fetch(
        `${ip}/get-all-users/keyword/${encodeURIComponent(keyword)}?pageNumber=${data.page}&pageSize=5`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const result = await response.json()
      console.log(result)
      return result
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

//block action
export const blockUser = createAsyncThunk(
  'blockUser',
  async (data, { rejectWithValue, dispatch }) => {
    const response = await fetch(`${ip}/block/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ block_reason: data.block_reason }),
    })

    try {
      const result = await response.json()
      console.log(result)
      dispatch(showUser({ page: 0, pageSize: 5 }))
      return result
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

//update action
export const updateUser = createAsyncThunk('updateUser', async (data, { rejectWithValue }) => {
  console.log('updated data', data)
  const response = await fetch(`${ip}/update/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  try {
    const result = await response.json()
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

//update action
export const fetchUserById = createAsyncThunk('fetchUserById', async (id, { rejectWithValue }) => {
  const response = await fetch(`${ip}/get-users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  try {
    const result = await response.json()
    console.log(result)
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const userDetail = createSlice({
  name: 'app',
  initialState: {
    users: [],
    user: null,
    loading: false,
    error: null,
    searchData: [],
    userCount: 0,
    token: localStorage.getItem('token'),
  },

  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
      localStorage.setItem('token', action.payload)
    },
    logout: (state) => {
      state.accessToken = null
      localStorage.removeItem('token')
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
      .addCase(showUser.pending, (state) => {
        state.loading = true
      })
      .addCase(showUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.content
        if (action.payload.code === 404) {
          state.users = []
        }
        state.userCount = action.payload.totalElements
      })
      .addCase(showUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(showUsersByKeyword.pending, (state) => {
        state.loading = true
      })
      .addCase(showUsersByKeyword.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.content
        state.userCount = action.payload.totalElements
      })
      .addCase(showUsersByKeyword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(blockUser.pending, (state) => {
        state.loading = true
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.map((ele) => (ele.id == action.payload.id ? action.payload : ele))
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.refreshToken
        localStorage.setItem('token', action.payload.refreshToken)
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload // Optionally handle forced logout here if refresh fails
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.ourUsers
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
  },
})

export default userDetail.reducer

export const { setAccessToken, logout } = userDetail.actions
