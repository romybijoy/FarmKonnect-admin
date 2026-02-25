import React, { useEffect, useState } from 'react'
import { showPosts } from '../../redux/slices/PostSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Container, Form, Card, Table } from 'react-bootstrap'
import Pagination from '../../components/Pagination/Pagination'
import CardHead from '../../components/CardHeader/CardHeader'
import NodataMsg from '../../components/NoDataMsg/NoDataMsg'

import CIcon from '@coreui/icons-react'
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
import PostDetails from '../modals/PostDetails'

const Posts = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchData, setSearchData] = useState('')

  const [visible, setVisible] = useState(false)
  const [reason, setReason] = useState('')
  const [id, setId] = useState(0)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const { posts, count, loading } = useSelector((state) => state.post)
  const PAGE_SIZE = 5;

  useEffect(() => {
    dispatch(showPosts({ page: 0, pageSize: PAGE_SIZE }))
  }, [])

  if (loading) {
    return <h2>Loading</h2>
  }
  const handleViewDetails = (post) => {
    setSelectedPost(post) // pass whole post from the row
    setDetailVisible(true)
  }
  const handlehandleChange = (e) => {
    const { name, value } = e.target

    setSearchData({ ...searchData, [name]: value })
  }

  // const deleteUserData = async (postId) => {
  //   try {
  //     // Prompt for confirmation before deleting the post
  //     const confirmDelete = window.confirm('Are you sure you want to delete this post?')

  //     if (confirmDelete) {
  //       dispatch(deleteUser(postId))
  //       // After deleting the post, fetch the updated list of posts
  //       navigate('/home')
  //     }
  //   } catch (error) {
  //     console.error('Error deleting post:', error)
  //   }
  // }

  function handlePageClick(e) {
    const selectedPage = e.selected
    console.log(selectedPage)
    dispatch(showPosts({ page: selectedPage, pageSize: PAGE_SIZE }))
    setPage(selectedPage)
  }

  const handleSearch = (e) => {
    let searchVal = e.target.value
    console.log(searchVal)
    setSearchData(searchVal)
    if (searchVal !== '') {
      dispatch(showPostsByKeyword({ page: 0, keyword: searchVal, pageSize: PAGE_SIZE }))
    } else {
      dispatch(showPosts({ page: 0, pageSize: PAGE_SIZE }))
    }
  }

  const onRefresh = async (e) => {
    setSearchData({
      keyword: '',
      role: '',
    })
    dispatch(showPosts(searchData))
  }

  const submit = (id) => {
    setVisible(!visible)
    setId(id)
  }

  let p = page + 1
  let countPagination = Math.ceil(count / PAGE_SIZE)

  return (
    <>
      <Container>
        <Card>
          <Card.Header>
            <CardHead
              title="Posts List"
              count={count}
              placeholder="Post Name/ email"
              value={searchData}
              // searchHandler={handleSearch}
              // hasSearch={true}
              hasCmnFltr={true}
              hasFilter={true}
              // filterData={props.parentCategry}
              // filterHandler={filterHandler}
              // filter={filter}
              filtertitle="Select Post"
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
            <option value="USER">Post</option>
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
                  <th>Post ID</th>
                  <th>Author</th>
                  <th>Comments</th>
                  <th>Saves</th>
                  <th>Likes</th>
                  {/* <th>Created At</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <h2>Loading</h2>
                ) : (
                  posts &&
                  posts?.length !== 0 &&
                  posts.map((post, i) => (
                    <tr key={i}>
                      <td>{5 * (p - 1) + i + 1}</td>
                      <td>{post?.postId}</td>
                      <td>{post?.userName}</td>
                      <td>{post?.commentCount}</td>
                      <td>{post?.saveCount}</td>
                      <td>{post?.likeCount}</td>
                      <td>
                        <CIcon
                          icon={coreIcons.cilNotes}
                          size="xl"
                          role="button"
                          onClick={() => handleViewDetails(post)}
                          title="View Details"
                          style={{ cursor: 'pointer', color: '#0dcaf0' }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            {posts && posts?.length === 0 && <NodataMsg />}
          </Card.Body>
          {countPagination > 0 && (
            <Pagination
              page={page}
              handlePageClick={handlePageClick}
              countPagination={countPagination}
            />
          )}
        </Card>
      </Container>

      {/* View Post Details Modal */}
      {/* View Post Details Modal */}
      <CModal
        visible={detailVisible}
        onClose={() => {
          // Remove focus from close button BEFORE hiding modal
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }

          setDetailVisible(false)
        }}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Post Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <PostDetails post={selectedPost} loading={!selectedPost} />
        </CModalBody>
      </CModal>
    </>
  )
}

export default Posts
