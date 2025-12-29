import './App.css'
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import UpcomingMovies from "./pages/UpcomingMovies";
import Home from "./pages/Home";
import MovieSearch from "./components/MovieSearch";

function App() {
  return (
    <BrowserRouter>
      <header className="navbar">
        <div style={{ fontWeight: 600 }}>Movie Explorer</div>
        <ul className="nav-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/movies/upcoming">Upcoming Movies</NavLink></li>
          <li><NavLink to="/search">Search</NavLink></li>
        </ul>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/upcoming" element={<UpcomingMovies />} />
        <Route path="/search" element={<MovieSearch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;