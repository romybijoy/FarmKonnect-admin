import React, { useEffect, useState } from 'react'
import { Form, Row, Col, Button, Table, ButtonGroup } from 'react-bootstrap'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { fetchReportsbyDate } from '../../redux/slices/ReportsSlice'
import DatePicker from 'react-datepicker'
import { useDispatch, useSelector } from 'react-redux'
import NodataMsg from '../../components/NoDataMsg/NoDataMsg'

const ReportPost = () => {
  const dispatch = useDispatch()

  const [filterType, setFilterType] = useState('weekly')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [page, setPage] = useState(0)
  const { data: reportsPage, loading, error } = useSelector((s) => s.reports)

  useEffect(() => {
    dispatch(fetchReportsbyDate({ filter: 'weekly', page: 0, size: 100 }))
  }, [dispatch])

  const applyFilter = (type) => {
    setFilterType(type)

    // if (type === 'custom') return

    setStartDate(null)
    setEndDate(null)

    dispatch(
      fetchReportsbyDate({
        filter: type,
        page: 0,
        size: 100,
      }),
    )
  }

  const applyCustomRange = () => {
    dispatch(
      fetchReportsbyDate({
        startDate,
        endDate,
        page: 0,
        size: 500,
      }),
    )
  }

  const resetData = () => {
    setStartDate(null)
    setEndDate(null)
    setPage(0)

    dispatch(fetchReportsbyDate({ startDate, endDate, page: 0, size: 100 }))
  }

  const reports = reportsPage?.content || []

 const downloadExcel = () => {
  if (!reports || reports.length === 0) return

  const wb = XLSX.utils.book_new()

  // 🔹 Summary sheet
  const summary = [
    ['Exported At', new Date().toLocaleString()],
    ['Filter Type', filterType.toUpperCase()],
    ['Report Count', reports.length],
    ['From Date', startDate ? new Date(startDate).toLocaleDateString() : '-'],
    ['To Date', endDate ? new Date(endDate).toLocaleDateString() : '-']
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summary)
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

  // 🔹 Rows (explicit column order + formatted dates)
  const rows = reports.map((r) => ({
    'Report ID': r.id,
    'Post ID': r.postId,
    'Reporter ID': r.reporterId,
    'Reason': r.reason || '',
    'Details': r.details || '',
    'Status': r.status,
    'Admin ID': r.adminId || '',
    'Created At': new Date(r.createdAt).toLocaleString(),
    'Reviewed At': r.reviewedAt
      ? new Date(r.reviewedAt).toLocaleString()
      : ''
  }))

  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false })

  // 🔹 Column widths
  ws['!cols'] = [
    { wch: 38 },
    { wch: 38 },
    { wch: 38 },
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 38 },
    { wch: 22 },
    { wch: 22 }
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Reports')

  XLSX.writeFile(wb, `Reports_${filterType}_${Date.now()}.xlsx`)
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
      r.reason || '',
    ])

    doc.autoTable({
      head,
      body,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    })

    doc.save('Reports.pdf')
  }

  return (
    <div>
      <h3>Reports</h3>

      {/* 🔘 Filter Buttons */}
      <ButtonGroup className="mb-3">
        <Button
          variant={filterType === 'daily' ? 'primary' : 'outline-primary'}
          onClick={() => applyFilter('daily')}
        >
          Daily
        </Button>

        <Button
          variant={filterType === 'weekly' ? 'primary' : 'outline-primary'}
          onClick={() => applyFilter('weekly')}
        >
          Weekly
        </Button>

        <Button
          variant={filterType === 'monthly' ? 'primary' : 'outline-primary'}
          onClick={() => applyFilter('monthly')}
        >
          Monthly
        </Button>

        <Button
          variant={filterType === 'custom' ? 'primary' : 'outline-primary'}
          onClick={() => applyFilter('custom')}
        >
          Custom
        </Button>
      </ButtonGroup>

      {/* 📅 Custom Date Range */}
      {filterType === 'custom' && (
        <Form className="mb-3">
          <Form.Group as={Row} className="mb-2">
            <Form.Label column sm={2}>
              Start Date
            </Form.Label>
            <Col sm={4}>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-2">
            <Form.Label column sm={2}>
              End Date
            </Form.Label>
            <Col sm={4}>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
              />
            </Col>
          </Form.Group>

          <div className="pt-3">
            <Button className="m-2" onClick={applyCustomRange}>Apply</Button>
            <Button onClick={resetData}>Reset</Button>
          </div>
        </Form>
      )}

      {/* Data Table */}
      <>
        {loading ? (
          <h5>Loading...</h5>
        ) : reports.length > 0 ? (
          <Table striped bordered hover responsive size="sm">
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
        ) : (
          <NodataMsg />
        )}
        <div className="pt-3">
          <Button className="m-2" onClick={downloadExcel}>
            Download Excel
          </Button>
          <Button onClick={downloadPDF}>Download PDF</Button>
        </div>
      </>

      {error && <div className="text-danger">{error}</div>}
    </div>
  )
}

export default ReportPost
