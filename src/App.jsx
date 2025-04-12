// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Admin, Login } from './pages';
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
