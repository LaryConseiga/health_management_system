import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Users, Calendar, Receipt, Activity,
    UserPlus, CalendarPlus, FileText,
    TrendingUp, Clock, CheckCircle,
    ArrowRight, Stethoscope, Edit3, X
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        pendingInvoices: 0,
        completedAppointments: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConsultationModal, setShowConsultationModal] = useState(false);
    const [selectedPatientForConsultation, setSelectedPatientForConsultation] = useState(null);
    const [consultationForm, setConsultationForm] = useState({
        notes: '',
        diagnosis: '',
        prescription: '',
        followUpDate: ''
    });

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Ne pas charger billing si c'est un docteur
            const isDoctor = user?.role === 'doctor';
            
            const requests = [
                axios.get(`${API_URL}/patients`, { headers }),
                axios.get(`${API_URL}/appointments`, { headers })
            ];

            if (!isDoctor) {
                requests.push(axios.get(`${API_URL}/billing`, { headers }));
            }

            const results = await Promise.all(requests);
            const patients = results[0].data;
            const appointments = results[1].data;
            const invoices = isDoctor ? [] : results[2].data;

            // Calculate stats
            const today = new Date().toDateString();
            const todayAppointments = appointments.filter(a =>
                new Date(a.date).toDateString() === today
            );
            const pendingInvoices = invoices.filter(i => i.status === 'Pending');
            const completedAppointments = appointments.filter(a => a.status === 'Completed');

            setStats({
                totalPatients: patients.length,
                todayAppointments: todayAppointments.length,
                pendingInvoices: pendingInvoices.length,
                completedAppointments: completedAppointments.length
            });

            // Get recent patients (last 5)
            setRecentPatients(patients.slice(-5).reverse());

            // Get upcoming appointments
            const upcoming = appointments
                .filter(a => new Date(a.date) >= new Date() && a.status === 'Scheduled')
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5);
            setUpcomingAppointments(upcoming);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les statCards selon le rôle
    const allStatCards = [
        { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'blue', link: '/patients' },
        { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'purple', link: '/appointments' },
        { label: 'Pending Invoices', value: stats.pendingInvoices, icon: Receipt, color: 'yellow', link: '/billing', roles: ['admin', 'staff'] },
        { label: 'Completed Visits', value: stats.completedAppointments, icon: CheckCircle, color: 'green', link: '/appointments' }
    ];

    const statCards = allStatCards.filter(card => {
        if (card.roles) {
            return card.roles.includes(user?.role);
        }
        return true;
    });

    // Filtrer les quickActions selon le rôle
    const allQuickActions = [
        { label: 'Add Patient', icon: UserPlus, link: '/patients', color: 'blue' },
        { label: 'Schedule Appointment', icon: CalendarPlus, link: '/appointments', color: 'purple' },
        { label: 'Create Invoice', icon: FileText, link: '/billing', color: 'green', roles: ['admin', 'staff'] }
    ];

    const quickActions = allQuickActions.filter(action => {
        if (action.roles) {
            return action.roles.includes(user?.role);
        }
        return true;
    });

    const handleOpenConsultationModal = (patient) => {
        setSelectedPatientForConsultation(patient);
        setConsultationForm({
            notes: '',
            diagnosis: '',
            prescription: '',
            followUpDate: ''
        });
        setShowConsultationModal(true);
    };

    const handleSubmitConsultation = async (e) => {
        e.preventDefault();
        if (!selectedPatientForConsultation || !consultationForm.notes.trim()) {
            alert('Veuillez remplir au moins les notes de consultation');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/patients/${selectedPatientForConsultation._id}/consultation-notes`,
                consultationForm,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            alert('Notes de consultation ajoutées avec succès');
            setShowConsultationModal(false);
            setSelectedPatientForConsultation(null);
            fetchDashboardData(); // Rafraîchir les données
        } catch (err) {
            console.error('Error adding consultation notes:', err);
            alert('Erreur lors de l\'ajout des notes: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
        }
    };

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            green: 'bg-green-100 text-green-600'
        };
        return colors[color] || colors.blue;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            Welcome back, {user?.name || 'User'}! 👋
                        </h1>
                        <p className="text-blue-100">
                            Here's what's happening with your healthcare system today.
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                        <Activity className="w-5 h-5" />
                        <span className="font-medium capitalize">{user?.role || 'Admin'}</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid - Ajuster le nombre de colonnes selon le rôle */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${user?.role === 'doctor' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={stat.link}
                                className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? '...' : stat.value}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow p-6"
            >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className={`grid grid-cols-1 ${user?.role === 'doctor' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.label}
                                to={action.link}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-colors group`}
                            >
                                <div className={`p-2 rounded-lg ${getColorClasses(action.color)}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                    {action.label}
                                </span>
                                <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600" />
                            </Link>
                        );
                    })}
                </div>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                        <Link to="/appointments" className="text-sm text-blue-600 hover:text-blue-700">
                            View all →
                        </Link>
                    </div>
                    {loading ? (
                        <p className="text-gray-500 text-center py-4">Loading...</p>
                    ) : upcomingAppointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingAppointments.map((apt) => (
                                <div
                                    key={apt._id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Clock className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {apt.patient?.name || 'Unknown Patient'}
                                        </p>
                                        <p className="text-sm text-gray-500">{formatDate(apt.date)}</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Patients - Avec bouton consultation pour docteur */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl shadow p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Patients</h2>
                        <Link to="/patients" className="text-sm text-blue-600 hover:text-blue-700">
                            View all →
                        </Link>
                    </div>
                    {loading ? (
                        <p className="text-gray-500 text-center py-4">Loading...</p>
                    ) : recentPatients.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No patients yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentPatients.map((patient) => (
                                <div
                                    key={patient._id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">
                                            {patient.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{patient.name}</p>
                                        <p className="text-sm text-gray-500">{patient.contact}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{patient.age} yrs</span>
                                        {user?.role === 'doctor' && (
                                            <button
                                                onClick={() => handleOpenConsultationModal(patient)}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Ajouter notes de consultation"
                                            >
                                                <Stethoscope className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Modal pour notes de consultation (Docteur uniquement) */}
            {showConsultationModal && selectedPatientForConsultation && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowConsultationModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Notes de Consultation
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Patient: {selectedPatientForConsultation.name}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowConsultationModal(false)} 
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitConsultation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes de consultation *
                                </label>
                                <textarea
                                    required
                                    value={consultationForm.notes}
                                    onChange={(e) => setConsultationForm({ ...consultationForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    rows="4"
                                    placeholder="Décrivez la consultation, les symptômes, les observations..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Diagnostic
                                </label>
                                <input
                                    type="text"
                                    value={consultationForm.diagnosis}
                                    onChange={(e) => setConsultationForm({ ...consultationForm, diagnosis: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Diagnostic posé..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prescription
                                </label>
                                <textarea
                                    value={consultationForm.prescription}
                                    onChange={(e) => setConsultationForm({ ...consultationForm, prescription: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                    placeholder="Médicaments prescrits, posologie..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de suivi (optionnel)
                                </label>
                                <input
                                    type="date"
                                    value={consultationForm.followUpDate}
                                    onChange={(e) => setConsultationForm({ ...consultationForm, followUpDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowConsultationModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Enregistrer les notes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
