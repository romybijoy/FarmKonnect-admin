import React from "react";
import ReactPaginate from "react-paginate";
import './pagination.css'

const Pagination = ({ countPagination, page, handlePageClick }) => {
  return (
    <div className="paginationDiv">
      {countPagination > 1 && (
        <ReactPaginate
          forcePage={page}
          previousLabel={"Prev"}
          nextLabel={"Next"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={countPagination}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination flex-wrap"}
          subContainerClassName={"pages pagination"}
          activeClassName={"active"}
        />
      )}
    </div>
  );
};
export default Pagination;