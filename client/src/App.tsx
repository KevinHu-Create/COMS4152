import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { isLoggedIn } from './api'
import { Login } from "./components/login/login";
import { EventList } from './components/event-list/EventList'
import { EditEvent } from './components/event-list/EditEvent'
import { Evaluation } from './components/evaluation/Evalutation'
import { PresenterFeedback } from './components/result/PresenterFeedback';
import { AdminEventResults } from './components/result/AdminResultsView';
import { NewCourse } from './components/course/NewCourse';
import { CourseMembers } from './components/course/CourseMembers';

// Start each page at the top, like a normal page load.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Pages behind this need a signed-in user; everyone else goes to the login page.
function RequireAuth({ children }: { children: ReactNode }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/events' element={<RequireAuth><EventList /></RequireAuth>} />
        <Route path='/event/edit/:id' element={<RequireAuth><EditEvent /></RequireAuth>} />
        <Route path='/evaluation/:id' element={<RequireAuth><Evaluation /></RequireAuth>} />
        <Route path='/feedback' element={<RequireAuth><PresenterFeedback /></RequireAuth>} />
        <Route path='/admin/results/:id' element={<RequireAuth><AdminEventResults /></RequireAuth>} />
        <Route path='/courses/new' element={<RequireAuth><NewCourse /></RequireAuth>} />
        <Route path='/courses/:id/members' element={<RequireAuth><CourseMembers /></RequireAuth>} />
      </Routes>
    </Router>
  )
}

export default App;
