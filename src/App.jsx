// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Admin, Chart1, Login, Syncfusion } from './pages';
import ProtectedRoute from './ProtectedRoute/PrivateRoute';
import PublicRoute from './ProtectedRoute/PublicRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute/>}>
          <Route path="/" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path='/syncfusion' element={<Syncfusion />} />     
          <Route path='/chart1' element={<Chart1/>} />     
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
