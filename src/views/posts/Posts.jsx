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

  useEffect(() => {
    dispatch(showPosts({ page: 0 }))
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
    dispatch(showPosts({ page: selectedPage }))
    setPage(selectedPage)
  }

  const handleSearch = (e) => {
    let searchVal = e.target.value
    console.log(searchVal)
    setSearchData(searchVal)
    if (searchVal !== '') {
      dispatch(showPostsByKeyword({ page: 0, keyword: searchVal }))
    } else {
      dispatch(showPosts({ page: 0, pageSize: 5 }))
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
  let countPagination = Math.ceil(count / 5)

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
          <Pagination
            page={page}
            handlePageClick={handlePageClick}
            countPagination={countPagination}
          />
        </Card>
      </Container>

      {/* View Post Details Modal */}
      {/* View Post Details Modal */}
      <CModal
        alignment="center"
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        size="lg"
      >
        {/* HEADER */}
        <CModalHeader className="border-0 pb-0 align-items-start">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-1">
              <CModalTitle className="fw-semibold fs-5">Post Details</CModalTitle>
            </div>
            <small className="text-muted m-xl-2">
              Created On {selectedPost?.createdAt
                ? new Date(selectedPost.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : ''}
            </small>
          </div>
        </CModalHeader>

        {/* BODY */}
        <CModalBody>
          {!selectedPost ? (
            <p>Loading post details...</p>
          ) : (
            <div className="container-fluid">
              {/* Top row: Post ID + Author + Stats */}
              <div className="row mb-4 align-items-center">
                <div className="col-md-6 mb-2 mb-md-0">
                  <label className="text-uppercase text-muted small mb-1">Post ID</label>
                  <div className="d-flex align-items-center">
                    <code className="text-danger bg-light px-2 py-1 rounded me-2">
                      {selectedPost.postId}
                    </code>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => navigator.clipboard?.writeText(selectedPost.postId)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="col-md-3 mb-2 mb-md-0">
                  <label className="text-uppercase text-muted small mb-1">Author</label>
                  <div className="fw-semibold">{selectedPost.userName}</div>
                </div>

               <div className="col-12 mt-3">
            <div className="d-flex flex-wrap gap-3">
              <span className="badge text-bg-secondary">
                Comments: {selectedPost.commentCount ?? 0}
              </span>
              <span className="badge text-bg-info">
                Saves: {selectedPost.saveCount ?? 0}
              </span>
              <span className="badge text-bg-success">
                Likes: {selectedPost.likeCount ?? 0}
              </span>
            </div>
          </div>
              </div>

              {/* Second row: Content Preview + Media */}
              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-2">Content Preview</h6>
                      <p className="post-content text-secondary mb-0">
                        {selectedPost.contentPreview ||
                          selectedPost.content ||
                          'No content available.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="card shadow-sm border-0 h-100 d-flex align-items-center justify-content-center">
                    <div className="card-body text-center">
                      <h6 className="fw-semibold mb-3">Media</h6>
                      {selectedPost.postImage ? (
                        <img
                          src={selectedPost.postImage}
                          alt="Post"
                          className="img-fluid rounded-3 shadow-sm"
                          style={{
                            maxHeight: '260px',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div className="text-muted small">No image available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CModalBody>

        {/* FOOTER */}
        <CModalFooter className="border-0 pt-0">
          <CButton color="secondary" variant="outline" onClick={() => setDetailVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Posts
