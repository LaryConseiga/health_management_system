import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Users, Calendar, Receipt, Activity,
    UserPlus, CalendarPlus, FileText,
    TrendingUp, Clock, CheckCircle,
    ArrowRight, Stethoscope, Edit3, X, Save,
    Heart, FileUp, AlertCircle, MapPin, Phone
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
    const { user } = useAuth();
    const isPatient = user?.role === 'patient';
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
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [availability, setAvailability] = useState({});
    const [tempAvailability, setTempAvailability] = useState({});
   const [patientInfo, setPatientInfo] = useState(null);
   const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
   const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
   const [availableDoctors, setAvailableDoctors] = useState([]);
   const [appointmentForm, setAppointmentForm] = useState({
       doctorId: '',
       date: '',
       time: '09:00',
       reason: ''
   });

    useEffect(() => {
        if (user) {
            fetchDashboardData();
            if (user.role === 'doctor') {
                fetchUserAvailability();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

       const fetchPatientInfo = async () => {
           try {
               const token = localStorage.getItem('token');
               const response = await axios.get(`${API_URL}/patients/my-info`, {
                   headers: { Authorization: `Bearer ${token}` }
               });
               setPatientInfo(response.data);
           } catch (err) {
               console.error('Error fetching patient info:', err);
           }
       };

       const fetchAvailableDoctors = async () => {
           try {
               const token = localStorage.getItem('token');
               const response = await axios.get(`${API_URL}/auth/doctors`, {
                   headers: { Authorization: `Bearer ${token}` }
               });
               setAvailableDoctors(response.data);
           } catch (err) {
               console.error('Error fetching doctors:', err);
           }
       };
    const fetchUserAvailability = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/patients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Récupérer la disponibilité depuis le contexte utilisateur si disponible
            if (user?.availability) {
                setAvailability(user.availability);
                setTempAvailability(JSON.parse(JSON.stringify(user.availability)));
            }
        } catch (err) {
            console.error('Error fetching availability:', err);
        }
    };

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

    const handleOpenAvailabilityModal = () => {
        setTempAvailability(JSON.parse(JSON.stringify(availability)));
        setShowAvailabilityModal(true);
    };

    const handleSaveAvailability = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/auth/availability`,
                { availability: tempAvailability },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAvailability(tempAvailability);
            setShowAvailabilityModal(false);
            alert('Disponibilité mise à jour avec succès');
        } catch (err) {
            console.error('Error updating availability:', err);
            alert('Erreur lors de la mise à jour: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAvailabilityChange = (day, field, value) => {
        setTempAvailability({
            ...tempAvailability,
            [day]: {
                ...tempAvailability[day],
                [field]: value
            }
        });
    };

       const handleOpenMedicalHistoryModal = async () => {
           await fetchPatientInfo();
           setShowMedicalHistoryModal(true);
       };

       const handleOpenBookAppointmentModal = async () => {
           await fetchAvailableDoctors();
           setShowBookAppointmentModal(true);
       };

       const handleBookAppointment = async (e) => {
           e.preventDefault();
           if (!appointmentForm.doctorId || !appointmentForm.date || !appointmentForm.reason.trim()) {
               alert('Veuillez remplir tous les champs');
               return;
           }

           try {
               const token = localStorage.getItem('token');
               const [year, month, day] = appointmentForm.date.split('-');
               const appointmentDate = new Date(year, month - 1, day);
               appointmentDate.setHours(appointmentForm.time.split(':')[0], appointmentForm.time.split(':')[1]);

               await axios.post(
                   `${API_URL}/appointments`,
                   {
                       doctorId: appointmentForm.doctorId,
                       date: appointmentDate.toISOString(),
                       reason: appointmentForm.reason
                   },
                   { headers: { Authorization: `Bearer ${token}` } }
               );
               alert('Rendez-vous réservé avec succès!');
               setShowBookAppointmentModal(false);
               setAppointmentForm({ doctorId: '', date: '', time: '09:00', reason: '' });
               fetchDashboardData();
           } catch (err) {
               console.error('Error booking appointment:', err);
               alert('Erreur lors de la réservation: ' + (err.response?.data?.message || err.message));
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
                className="bg-gradient-to-r from-blue-600 to-blue-600 rounded-2xl p-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            Welcome back, {user?.name || 'User'}! 
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

            {/* Stats Grid - Ajuster le nombre de colonnes selon le rôle (masqué pour patients) */}
            {!isPatient && (
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
            )}

            {/* Quick Actions (masqué pour patients) */}
            {!isPatient && (
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
            )}

               {/* Medical Information & Appointments - Pour Patient uniquement */}
               {user?.role === 'patient' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {/* Medical Information Card */}
                       <motion.div
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.5 }}
                           className="bg-white rounded-xl shadow p-6"
                       >
                           <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-3">
                                   <div className="p-3 bg-red-100 rounded-lg">
                                       <Heart className="w-6 h-6 text-red-600" />
                                   </div>
                                   <h2 className="text-lg font-semibold text-gray-800">Medical Information</h2>
                               </div>
                               <button
                                   onClick={handleOpenMedicalHistoryModal}
                                   className="text-blue-600 hover:text-blue-700 transition"
                               >
                                   <Edit3 className="w-5 h-5" />
                               </button>
                           </div>
                           <p className="text-gray-600 text-sm mb-4">
                               View your complete medical history, consultations, and health records
                           </p>
                           <button
                               onClick={handleOpenMedicalHistoryModal}
                               className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                           >
                               View Medical Records
                           </button>
                       </motion.div>

                       {/* Book Appointment Card */}
                       <motion.div
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.5 }}
                           className="bg-white rounded-xl shadow p-6"
                       >
                           <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-3">
                                   <div className="p-3 bg-blue-100 rounded-lg">
                                       <Calendar className="w-6 h-6 text-blue-600" />
                                   </div>
                                   <h2 className="text-lg font-semibold text-gray-800">Book Appointment</h2>
                               </div>
                           </div>
                           <p className="text-gray-600 text-sm mb-4">
                               Schedule a consultation with one of our specialists
                           </p>
                           <button
                               onClick={handleOpenBookAppointmentModal}
                               className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                           >
                               <CalendarPlus className="w-5 h-5" />
                               Schedule Now
                           </button>
                       </motion.div>
                   </div>
               )}
            {/* Availability Section - Pour Docteur uniquement */}
            {user?.role === 'doctor' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Your Availability</h2>
                        <button
                            onClick={handleOpenAvailabilityModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Schedule
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(availability).map(([day, info]) => (
                            <div
                                key={day}
                                className={`p-3 rounded-lg text-sm ${
                                    info.available
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50 border border-gray-200'
                                }`}
                            >
                                <p className="font-medium text-gray-900">{day}</p>
                                {info.available ? (
                                    <p className="text-xs text-green-600 mt-1">
                                        {info.startTime} - {info.endTime}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Not available</p>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

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

                {/* Recent Patients - Avec bouton consultation pour docteur (masqué pour patients) */}
                {!isPatient && (
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
                )}
            </div>

            {/* Modal pour modifier disponibilité (Docteur) */}
            {showAvailabilityModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowAvailabilityModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Edit Your Schedule</h3>
                            <button 
                                onClick={() => setShowAvailabilityModal(false)} 
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(tempAvailability).map(([day, info]) => (
                                <div key={day} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-800">{day}</h4>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={info.available}
                                                onChange={(e) =>
                                                    handleAvailabilityChange(day, 'available', e.target.checked)
                                                }
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-gray-700">Available</span>
                                        </label>
                                    </div>
                                    {info.available && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Start Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={info.startTime}
                                                    onChange={(e) =>
                                                        handleAvailabilityChange(day, 'startTime', e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    End Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={info.endTime}
                                                    onChange={(e) =>
                                                        handleAvailabilityChange(day, 'endTime', e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                            <button
                                onClick={() => setShowAvailabilityModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAvailability}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

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
