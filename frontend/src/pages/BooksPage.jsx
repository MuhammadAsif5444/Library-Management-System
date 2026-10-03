import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
const [books, setBooks] = useState([]);

const [pagination, setPagination] = useState(null);

const [search, setSearch] = useState("");

const [status, setStatus] = useState("");

const [sortBy, setSortBy] = useState("title");

const [sortOrder, setSortOrder] =
  useState("asc");

const [page, setPage] = useState(1);

const [loading, setLoading] =
  useState(false);

const fetchBooks = async () => {
  try {
    setLoading(true);

    const response = await axios.get(
      "http://127.0.0.1:5000/api/books/",
      {
        params: {
          page,
          per_page: 10,
          search,
          status,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      }
    );

    setBooks(response.data.books);

    setPagination(
      response.data.pagination
    );
  } catch (error) {
    console.error(
      "Error loading books:",
      error
    );
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchBooks();
}, [
  page,
  status,
  sortBy,
  sortOrder,
]);
const handleSearch = () => {
  setPage(1);
  fetchBooks();
};
<div className="page-filters">

  <input
    type="text"
    placeholder="Search books..."
    value={search}
    onChange={(event) =>
      setSearch(event.target.value)
    }
  />

  <select
    value={status}
    onChange={(event) => {
      setStatus(event.target.value);
      setPage(1);
    }}
  >
    <option value="">
      All Status
    </option>

    <option value="AVAILABLE">
      Available
    </option>

    <option value="UNAVAILABLE">
      Unavailable
    </option>

    <option value="INACTIVE">
      Inactive
    </option>
  </select>

  <select
    value={sortBy}
    onChange={(event) => {
      setSortBy(event.target.value);
      setPage(1);
    }}
  >
    <option value="title">
      Title
    </option>

    <option value="publication_year">
      Publication Year
    </option>

    <option value="total_copies">
      Total Copies
    </option>

    <option value="available_copies">
      Available Copies
    </option>
  </select>

  <select
    value={sortOrder}
    onChange={(event) => {
      setSortOrder(event.target.value);
      setPage(1);
    }}
  >
    <option value="asc">
      Ascending
    </option>

    <option value="desc">
      Descending
    </option>
  </select>

  <button
    onClick={handleSearch}
  >
    Search
  </button>

</div>
{loading ? (
  <p>Loading books...</p>
) : (
  <Pagination
    pagination={pagination}
    onPageChange={setPage}
  />
)}