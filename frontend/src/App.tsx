import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { useAuth } from './lib/store';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Engineers from './pages/Engineers';
import Assignments from './pages/Assignments';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route 
            path="projects" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Projects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="engineers" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Engineers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="assignments" 
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App; 