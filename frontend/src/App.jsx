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
import EditWord from './pages/EditWord';
import Statistics from './pages/Statistics';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import Friends from './pages/Friends';
import ChatList from './pages/ChatList';
import ChatView from './pages/ChatView';

import RandomGame from './pages/RandomGame';
import HangmanGame from './pages/HangmanGame';
import VisualMemoryGame from './pages/VisualMemoryGame';
import SynAntGame from './pages/SynAntGame';
import ListeningGame from './pages/ListeningGame';
import WritingGame from './pages/WritingGame';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="pt-24 min-h-screen">
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <VocabularyProvider>
        <AiProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/lists" element={<ProtectedRoute><Layout><AllLists /></Layout></ProtectedRoute>} />
              <Route path="/list/:id" element={<ProtectedRoute><Layout><ListWords /></Layout></ProtectedRoute>} />
              <Route path="/create-word" element={<ProtectedRoute><Layout><CreateWord /></Layout></ProtectedRoute>} />
              <Route path="/word/edit/:id" element={<ProtectedRoute><Layout><EditWord /></Layout></ProtectedRoute>} />
              <Route path="/statistics" element={<ProtectedRoute><Layout><Statistics /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><MyProfile /></Layout></ProtectedRoute>} />
              <Route path="/user/:userId" element={<ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>} />
              <Route path="/friends" element={<ProtectedRoute><Layout><Friends /></Layout></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Layout><ChatList /></Layout></ProtectedRoute>} />
              <Route path="/chat/:roomId" element={<ProtectedRoute><Layout><ChatView /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

              <Route path="/games/random" element={<ProtectedRoute><Layout><RandomGame /></Layout></ProtectedRoute>} />
              <Route path="/games/hangman" element={<ProtectedRoute><Layout><HangmanGame /></Layout></ProtectedRoute>} />
              <Route path="/games/visual-memory" element={<ProtectedRoute><Layout><VisualMemoryGame /></Layout></ProtectedRoute>} />
              <Route path="/games/syn-ant" element={<ProtectedRoute><Layout><SynAntGame /></Layout></ProtectedRoute>} />
              <Route path="/games/listening" element={<ProtectedRoute><Layout><ListeningGame /></Layout></ProtectedRoute>} />
              <Route path="/games/writing" element={<ProtectedRoute><Layout><WritingGame /></Layout></ProtectedRoute>} />

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
