import { createSlice } from '@reduxjs/toolkit'

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    sidebarShow: true,
    sidebarUnfoldable: true,
    theme: 'light',
  },

  reducers: {
    set: (state, action) => {
      state.sidebarShow = action.payload
    },
    setUnFoldable: (state, action) => {
      state.sidebarUnfoldable = action.payload
    },
  },
})

export default sidebarSlice.reducer

export const { set, setUnFoldable } = sidebarSlice.actions
