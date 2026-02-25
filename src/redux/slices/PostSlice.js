import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { appConfig } from '../../config'

const token = localStorage.getItem('token')

const ip = `${appConfig.ip}/api/post`

//read action
export const showPosts = createAsyncThunk(
  'showPosts',
  async ({ page, pageSize }, { rejectWithValue }) => {
    let response
    response = await fetch(`${ip}/admin/posts?pageNumber=${page}&pageSize=${pageSize}`, {
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

// export const showPostssByKeyword = createAsyncThunk(
//   'showPostssByKeyword',
//   async (data, { rejectWithValue }) => {
//     console.log(data.page)
//     let response
//     response = await fetch(
//       `${ip}/get-all-posts/keyword/${data.keyword}?pageNumber=${data.page}&pageSize=5`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     )

//     try {
//       const result = await response.json()
//       console.log(result)
//       return result
//     } catch (error) {
//       return rejectWithValue(error)
//     }
//   },
// )

export const fetchPostsById = createAsyncThunk(
  'fetchPostsById',
  async (id, { rejectWithValue }) => {
    const response = await fetch(`${ip}/admin/posts/${id}`, {
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
  },
)

export const postDetail = createSlice({
  name: 'post',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    searchData: [],
    count: 0,
    selectedPost: null,
    selectedPostLoading: false,
    selectedPostError: null,
  },

  reducers: {
    clearSelectedPost: (state) => {
    state.selectedPost = null
    state.selectedPostError = null
    state.selectedPostLoading = false
  },
  },

  extraReducers: (builder) => {
    builder
      .addCase(showPosts.pending, (state) => {
        state.loading = true
      })
      .addCase(showPosts.fulfilled, (state, action) => {
        state.loading = false
        state.posts = action.payload.content
        if (action.payload.code === 404) {
          state.posts = []
        }
        state.count = action.payload.totalElements
      })
      .addCase(showPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // ===== FETCH POST BY ID =====
      .addCase(fetchPostsById.pending, (state) => {
        state.selectedPostLoading = true
        state.selectedPostError = null
      })

      .addCase(fetchPostsById.fulfilled, (state, action) => {
        state.selectedPostLoading = false
        state.selectedPost = action.payload
      })

      .addCase(fetchPostsById.rejected, (state, action) => {
        state.selectedPostLoading = false
        state.selectedPostError = action.payload || 'Failed to fetch post'
      })
    // .addCase(showPostssByKeyword.pending, (state) => {
    //   state.loading = true
    // })
    // .addCase(showPostssByKeyword.fulfilled, (state, action) => {
    //   state.loading = false
    //   state.posts = action.payload.content
    //   state.count = action.payload.totalElements
    // })
    // .addCase(showPostssByKeyword.rejected, (state, action) => {
    //   state.loading = false
    //   state.error = action.payload
    // })
  },
})

export default postDetail.reducer

export const { clearSelectedPost } = postDetail.actions
