import React, { useRef } from 'react'
import { Row, Col } from 'react-bootstrap'
import './cardheader.css'

function CardHeader(props) {
  const { count, title, searchHandler, placeholder, value, hasSearch = false } = props

  return (
    <Row>
      <Col xs={12} sm={6} md={6} lg={3} style={{ margin: 'auto' }}>
        <h3 className="cmnHdName"> {title}</h3>
      </Col>
      <Col xs={12} sm={6} md={6} lg={4} style={{ margin: 'auto' }}>
        {hasSearch && (
          <div className="commonInput">
            <i className="fa fa-search fa-lg cmnSearchIcon"></i>
            <input
              type="text"
              placeholder={placeholder}
              autoFocus
              value={value}
              onChange={(e) => searchHandler(e)}
            />
          </div>
        )}
      </Col>
      <Col xs={12} sm={6} md={6} lg={3}></Col>{' '}
      <Col xs={12} sm={6} md={6} lg={2}>
        <div className="commonRecrd">
          <i className="cui-note cmnRecordIcon"></i>
          <span className="cmnPageCount">{count !== 0 && count !== undefined ? count : 0}</span>
          <span className="cmnResutText">Results</span>
        </div>
      </Col>
    </Row>
  )
}

export default CardHeader
