import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import EditTask from './components/EditTask';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end>
              Tasks
            </NavLink>
          </li>
          <li>
            <NavLink to="/add">
              Add Task
            </NavLink>
          </li>
        </ul>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/add" element={<AddTask />} />
          <Route path="/edit/:id" element={<EditTask />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
