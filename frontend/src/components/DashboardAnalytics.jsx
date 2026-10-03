import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import "./DashboardAnalytics.css";


function DashboardAnalytics({ analytics }) {

  if (!analytics) {
    return <p>Loading analytics...</p>;
  }

  const { categories, popular_books } = analytics;


  return (

    <div className="analytics-container">

      <div className="analytics-card">

        <h3>Books by Category</h3>

        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={categories}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="books"
              name="Books"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>


      <div className="analytics-card">

        <h3>Most Borrowed Books</h3>

        <ResponsiveContainer width="100%" height={300}>

          <PieChart>

            <Pie
              data={popular_books}
              dataKey="borrow_count"
              nameKey="title"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >

              {popular_books.map((entry, index) => (

                <Cell key={`cell-${index}`} />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}


export default DashboardAnalytics;