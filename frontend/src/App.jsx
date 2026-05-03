import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VocabularyProvider } from './contexts/VocabularyContext';
import { AiProvider } from './contexts/AiContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AllLists from './pages/AllLists';
import ListWords from './pages/ListWords';
import VerifyEmail from './pages/VerifyEmail';
import CreateWord from './pages/CreateWord';

function App() {
  return (
    <AuthProvider>
      <VocabularyProvider>
        <AiProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/lists" element={<ProtectedRoute><AllLists /></ProtectedRoute>} />
              <Route path="/list/:id" element={<ProtectedRoute><ListWords /></ProtectedRoute>} />
              <Route path="/create-word" element={<ProtectedRoute><CreateWord /></ProtectedRoute>} />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AiProvider>
      </VocabularyProvider>
    </AuthProvider>
  );
}

export default App;
