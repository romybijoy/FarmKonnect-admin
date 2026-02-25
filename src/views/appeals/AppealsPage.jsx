import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CBadge,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAppeals, approveAppeal, rejectAppeal } from '../../redux/slices/AppealSlice'
import PostDetails from '../modals/PostDetails'
import { fetchPostsById } from '../../redux/slices/PostSlice'

export default function AppealsPage() {
  const dispatch = useDispatch()
  const { items, appealLoading } = useSelector((s) => s.appeals)

  const [status, setStatus] = useState('PENDING')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [showModal, setShowModal] = useState(false)

    const { selectedPost, loading } = useSelector((s) => s.post)

  useEffect(() => {
    dispatch(fetchAppeals({ status }))
  }, [status])

  useEffect(() => {
    if (selectedPostId && showModal) {
      console.log("first")
      dispatch(fetchPostsById(selectedPostId))
    }
  }, [selectedPostId, showModal])

  const handleApprove = (appealId) => {
    if (window.confirm('Approve this appeal?')) {
      dispatch(approveAppeal(appealId))
    }
  }

  const handleReject = (appealId) => {
    if (window.confirm('Reject this appeal?')) {
      dispatch(rejectAppeal(appealId))
    }
  }

  return (
    <div className="container-fluid">
      <CCard className="shadow-sm border-0">
        <CCardBody>
          {/* ===== Header ===== */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Appeals Management</h5>
          </div>

          {/* ===== Status Tabs ===== */}
          <div className="d-flex gap-2 mb-4">
            {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
              <CButton
                key={s}
                size="sm"
                color={status === s ? 'primary' : 'light'}
                variant={status === s ? undefined : 'outline'}
                onClick={() => setStatus(s)}
              >
                {s}
              </CButton>
            ))}
          </div>

          {/* ===== Loading ===== */}
          {appealLoading && (
            <div className="text-center py-4">
              <CSpinner />
            </div>
          )}

          {/* ===== Empty State ===== */}
          {!appealLoading && items?.length === 0 && (
            <div className="text-center text-medium-emphasis py-5">No appeals found.</div>
          )}

          {/* ===== Table ===== */}
          {!appealLoading && items?.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="small text-medium-emphasis">
                  <tr>
                    <th>Appeal ID</th>
                    <th>Post</th>
                    <th>User</th>
                    <th>Reason</th>
                    <th>Created</th>
                    <th>Status</th>
                    {status === 'PENDING' && <th className="text-end">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((appeal) => (
                    <tr key={appeal.id}>
                      <td>
                        <code>{appeal.id}</code>
                      </td>

                      <td>
                        <CButton
                          color="link"
                          size="sm"
                          onClick={() => {
                            setSelectedPostId(appeal.postId)
                            setShowModal(true)
                          }}
                        >
                          {appeal.postId}
                        </CButton>
                      </td>

                      <td>{appeal.userId}</td>

                      <td className="text-truncate" style={{ maxWidth: 200 }}>
                        {appeal.reason}
                      </td>

                      <td>{new Date(appeal.createdAt).toLocaleString()}</td>

                      <td>
                        <CBadge
                          color={
                            appeal.status === 'APPROVED'
                              ? 'success'
                              : appeal.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {appeal.status}
                        </CBadge>
                      </td>

                      {status === 'PENDING' && (
                        <td className="text-end">
                          <CButton
                            size="sm"
                            color="success"
                            className="me-2"
                            onClick={() => handleApprove(appeal.id)}
                          >
                            Approve
                          </CButton>

                          <CButton size="sm" color="danger" onClick={() => handleReject(appeal.id)}>
                            Reject
                          </CButton>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* ===== Post Modal ===== */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="xl">
        <CModalHeader onClose={() => setShowModal(false)}>
          <CModalTitle>Post Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <PostDetails post={selectedPost} loading={loading} showModerationActions={false} />
        </CModalBody>
      </CModal>
    </div>
  )
}
