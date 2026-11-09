import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Login } from "./components/login/login";
import { EventList } from './components/event-list/EventList'
import { EditEvent } from './components/event-list/EditEvent'
import { Evaluation } from './components/evaluation/Evalutation'
import { PresenterFeedback } from './components/result/PresenterFeedback';
import { AdminEventResults } from './components/result/AdminResultsView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/events' element={<EventList />} />
        <Route path='/event/edit/:id' element={<EditEvent />} />
        <Route path='/evaluation/:id' element={<Evaluation />} />
        <Route path='/feedback' element={<PresenterFeedback />} />
        <Route path='/admin/results/:id' element={<AdminEventResults />} />
      </Routes>
    </Router>
  )
}

export default App;
