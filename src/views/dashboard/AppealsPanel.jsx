import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Spinner, Badge } from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import * as icons from '@coreui/icons'

import { fetchAppeals, approveAppeal, rejectAppeal } from '../../redux/slices/AppealSlice'
import PostDetails from '../modals/PostDetails'
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'
import { fetchPostsById } from '../../redux/slices/PostSlice'

export default function AppealsPanel() {
  const dispatch = useDispatch()
  const [showPostModal, setShowPostModal] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const { items, appealLoading, error } = useSelector((state) => state.appeals)

  const adminId = JSON.parse(localStorage.getItem('userInfo'))?.userId

  const { selectedPost, loading } = useSelector((s) => s.post)

  useEffect(() => {
    dispatch(fetchAppeals({status: 'PENDING'}))
  }, [dispatch])

  useEffect(() => {
  if (selectedPostId && showPostModal) {
    dispatch(fetchPostsById(selectedPostId))
  }
}, [selectedPostId, showPostModal])

  const handleReject = (appealId) => {
    dispatch(rejectAppeal({ appealId, adminId }))
  }

  const handleApprove = async (appealId) => {
    setProcessingId(appealId)
    dispatch(approveAppeal({ appealId, adminId }))
    setProcessingId(null)
  }

  return (
    <div>
      {appealLoading && (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading appeals...
        </div>
      )}

      {!appealLoading && items?.length === 0 && (
        <div className="text-muted small py-2">No pending appeals</div>
      )}

      {!appealLoading && items?.length > 0 && (
        <Table responsive hover className="mb-0">
          <thead>
            <tr className="text-muted small">
              <th>Appeal ID</th>
              <th>Post ID</th>
              <th>User</th>
              <th>Reason</th>
              <th>Created</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((appeal) => (
              <tr key={appeal.id} className="align-middle">
                <td>
                  <code>{appeal.id}</code>
                </td>

                <td>
                  
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none"
                      onClick={() => {
                        setSelectedPostId(appeal.postId)
                        setShowPostModal(true)
                      }}
                    >
                      {appeal.postId}
                    </Button>
                 
                </td>

                <td>{appeal.userId}</td>

                <td style={{ maxWidth: 250 }}>
                  <div className="text-truncate">{appeal.reason}</div>
                </td>

                <td className="text-muted small">{new Date(appeal.createdAt).toLocaleString()}</td>

                <td>
                  <Badge bg="warning" className="px-1 py-2 fw-semibold text-dark">
                    ⏳ Pending
                  </Badge>
                </td>

                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      size="sm"
                      variant="outline-success"
                      disabled={processingId === appeal.id}
                      onClick={() => handleApprove(appeal.id)}
                    >
                      <CIcon icon={icons.cilThumbUp} className="me-1" />
                      {processingId === appeal.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleReject(appeal.id)}
                    >
                      <CIcon icon={icons.cilXCircle} className="me-1" />
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <CModal
  visible={showPostModal}
  onClose={() => setShowPostModal(false)}
  size="xl"
>
  <CModalHeader onClose={() => setShowPostModal(false)}>
    <CModalTitle>Post Review</CModalTitle>
  </CModalHeader>

  <CModalBody>
    <PostDetails
      post={selectedPost}
      loading={loading}
      showModerationActions={true}
    />
  </CModalBody>
</CModal>
      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  )
}
