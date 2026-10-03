import { useState } from "react";

import "./GlobalSearch.css";


function GlobalSearch() {

  const [query, setQuery] = useState("");

  const [results, setResults] = useState({
    books: [],
    members: [],
    authors: []
  });


  const handleSearch = async (value) => {

    setQuery(value);

    if (!value.trim()) {

      setResults({
        books: [],
        members: [],
        authors: []
      });

      return;
    }

    try {

      const response = await fetch(
        `http://127.0.0.1:5000/api/search/?q=${value}`
      );

      const data = await response.json();

      setResults(data);

    } catch (error) {

      console.error(
        "Search error:",
        error
      );

    }

  };


  return (

    <div className="global-search">

      <input
        type="text"
        placeholder="Search books, members or authors..."
        value={query}
        onChange={(event) =>
          handleSearch(event.target.value)
        }
      />


      {query && (

        <div className="search-results">

          {results.books.length > 0 && (

            <div>

              <h4>Books</h4>

              {results.books.map((book) => (

                <div
                  key={book.book_id}
                  className="search-item"
                >

                  📚 {book.title}

                </div>

              ))}

            </div>

          )}


          {results.members.length > 0 && (

            <div>

              <h4>Members</h4>

              {results.members.map((member) => (

                <div
                  key={member.member_id}
                  className="search-item"
                >

                  👤 {member.name}

                </div>

              ))}

            </div>

          )}


          {results.authors.length > 0 && (

            <div>

              <h4>Authors</h4>

              {results.authors.map((author) => (

                <div
                  key={author.author_id}
                  className="search-item"
                >

                  ✍️ {author.name}

                </div>

              ))}

            </div>

          )}

        </div>

      )}

    </div>

  );

}


export default GlobalSearch;