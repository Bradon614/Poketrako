import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Signup from './pages/signup';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Intro/>}/>
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  )



}

export default App
