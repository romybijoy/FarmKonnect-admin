import React from 'react'
import { Image } from 'react-bootstrap'
import './NoDataMsg.css'
import img from '../../assets/images/nodata4.png'

function NodataMsg() {
  return (
    <div>
      <div className="noDataImgDiv">
        <Image className="noDataImg" alt="NoDataImg" src={img} />
      </div>
      <div className="noDataTextDiv">No Data Found</div>
    </div>
  )
}

export default NodataMsg
