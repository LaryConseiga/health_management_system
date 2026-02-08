import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Acceuil from './pages/Acceuil';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';

function App() {
    return (
        
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/Acceuil" element={<Acceuil />} />
                    <Route path="/About" element={<About />} />
                    <Route path="/Contact" element={<Contact />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/patients" element={<Patients />} />
                            <Route path="/appointments" element={<Appointments />} />
                            <Route path="/billing" element={<Billing />} />
                        </Route>
                    </Route>

                     <Route path="/" element={<Acceuil />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
