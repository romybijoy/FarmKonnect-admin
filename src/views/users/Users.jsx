import React, { useEffect, useState } from 'react'
import {
  blockUser,
  showUser,
  showUsersByKeyword,
  fetchUserById,
} from '../../redux/slices/UserSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Container, Form, Card, Table } from 'react-bootstrap'
import Pagination from '../../components/Pagination/Pagination'
import CardHead from '../../components/CardHeader/CardHeader'
import NodataMsg from '../../components/NoDataMsg/NoDataMsg'
import { FaUserSlash } from 'react-icons/fa'

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

const Users = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchData, setSearchData] = useState('')

  const [visible, setVisible] = useState(false)
  const [reason, setReason] = useState('')
  const [id, setId] = useState(0)
  const [detailVisible, setDetailVisible] = useState(false)
  const { users, userCount, loading, user } = useSelector((state) => state.app)

  useEffect(() => {
    dispatch(showUser({ page: 0 }))
  }, [])

  if (loading) {
    return <h2>Loading</h2>
  }

  const handlehandleChange = (e) => {
    const { name, value } = e.target

    setSearchData({ ...searchData, [name]: value })
  }

  const deleteUserData = async (userId) => {
    try {
      // Prompt for confirmation before deleting the user
      const confirmDelete = window.confirm('Are you sure you want to delete this user?')

      if (confirmDelete) {
        dispatch(deleteUser(userId))
        // After deleting the user, fetch the updated list of users
        navigate('/home')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleViewDetails = async (userId) => {
    dispatch(fetchUserById(userId))
    setDetailVisible(true)
  }

  function handlePageClick(e) {
    const selectedPage = e.selected
    console.log(selectedPage)
    dispatch(showUser({ page: selectedPage }))
    setPage(selectedPage)
  }

  const handleSearch = (e) => {
    let searchVal = e.target.value
    console.log(searchVal)
    setSearchData(searchVal)
    if (searchVal !== '') {
      dispatch(showUsersByKeyword({ page: 0, keyword: searchVal }))
    } else {
      dispatch(showUser({ page: 0, pageSize: 5 }))
    }
  }

  const onRefresh = async (e) => {
    setSearchData({
      keyword: '',
      role: '',
    })
    dispatch(showUser(searchData))
  }

  const handleBlock = () => {
    dispatch(blockUser({ block_reason: reason, id: id }))
    setVisible(false)
    toast.success('User is blocked Successfully')
    dispatch(showUser({ page: 0, pageSize: 5 }))
  }

  const submit = (id) => {
    setVisible(!visible)
    setId(id)
  }

  let p = page + 1
  let countPagination = Math.ceil(userCount / 5)

  return (
    <>
      <Container>
        <Card>
          <Card.Header>
            <CardHead
              title="Users List"
              count={userCount}
              placeholder="User Name/ email"
              value={searchData}
              searchHandler={handleSearch}
              hasSearch={true}
              hasCmnFltr={true}
              hasFilter={true}
              // filterData={props.parentCategry}
              // filterHandler={filterHandler}
              // filter={filter}
              filtertitle="Select User"
            />
          </Card.Header>
          {/* <Form onSubmit={handleSearch}>
          <Form.Control
            className="mt-3"
            type="text"
            name="keyword"
            placeholder="Enter search"
            // value={}
            onChange={handlehandleChange}
            style={{ width: '20%' }}
          ></Form.Control>

          <Form.Select
            className="mt-3"
            aria-label="Role"
            name="role"
            value={searchData.role}
            onChange={handlehandleChange}
            style={{ width: '20%' }}
          >
            <option value="">Role..</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </Form.Select>
          <Button
            type="submit"
            variant="primary"
            className="mt-3"
            style={{
              marginRight: '20px',
            }}
          >
            Search
          </Button>
          <Button type="submit" onClick={onRefresh} variant="primary" className="mt-3">
            Refresh
          </Button>
        </Form> */}
          <Card.Body>
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
                {loading ? (
                  <h2>Loading</h2>
                ) : (
                  users &&
                  users?.length !== 0 &&
                  users.map((user, i) => (
                    <tr key={i}>
                      <td>{5 * (p - 1) + i + 1}</td>
                      <td>{user?.name}</td>
                      <td>{user?.email}</td>
                      <td>{user?.role === 'ADMIN' ? 'Admin' : 'User'}</td>
                      <td>
                        <CIcon
                          icon={coreIcons.cilNotes}
                          size="xl"
                          role="button"
                          onClick={() => handleViewDetails(user.id)}
                          title="View Details"
                          style={{ cursor: 'pointer', color: '#0dcaf0' }} 
                        />
                        <CIcon icon={cilUserUnfollow} size="xl" onClick={() => submit(user?.id)} title="Block User"
                          style={{ cursor: 'pointer', color: 'red' }} className="ms-2"/>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            {users && users?.length === 0 && <NodataMsg />}
          </Card.Body>
          <Pagination
            page={page}
            handlePageClick={handlePageClick}
            countPagination={countPagination}
          />
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
              {user.image && <img src={user.image} alt="User" width="150px" className="mt-2 rounded" />}
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

      <CModal
        alignment="center"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="VerticallyCenteredExample"
      >
        <CModalHeader className="bg-danger text-white">
          <CModalTitle id="VerticallyCenteredExample">
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
