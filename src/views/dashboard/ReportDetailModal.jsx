import React, { useState } from 'react'

import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import PostDetails from '../modals/PostDetails'

export default function ReportDetailModal({
  report,
  post,
  loadingPost,
  onClose,
  onAction,
  processingId,
}) {
  if (!report) return null

  const isProcessing = processingId === report.id
  const [confirmAction, setConfirmAction] = useState(null)

  return (
    <CModal
      visible={!!report}
      onClose={() => {
        setConfirmAction(null)
        onClose()
      }}
      size="lg"
      backdrop="static"
    >
      {/* Header */}
      <CModalHeader>
        <CModalTitle>Report Details</CModalTitle>
      </CModalHeader>

      {/* Body */}
      <CModalBody>
        <CRow className="mb-3">
          <CCol>
            <h6 className="text-medium-emphasis mb-1">Report ID</h6>
            <div className="fw-semibold">{report.id}</div>
          </CCol>
        </CRow>
        {/* 
        <CRow className="mb-3">
          <CCol>
            <h6 className="text-medium-emphasis mb-1">Post ID</h6>
            <div className="fw-semibold">{report.postId}</div>
          </CCol>
        </CRow> */}

        <CRow className="mb-3">
          <CCol>
            <h6 className="text-medium-emphasis mb-1">Reason</h6>
            <CBadge color="danger" className="px-3 py-1">
              {report.reason}
            </CBadge>
          </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol>
            <h6 className="text-medium-emphasis mb-1">Details</h6>
            <div className="border rounded p-3 bg-light">
              {report.details || 'No details provided.'}
            </div>
          </CCol>
        </CRow>

        <CRow>
          <CCol>
            <h6 className="text-medium-emphasis mb-1">Reporter</h6>
            <div className="fw-semibold">{report.reporterId || 'Unknown'}</div>
            <small className="text-medium-emphasis">
              Reported at: {new Date(report.createdAt || Date.now()).toLocaleString()}
            </small>
          </CCol>
        </CRow>

        {/* ================= POST DETAILS (REUSED) ================= */}

        <hr className="my-4" />

        <PostDetails
          post={post}
          loading={loadingPost}
          showModerationActions={false} // keep actions in footer
        />
      </CModalBody>

      {/* Footer */}
      <CModalFooter className="justify-content-between">
        {!confirmAction ? (
          <>
            <CButton size="sm" color="secondary" variant="outline" onClick={onClose}>
              Close
            </CButton>

            {/* <CButton
          color="secondary"
          variant="outline"
          disabled={isProcessing}
          onClick={() => onAction(report.id, 'DISMISS')}
        >
          Dismiss
        </CButton>

        <CButton
          color="danger"
          disabled={isProcessing}
          onClick={() => onAction(report.id, 'REMOVE_POST')}
        >
          {isProcessing ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            'Remove Post'
          )}
        </CButton> */}
            <div className="d-flex gap-2">
              <CButton
                size="sm"
                color="secondary"
                variant="outline"
                onClick={() => setConfirmAction('DISMISS')}
              >
                Dismiss
              </CButton>
              <CButton
                size="sm"
                color="danger"
                disabled={isProcessing}
                onClick={() => setConfirmAction('REMOVE_POST')}
              >
                {isProcessing ? (
                  <>
                    <CSpinner />
                    Processing...
                  </>
                ) : (
                  'Remove Post'
                )}
              </CButton>
            </div>
          </>
        ) : (
          <>
            <div className="me-auto text-danger fw-semibold">Are you sure?</div>

            <CButton variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </CButton>

            <CButton
              color={confirmAction === 'REMOVE_POST' ? 'danger' : 'secondary'}
              onClick={() => onAction(report.id, confirmAction)}
            >
              {confirmAction === 'REMOVE_POST' ? 'Confirm Remove' : 'Confirm Dismiss'}
            </CButton>
          </>
        )}
      </CModalFooter>
    </CModal>
  )
}
