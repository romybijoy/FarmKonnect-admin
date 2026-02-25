import React, { useMemo, useState, useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import * as icons from '@coreui/icons'
import { Button, Card, Table, Form, Tabs, Tab } from 'react-bootstrap'

import { showPosts } from '../../redux/slices/PostSlice'
import { showUser } from '../../redux/slices/UserSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import ReportsPanel from './ReportsPanel'
import { fetchReports } from '../../redux/slices/ReportsSlice'
import { fetchAppeals } from '../../redux/slices/AppealSlice'
import AppealsPanel from './AppealsPanel'

/**
 * AdminSocialDashboard.jsx
 * - No extra deps beyond react-bootstrap + @coreui/icons-react
 * - Replace mock data with your Redux selectors/actions
 */
export default function Dashboard() {
  const [range, setRange] = useState('7d')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { count, posts } = useSelector((state) => state.post)
  // const { total } = reportsState
  const { userCount, users } = useSelector((state) => state.app)

  const reportsState = useSelector((s) => s.reports)
  const { total } = reportsState

  useEffect(() => {
    dispatch(showPosts({ page: 0, pageSize: 5 }))
    dispatch(showUser({ page: 0 }))
    dispatch(fetchReports({ status: 'PENDING' }))
    dispatch(fetchAppeals({status: 'PENDING'}))
  }, [])
  // --- MOCK DATA (replace with real) ---

  const stats = useMemo(
    () => ({
      totalUsers: userCount ?? 0,
      totalPosts: count ?? 0,
      activeToday: userCount ?? 0,
      pendingReports: total ?? 0,
      trendUsers: '+3.2%',
      trendPosts: '+1.1%',
      trendActive: '+12%',
      trendReports: '-22%',
    }),
    [count, userCount],
  )

  const adminAppeals = useSelector((state) => state.appeals)
  const { items: pendingAppeals } = adminAppeals

  // --- Helpers ---
  const Initials = ({ name }) => {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
    const init = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#eef2ff',
          color: '#3b5bfd',
          fontWeight: 700,
        }}
      >
        {init || 'U'}
      </div>
    )
  }

  const StatCard = ({ title, value, sub, icon, tone = 'primary' }) => (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body className="d-flex align-items-center">
        <div
          className={`me-3 d-flex align-items-center justify-content-center rounded-3 bg-${tone}-subtle`}
          style={{ width: 44, height: 44 }}
        >
          <CIcon icon={icon} size="xl" className={`text-${tone}`} />
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="fw-bold fs-5">{value}</div>
          <div className={`small ${sub?.startsWith('-') ? 'text-danger' : 'text-success'}`}>
            {sub}
          </div>
        </div>
      </Card.Body>
    </Card>
  )

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div>
          <h4 className="mb-0">Admin Dashboard</h4>
          <div className="text-muted small">Overview · moderation · engagement</div>
        </div>
        {/* <div className="ms-auto d-flex align-items-center gap-2">
          <Form.Select
            size="sm"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </Form.Select>
          <Button size="sm" variant="outline-secondary">
            Export
          </Button>
        </div> */}
      </div>

      {/* KPI Row */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            // sub={stats.trendUsers}
            icon={icons.cilPeople}
            tone="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Posts"
            value={stats.totalPosts.toLocaleString()}
            // sub={stats.trendPosts}
            icon={icons.cilNotes}
            tone="info"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Today"
            value={stats.activeToday.toLocaleString()}
            // sub={stats.trendActive}
            icon={icons.cilBolt}
            tone="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            // sub={stats.trendReports}
            icon={icons.cilWarning}
            tone="danger"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Appeals"
            value={pendingAppeals?.length ?? 0}
            icon={icons.cilBalanceScale}
            tone="warning"
          />
        </div>
      </div>

      {/* Middle Row: Moderation + Top Posts */}
      <div className="row g-3">
        <div className="col">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-0">
              <div className="d-flex align-items-center">
                <h6 className="mb-0">Moderation Queue</h6>
                {/* {total && (<span className="badge text-bg-secondary ms-2">{total }</span>)} */}
                <div className="ms-auto">
                  <Button size="sm" variant="outline-danger">
                    Review All
                  </Button>
                </div>
              </div>
            </Card.Header>
            {/* <Card.Body className="pt-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Report ID</th>
                    <th>Post</th>
                    <th>Reason</th>
                    <th>Reporter</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {moderationQueue.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <code>{r.id}</code>
                      </td>
                      <td>{r.postId}</td>
                      <td>{r.reason}</td>
                      <td>{r.reporter}</td>
                      <td className="text-muted small">{r.createdAt}</td>
                      <td>
                        <span
                          className={`badge text-bg-${r.status === 'Escalated' ? 'warning' : 'secondary'}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button size="sm" variant="outline-info">
                            <CIcon icon={icons.cilMagnifyingGlass} className="me-1" /> View
                          </Button>
                          <Button size="sm" variant="outline-success">
                            <CIcon icon={icons.cilThumbUp} className="me-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline-danger">
                            <CIcon icon={icons.cilTrash} className="me-1" /> Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body> */}

            <Card.Body className="pt-0">
              <Tabs defaultActiveKey="reports" className="mb-3">
                <Tab eventKey="reports" title="Reports">
                  <ReportsPanel />
                </Tab>

                <Tab eventKey="appeals" title="Appeals">
                  <AppealsPanel />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </div>

        {/* <div className="col-lg-5">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-0">
              <h6 className="mb-0">System Status</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted">API</span>
                <span className="badge text-bg-success">Operational</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted">WebSocket</span>
                <span className="badge text-bg-success">Connected</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted">DB latency</span>
                <span>12 ms</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted">Error rate</span>
                <span className="text-success">0.12%</span>
              </div>
            </Card.Body>
          </Card>
        </div> */}
      </div>

      {/* Bottom Row: Top Posts + Recent Users */}
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0">
              <h6 className="mb-0">Top Posts</h6>
            </Card.Header>
            <Card.Body className="pt-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Post ID</th>
                    <th>Author</th>
                    <th className="text-end">Likes</th>
                    <th className="text-end">Comments</th>
                    <th className="text-end">Saves</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.postId}>
                      <td>
                        <code>{p.postId}</code>
                      </td>
                      <td>{p.userName}</td>
                      <td className="text-end">{p.likeCount}</td>
                      <td className="text-end">{p.commentCount}</td>
                      <td className="text-end">{p.saveCount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-5">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0">
              <h6 className="mb-0">Recent Users</h6>
            </Card.Header>
            <Card.Body className="pt-2">
              <div className="d-flex flex-column gap-3">
                {users.map((u, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <Initials name={u.name} />
                      <div>
                        <div className="fw-semibold">{u.name}</div>
                        <div className="text-muted small">{u.email}</div>
                      </div>
                    </div>
                    {/* <Button size="sm" variant="outline-secondary">
                      <CIcon icon={icons.cilUser} className="me-1" /> View
                    </Button> */}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}
