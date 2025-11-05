import React, { useEffect, useState } from 'react'
import { showPosts } from '../../redux/slices/PostSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button, Container, Form, Card, Table } from 'react-bootstrap'
import Pagination from '../../components/Pagination/Pagination'
import CardHead from '../../components/CardHeader/CardHeader'
import NodataMsg from '../../components/NoDataMsg/NoDataMsg'
import { FaUserSlash } from 'react-icons/fa'

import CIcon from '@coreui/icons-react'
import { cilUserUnfollow } from '@coreui/icons'
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
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [searchData, setSearchData] = useState('')

  const [visible, setVisible] = useState(false)
  const [reason, setReason] = useState('')
  const [id, setId] = useState(0)

  const { posts, count, loading } = useSelector((state) => state.post)

  useEffect(() => {
    dispatch(showPosts({ page: 0 }))
  }, [])

  if (loading) {
    return <h2>Loading</h2>
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
                  <th>Preview</th>
                  <th>Comments</th>
                  <th>Saves</th>
                  <th>Likes</th>
                  <th>Created At</th>
                  {/* <th>Actions</th> */}
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
                      <td>{post?.contentPreview}</td>
                      <td>
                        <img src={post.postImage} width="100px" height="100px" />
                      </td>
                      
                      <td>{post?.commentCount}</td>
                      
                      <td>{post?.saveCount}</td>
                      
                      <td>{post?.likeCount}</td>
                      {/* <td>
                        <CIcon icon={cilUserUnfollow} size="xl" onClick={() => submit(post?.id)} />
                      </td> */}
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

      
    </>
  )
}

export default Posts
