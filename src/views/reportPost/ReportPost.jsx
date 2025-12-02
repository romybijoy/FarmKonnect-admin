import React, { useEffect, useState } from 'react'
import { Form, Row, Col, Button, Table } from 'react-bootstrap'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { fetchReportsbyDate } from '../../redux/slices/ReportsSlice'
import DatePicker from 'react-datepicker'
import { useDispatch, useSelector } from 'react-redux'
import NodataMsg from '../../components/NoDataMsg/NoDataMsg'

const ReportPost = () => {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [page, setPage] = useState(0)
  const dispatch = useDispatch()

  const { data: reportsPage, loading, error } = useSelector((s) => s.reports)

  useEffect(() => {
    // initial load (last 7 days)
    dispatch(fetchReportsbyDate({ filter: 'weekly', page: 0, size: 100 }))
  }, [dispatch])

  const filterData = () => {
    dispatch(fetchReportsbyDate({ startDate, endDate, page: 0, size: 500 }))
  }

  const resetData = () => {
    setStartDate(null)
    setEndDate(null)
    dispatch(fetchReportsbyDate({ filter: 'weekly', page: 0, size: 100 }))
  }

  const reports = reportsPage?.content || []

  const downloadExcel = () => {
    if (!reports || reports.length === 0) return

    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summary = [
      ['Report count', reports.length],
      ['From', startDate ? new Date(startDate).toLocaleString() : ''],
      ['To', endDate ? new Date(endDate).toLocaleString() : ''],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Summary')

    // Rows sheet - flatten DTOs
    const rows = reports.map((r) => ({
      id: r.id,
      postId: r.postId,
      reporterId: r.reporterId,
      reason: r.reason,
      details: r.details,
      status: r.status,
      adminId: r.adminId,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Reports')
    XLSX.writeFile(wb, 'Reports.xlsx')
  }

  const downloadPDF = () => {
    if (!reports || reports.length === 0) return
    const doc = new jsPDF('p', 'pt', 'a4')
    doc.text('Reports', 40, 40)

    // Table header and body
    const head = [['Created At', 'Report Id', 'Post Id', 'Reporter Id', 'Status', 'Reason']]
    const body = reports.map((r) => [
      new Date(r.createdAt).toLocaleString(),
      r.id,
      r.postId,
      r.reporterId,
      r.status,
      r.reason || ''
    ])

    doc.autoTable({
      head,
      body,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] }
    })

    doc.save('Reports.pdf')
  }

  return (
    <div>
      <h3>Reports</h3>
      <Form>
        <Form.Group as={Row} controlId="formStartDate">
          <Form.Label column sm={2}>
            Start Date
          </Form.Label>
          <Col sm={4}>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="form-control"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="pt-2" controlId="formEndDate">
          <Form.Label column sm={2}>
            End Date
          </Form.Label>
          <Col sm={4}>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="form-control"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
            />
          </Col>
        </Form.Group>

        <div className="pt-3">
          <Button className="m-2" onClick={filterData}>
            Select Date Range
          </Button>
          <Button onClick={resetData}>Reset</Button>
        </div>
      </Form>

      {loading ? (
        <h5 className="mt-3">Loading...</h5>
      ) : reports && reports.length > 0 ? (
        <>
          <Table className="mt-4" striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Created At</th>
                <th>Report Id</th>
                <th>Post Id</th>
                <th>Reporter Id</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.id}</td>
                  <td>{r.postId}</td>
                  <td>{r.reporterId}</td>
                  <td>{r.status}</td>
                  <td>{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="pt-3">
            <Button className="m-2" onClick={downloadExcel}>
              Download Excel
            </Button>
            <Button onClick={downloadPDF}>Download PDF</Button>
          </div>
        </>
      ) : (
        <NodataMsg />
      )}

      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  )
}

export default ReportPost
