// src/components/admin/ReportsPanel.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useStomp from './useStomp'
import ReportDetailModal from './ReportDetailModal'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CButton,
  CBadge,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import {
  fetchReports,
  reviewReport,
  addReport,
  removeReportById,
  removeReportsByPostId,
} from '../../redux/slices/ReportsSlice'
import ConfirmModal from '../../components/Confirm/ConfirmModal'
import { toast } from 'react-toastify'
import { fetchPostsById } from '../../redux/slices/PostSlice'

export default function ReportsPanel({ onCountChange }) {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const dispatch = useDispatch()
  const reportsState = useSelector((s) => s.reports)
  const { items: reports, status, page, size, total } = reportsState

  const { selectedPost, selectedPostLoading } = useSelector((s) => s.post)

  const [selected, setSelected] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [confirmData, setConfirmData] = useState(null)
  const pageRef = useRef(0)

  // STOMP handlers: dispatches to redux slice so UI stays in sync
  const { stompRef } = useStomp({
    onCreated: (payload) => {
      dispatch(addReport(payload))
    },
    onReviewed: (payload) => {
      // payload may contain reportId or id
      const id = payload.reportId ?? payload.id
      if (id) dispatch(removeReportById(id))
    },
    onModerated: (payload) => {
      // if backend notifies that a post was moderated, remove its reports
      if (payload.postId) dispatch(removeReportsByPostId(payload.postId))
    },
  })

  useEffect(() => {
    // initial load
    fetchPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (onCountChange) onCountChange(reports.length)
  }, [reports.length, onCountChange])

  async function fetchPage(pageToFetch = 0) {
    pageRef.current = pageToFetch
    try {
      await dispatch(fetchReports({ status: 'PENDING', page: pageToFetch, size })).unwrap()
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      toast.error('Failed to load reports')
    }
  }

  async function handleAction(reportId, action) {
  setProcessingId(reportId)

  try {
    await dispatch(
      reviewReport({
        adminId: userInfo?.userId,
        reportId,
        action,
        reason: action === 'REMOVE_POST'
          ? 'Removed by admin'
          : 'Dismissed by admin',
      }),
    ).unwrap()

    toast.success(
      action === 'REMOVE_POST'
        ? 'Post removed successfully'
        : 'Report dismissed successfully'
    )

    if (selected && selected.id === reportId) {
      setSelected(null)
    }

  } catch (err) {
    console.error('Action failed:', err)
    toast.error(err?.message || 'Action failed')
  } finally {
    setProcessingId(null)
  }
}

  function openConfirm(reportId, action) {
    setConfirmData({ reportId, action })
  }

  const actionContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 140,
  }

  const baseBtn = {
    padding: '8px 12px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }

  const viewBtn = {
    ...baseBtn,
    background: '#f9fafb',
    border: '1px solid #d1d5db',
    color: '#111827',
  }

  const removeBtn = {
    ...baseBtn,
    background: '#dc2626',
    border: 'none',
    color: 'white',
  }

  const dismissBtn = {
    ...baseBtn,
    background: 'white',
    border: '1px solid #e5e7eb',
    color: '#374151',
  }

  useEffect(() => {
    if (selected?.postId) {
      dispatch(fetchPostsById(selected.postId))
    }
  }, [selected, dispatch])


  const hasNext = (page + 1) * size < total
const hasPrev = page > 0

  return (
    <CCard className="mb-4">
      {/* Header */}
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Pending Reports</strong>

        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          onClick={() => fetchPage(0)}
          disabled={status === 'loading'}
        >
          Refresh
        </CButton>
      </CCardHeader>

      {/* Body */}
      <CCardBody>
        {status === 'loading' ? (
          <div className="text-center py-4">
            <CSpinner color="primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-muted text-center py-4">No pending reports</div>
        ) : (
          reports.map((r) => (
            <CCard key={r.id} className="mb-1 shadow-sm border">
              <CCardBody>
                <CRow className="align-items-center">
                  {/* LEFT SIDE */}
                  <CCol md={8}>
                    {/* Main details */}
                    <div className="fw-semibold mb-1">
                      {r.details?.length > 120 ? (
                        <>
                          {r.details.slice(0, 120)}...
                          <span
                            className="text-primary small ms-1"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelected(r)}
                          >
                            View more
                          </span>
                        </>
                      ) : (
                        r.details || 'No additional details provided.'
                      )}
                    </div>

                    {/* Reason + Time */}
                    <span className="fw-semibold text-danger">{r.reason}</span>

                    <small className="text-medium-emphasis d-block">
                      Reported: {new Date(r.createdAt).toLocaleString()}
                    </small>

                    {/* Post ID */}
                    <small className="text-medium-emphasis">
                      Post ID: {r.postId.slice(0, 8)}...
                    </small>
                  </CCol>

                  {/* RIGHT SIDE */}
                  <CCol md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                    <CButton
                      size="sm"
                      color="secondary"
                      variant="outline"
                      onClick={() => setSelected(r)}
                    >
                      View
                    </CButton>

                    {/* <CButton
                      size="sm"
                      color="danger"
                      disabled={processingId === r.id}
                      onClick={() => openConfirm(r.id, 'REMOVE_POST')}
                    >
                      {processingId === r.id ? 'Processing...' : 'Remove'}
                    </CButton>

                    <CButton
                      size="sm"
                      color="secondary"
                      variant="outline"
                      disabled={processingId === r.id}
                      onClick={() => openConfirm(r.id, 'DISMISS')}
                    >
                      Dismiss
                    </CButton> */}
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          ))
        )}
      </CCardBody>

      {/* Footer */}
      <CCardFooter className="d-flex justify-content-between align-items-center">
        <small className="text-medium-emphasis">Showing {reports.length} pending</small>

        <div className="d-flex align-items-center gap-2">
          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            onClick={() => fetchPage(Math.max(0, pageRef.current - 1))}
            disabled={!hasPrev}
          >
            Prev
          </CButton>

          <span>Page {pageRef.current + 1}</span>

          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            onClick={() => fetchPage(pageRef.current + 1)}
            disabled={!hasNext}
          >
            Next
          </CButton>
        </div>
      </CCardFooter>

      {/* Modals */}
      {selected && (
        <ReportDetailModal
          report={selected}
          post={selectedPost}
          loadingPost={selectedPostLoading}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          processingId={processingId}
        />
      )}
    </CCard>
  )
}
