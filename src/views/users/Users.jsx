import React, { useEffect, useState, useRef } from 'react'
import {
  blockUser,
  showUser, // Used for default/role-only fetching
  showUsersByKeyword, // Used for keyword + role fetching
  fetchUserById,
} from '../../redux/slices/UserSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Container, Card, Table, Spinner } from 'react-bootstrap'
import Pagination from '../../components/Pagination/Pagination'
import CardHead from '../../components/CardHeader/CardHeader'
import NodataMsg from '../../components/NoDataMsg/NoDataMsg'
import { FaUserSlash } from 'react-icons/fa'
import { FiRefreshCw } from 'react-icons/fi'
import CIcon from '@coreui/icons-react'
import { cilUserUnfollow } from '@coreui/icons'
import * as coreIcons from '@coreui/icons'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
} from '@coreui/react'
import { toast } from 'react-toastify'

const MIN_SEARCH_LENGTH = 4

const Users = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(5)

  // Canonical search state (what the user has typed)
  const [searchData, setSearchData] = useState({ keyword: '', role: '' })

  const [visible, setVisible] = useState(false) // Block user modal
  const [reason, setReason] = useState('')
  const [idToBlock, setIdToBlock] = useState(0)
  const [detailVisible, setDetailVisible] = useState(false)

  const { users, userCount, loading, user } = useSelector((state) => state.app)

  // Debounce ref for keyword search API calls
  const debounceRef = useRef(null)

  // Initial load: get first page
  useEffect(() => {
    dispatch(showUser({ page: 0, pageSize: perPage }))
  }, [dispatch, perPage])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Dispatches a server search based on keyword + role
  const dispatchServerSearch = ({ keyword = '', role = '', pageNum = 0 }) => {
    const trimmed = (keyword || '').trim()
    console.log('[dispatchServerSearch] requested', { trimmed, role, pageNum })

    if (trimmed === '') {
      // No keyword → fetch default (optionally filtered by role, if backend supports it)
      console.log('[dispatchServerSearch] dispatching showUser (empty keyword)')
      dispatch(showUser({ page: pageNum, pageSize: perPage, keyword: '', role }))
    } else if (trimmed.length >= MIN_SEARCH_LENGTH) {
      // Valid keyword → search by keyword + role
      console.log('[dispatchServerSearch] dispatching showUsersByKeyword', trimmed)
      dispatch(showUsersByKeyword({ page: pageNum, pageSize: perPage, keyword: trimmed, role }))
    } else {
      console.log(
        `[dispatchServerSearch] blocked server call: keyword length ${trimmed.length} < ${MIN_SEARCH_LENGTH}`,
      )
    }
  }

  // Unified input change handler for keyword and role
  const handleChange = (e) => {
    const { name, value } = e.target
    const newSearchData = { ...searchData, [name]: value }
    setSearchData(newSearchData)

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    if (name === 'keyword') {
      const trimmedKeyword = (value || '').trim()

      if (trimmedKeyword === '') {
        // Keyword cleared: immediately fetch default (all users or role-only)
        console.log('[handleChange] keyword cleared → fetch default list')
        setPage(0)
        dispatchServerSearch({ keyword: '', role: newSearchData.role, pageNum: 0 })
        return
      }

      if (trimmedKeyword.length < MIN_SEARCH_LENGTH) {
        // For 1–3 characters: DO NOTHING (no filter, no API call)
        console.log(
          `[handleChange] keyword too short (${trimmedKeyword.length}), no search / no filter`,
        )
        return
      }

      // Keyword is long enough (≥ MIN_SEARCH_LENGTH): debounce server search
      console.log(
        `[handleChange] keyword "${trimmedKeyword}" valid (len=${trimmedKeyword.length}), debouncing search`,
      )

      debounceRef.current = setTimeout(() => {
        setPage(0)
        dispatchServerSearch({
          keyword: trimmedKeyword,
          role: newSearchData.role,
          pageNum: 0,
        })
      }, 350)
    }

    if (name === 'role') {
      // Role changes should always trigger a fetch (depending on keyword length)
      const trimmedKeyword = (newSearchData.keyword || '').trim()
      console.log('[handleChange] role changed →', value)
      setPage(0)

      if (trimmedKeyword === '' || trimmedKeyword.length < MIN_SEARCH_LENGTH) {
        // If keyword empty or too short, ignore keyword and fetch by role only (server)
        dispatchServerSearch({ keyword: '', role: value, pageNum: 0 })
      } else {
        // Keyword long enough → use keyword + role
        dispatchServerSearch({
          keyword: trimmedKeyword,
          role: value,
          pageNum: 0,
        })
      }
    }
  }

  const onRefresh = () => {
    // Reset search + role, reset page, cancel debounce, fetch default list
    setSearchData({ keyword: '', role: '' })
    setPage(0)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    dispatch(showUser({ page: 0, pageSize: perPage }))
  }

  const handleViewDetails = async (userId) => {
    dispatch(fetchUserById(userId))
    setDetailVisible(true)
  }

  const handlePageClick = (e) => {
    const selectedPage = e.selected
    setPage(selectedPage)

    const trimmedKeyword = (searchData.keyword || '').trim()
    if (trimmedKeyword === '') {
      // No keyword: paginate default list with optional role filter
      dispatch(showUser({ page: selectedPage, pageSize: perPage, role: searchData.role }))
    } else if (trimmedKeyword.length >= MIN_SEARCH_LENGTH) {
      // Keyword long enough: paginate keyword search
      dispatch(
        showUsersByKeyword({
          page: selectedPage,
          pageSize: perPage,
          keyword: trimmedKeyword,
          role: searchData.role,
        }),
      )
    } else {
      // Keyword present but too short – fall back to default list for pagination
      console.warn(
        'Pagination attempted with short keyword. Fetching default users based on role instead.',
      )
      dispatch(showUser({ page: selectedPage, pageSize: perPage, role: searchData.role }))
    }
  }

  const handleBlock = () => {
    if (!reason.trim()) {
      toast.error('Please enter a reason.')
      return
    }
    dispatch(blockUser({ block_reason: reason, id: idToBlock }))
    setVisible(false)
    toast.success('User is blocked Successfully')
    dispatch(showUser({ page: 0, pageSize: perPage })) // Refresh data after block
  }

  const submit = (id) => {
    setVisible(true)
    setIdToBlock(id)
  }

  // ---------- UI data derivation (this is where dropdown filter is fixed) ----------

  // Base users from Redux (current page / search result from server)
  const baseUsers = users || []

  // Apply role filter LOCALLY, so dropdown always works
  const filteredByRole =
    searchData.role && searchData.role !== ''
      ? baseUsers.filter((u) => u.role === searchData.role)
      : baseUsers

  const rows = filteredByRole
  const currentPageNumber = page + 1
  const countPagination = Math.ceil((userCount || 0) / perPage)
  const placeholders = Math.max(0, perPage - rows.length) // keep table height stable

  return (
    <>
      <Container>
        <Card>
          <Card.Header className="d-flex align-items-center justify-content-between">
            <div style={{ flex: 1 }}>
              <CardHead
                title="Users List"
                count={userCount}
                placeholder="User Name/ email"
                value={searchData.keyword}
                searchHandler={(e) =>
                  handleChange({ target: { name: 'keyword', value: e.target.value } })
                }
                hasSearch={true}
                hasCmnFltr={true}
                hasRoleFilter={true}
                filtertitle="Select User"
                role={searchData.role}
                onRoleChange={(e) =>
                  handleChange({ target: { name: 'role', value: e.target.value } })
                }
              />
            </div>

            {/* Right side: spinner + refresh */}
            <div
              style={{
                width: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {/* spinner kept in DOM with visibility toggle so it doesn't shift layout */}
              <div
                style={{
                  minWidth: 24,
                  minHeight: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{ visibility: loading ? 'visible' : 'hidden' }}
                />
              </div>

              <Button
                variant="success"
                onClick={onRefresh}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiRefreshCw size={22} />
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            {/* Table wrapper with min height to avoid jumping */}
            <div style={{ minHeight: 240 }}>
              <div style={{ overflowY: 'auto', maxHeight: 520 }}>
                <Table className="mt-4" striped bordered hover size="sm" responsive>
                  <thead>
                    <tr>
                      <th>S. No.</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows && rows.length > 0 ? (
                      rows.map((u, i) => (
                        <tr key={u.id}>
                          <td>{perPage * (currentPageNumber - 1) + i + 1}</td>
                          <td>{u?.name}</td>
                          <td>{u?.email}</td>
                          <td>{u?.role === 'ADMIN' ? 'Admin' : 'User'}</td>
                          <td>
                            <CIcon
                              icon={coreIcons.cilNotes}
                              size="xl"
                              role="button"
                              onClick={() => handleViewDetails(u.id)}
                              title="View Details"
                              style={{ cursor: 'pointer', color: '#0dcaf0' }}
                            />
                            <CIcon
                              icon={cilUserUnfollow}
                              size="xl"
                              onClick={() => submit(u?.id)}
                              title="Block User"
                              style={{ cursor: 'pointer', color: 'red' }}
                              className="ms-2"
                            />
                          </td>
                        </tr>
                      ))
                    ) : loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <Spinner animation="border" size="sm" /> Loading...
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          <NodataMsg />
                        </td>
                      </tr>
                    )}

                    {/* Invisible placeholder rows for stable height */}
                    {Array.from({ length: placeholders }).map((_, idx) => (
                      <tr key={`ph-${idx}`} style={{ visibility: 'hidden' }}>
                        <td>&nbsp;</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <Pagination
              page={page}
              handlePageClick={handlePageClick}
              countPagination={countPagination}
            />
          </Card.Body>
        </Card>
      </Container>

      {/* View User Details Modal */}
      <CModal alignment="center" visible={detailVisible} onClose={() => setDetailVisible(false)}>
        <CModalHeader>
          <CModalTitle>User Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {user ? (
            <div>
              <p>
                <strong>Name:</strong> {user.name?.trim()}
              </p>
              <p>
                <strong>Email:</strong> {user.email?.trim()}
              </p>
              <p>
                <strong>Mobile:</strong> {user.mobile_number}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>About:</strong> {user.about?.trim() || 'N/A'}
              </p>
              {user.image && (
                <img src={user.image} alt="User" width="150px" className="mt-2 rounded" />
              )}
            </div>
          ) : (
            <p>Loading user details...</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDetailVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Block User Modal */}
      <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader className="bg-danger text-white">
          <CModalTitle>
            <FaUserSlash className="me-2" /> Block User
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="py-4">
          <label className="form-label fw-semibold">Reason for blocking</label>
          <CFormInput
            placeholder="Enter reason..."
            value={reason}
            onChange={({ target }) => setReason(target.value)}
            className="mb-3 shadow-sm"
          />
          <p className="text-muted small">
            The user will be notified and restricted based on your reason.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleBlock}>
            Confirm Block
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Users
