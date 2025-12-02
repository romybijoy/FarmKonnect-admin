// src/components/admin/ReportsPanel.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useStomp from './useStomp'
import ReportDetailModal from './ReportDetailModal'
import {
  fetchReports,
  reviewReport,
  addReport,
  removeReportById,
  removeReportsByPostId,
} from '../../redux/slices/ReportsSlice'

export default function ReportsPanel({ onCountChange }) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const dispatch = useDispatch()
  const reportsState = useSelector((s) => s.reports)
  const { items: reports, status, page, size, total } = reportsState

  const [selected, setSelected] = useState(null)
  const [processingId, setProcessingId] = useState(null)
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
      alert('Failed to load reports')
    }
  }

  async function handleAction(reportId, action) {
    const confirmMessage = action === 'REMOVE_POST' ? 'Remove this post?' : 'Dismiss this report?'
    if (!window.confirm(confirmMessage)) return

    setProcessingId(reportId)
    try {
      await dispatch(
        reviewReport({
          adminId: userInfo?.userId,
          reportId,
          action,
          reason: action === 'REMOVE_POST' ? 'Removed by admin' : 'Dismissed by admin',
        }),
      ).unwrap()
      // on success the slice removes the report
      if (selected && selected.id === reportId) setSelected(null)
    } catch (err) {
      console.error('Action failed:', err)
      alert('Action failed: ' + (err?.message || err))
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div
      className="reports-panel card"
      style={{ border: '1px solid #e6e6e6', borderRadius: 6, overflow: 'hidden' }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <strong>Pending Reports</strong>
        <div>
          <button onClick={() => fetchPage(0)} disabled={status === 'loading'}>
            Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: 12, minHeight: 120 }}>
        {status === 'loading' ? (
          <div>Loading...</div>
        ) : reports.length === 0 ? (
          <div>No pending reports</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {reports.map((r) => (
              <li
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 120px',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: '1px solid #eee',
                  alignItems: 'center',
                }}
              >
                {/* LEFT: Post + time */}
                <div>
                  <div style={{ fontWeight: '600', marginBottom: 4 }}>
                    Post: <span style={{ fontWeight: 400 }}>{r.postId}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    Reported at: {new Date(r.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>

                {/* MIDDLE: reason + details */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.reason}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>
                    {r.details ? (
                      r.details.length > 140 ? (
                        r.details.slice(0, 140) + '...'
                      ) : (
                        r.details
                      )
                    ) : (
                      <em>No details</em>
                    )}
                  </div>
                </div>

                {/* RIGHT: Action buttons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    minWidth: '120px',
                  }}
                >
                  <button
                    style={{
                      padding: '6px 10px',
                      border: '1px solid black',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelected(r)}
                  >
                    View
                  </button>

                  <button
                    style={{
                      padding: '6px 10px',
                      background: '#d9534f',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: processingId === r.id ? 0.6 : 1,
                    }}
                    onClick={() => handleAction(r.id, 'REMOVE_POST')}
                    disabled={processingId === r.id}
                  >
                    {processingId === r.id ? 'Processing…' : 'Remove'}
                  </button>

                  <button
                    style={{
                      padding: '6px 10px',
                      border: '1px solid black',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleAction(r.id, 'DISMISS')}
                    disabled={processingId === r.id}
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        style={{
          padding: 8,
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>Showing {reports.length} pending</div>
        <div>
          <button
            onClick={() => fetchPage(Math.max(0, pageRef.current - 1))}
            disabled={pageRef.current === 0}
          >
            Prev
          </button>
          <span style={{ margin: '0 8px' }}>Page {pageRef.current + 1}</span>
          <button onClick={() => fetchPage(pageRef.current + 1)}>Next</button>
        </div>
      </div>

      {selected && (
        <ReportDetailModal
          report={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          processingId={processingId}
        />
      )}
    </div>
  )
}
