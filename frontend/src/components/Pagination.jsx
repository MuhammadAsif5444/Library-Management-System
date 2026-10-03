function Pagination({
  pagination,
  onPageChange,
}) {
  if (!pagination || pagination.total_pages <= 1) {
    return null;
  }

  const pages = [];

  for (
    let page = 1;
    page <= pagination.total_pages;
    page++
  ) {
    pages.push(page);
  }

  return (
    <div className="pagination">
      <button
        onClick={() =>
          onPageChange(pagination.page - 1)
        }
        disabled={!pagination.has_previous}
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() =>
            onPageChange(page)
          }
          className={
            page === pagination.page
              ? "active-page"
              : ""
          }
        >
          {page}
        </button>
      ))}

      <button
        onClick={() =>
          onPageChange(pagination.page + 1)
        }
        disabled={!pagination.has_next}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;