import React, { useState } from 'react'
import { CRow, CCol, CCard, CCardBody, CBadge, CButton, CSpinner } from '@coreui/react'

export default function PostDetails({
  post,
  loading = false,
  onRemove,
  onRestore,
  onSuspendUser,
  showModerationActions = false,
}) {
  const [previewImage, setPreviewImage] = useState(null)

  if (loading) {
    return (
      <div className="text-center py-4">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!post) {
    return <div className="text-muted">Post not found.</div>
  }

  return (
    <>
      {/* ================= META SECTION ================= */}
      <CRow className="mb-3">
        <CCol>
          <small className="text-medium-emphasis text-uppercase">Post ID</small>

          <div className="d-flex align-items-center gap-2 mt-1">
            <code className="px-2 py-1 bg-light text-danger rounded" style={{ fontSize: 13 }}>
              {post.postId}
            </code>

            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              onClick={() => navigator.clipboard?.writeText(post.postId)}
            >
              Copy
            </CButton>
          </div>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4}>
          <small className="text-medium-emphasis text-uppercase">Author</small>
          <div className="fw-semibold mt-1">{post.userName}</div>
        </CCol>

        <CCol md={4}>
          <small className="text-medium-emphasis text-uppercase">Status</small>
          <div className="mt-1">
            <CBadge
              color={
                post.status === 'ACTIVE'
                  ? 'success'
                  : post.status === 'REMOVED'
                    ? 'danger'
                    : 'secondary'
              }
            >
              {post.status}
            </CBadge>
          </div>
        </CCol>

        <CCol md={4}>
          <small className="text-medium-emphasis text-uppercase">Created</small>
          <div className="mt-1 text-medium-emphasis">
            {post.createdAt &&
              new Date(post.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
          </div>
        </CCol>
      </CRow>

      <hr className="my-2" />

      {/* ================= CONTENT + MEDIA ================= */}
      <CRow className="g-4 mt-2">
        {/* Content */}
        <CCol lg={7}>
          <CCard className="border rounded-3">
            <CCardBody>
              <h6 className="fw-semibold mb-2">Content</h6>
              <div
                style={{
                  maxHeight: 200,
                  minHeight: 160,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
                className="text-medium-emphasis"
              >
                {post.contentPreview || post.content || 'No content available.'}
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Media */}
        <CCol lg={5}>
          <CCard className="shadow-sm border-0">
            <CCardBody className="text-center p-2">
              <h6 className="fw-semibold mb-3">Media</h6>

              {post.postImages?.length > 0 ? (
                <CRow className="g-2">
                  {post.postImages.map((img, index) => (
                    <CCol xs={6} key={index}>
                      <img
                        src={img}
                        alt="media"
                        className="img-fluid rounded"
                        style={{
                          height: 120,
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => setPreviewImage(img)}
                      />
                    </CCol>
                  ))}
                </CRow>
              ) : (
                <small className="text-medium-emphasis">No image available</small>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ================= STATS ================= */}
      <div className="mt-4 pt-3 border-top d-flex gap-3 flex-wrap">
        <CBadge color="secondary" className="fw-normal">
          Comments: {post.commentCount ?? 0}
        </CBadge>
        <CBadge color="info" className="fw-normal">
          Saves: {post.saveCount ?? 0}
        </CBadge>
        <CBadge color="success" className="fw-normal">
          Likes: {post.likeCount ?? 0}
        </CBadge>
      </div>

      {/* ================= MODERATION ACTIONS ================= */}
      {showModerationActions && (
        <>
          <hr className="my-4" />

          <h6 className="fw-semibold mb-3">Moderation Actions</h6>

          <div className="d-flex gap-2 flex-wrap">
            {post.status !== 'REMOVED' && (
              <CButton color="danger" onClick={onRemove}>
                Remove Post
              </CButton>
            )}

            {post.status === 'REMOVED' && (
              <CButton color="secondary" variant="outline" onClick={onRestore}>
                Restore Post
              </CButton>
            )}

            <CButton color="warning" variant="outline" onClick={onSuspendUser}>
              Suspend User
            </CButton>
          </div>
        </>
      )}

      {/* ================= IMAGE PREVIEW ================= */}
      {previewImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: 'rgba(0,0,0,0.75)',
            zIndex: 2000,
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="img-fluid rounded"
            style={{ maxHeight: '90%' }}
          />
        </div>
      )}
    </>
  )
}
