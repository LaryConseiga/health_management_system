import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookAppointmentModal from '../components/BookAppointmentModal';

const API_URL = 'http://localhost:5000/api';

const BookAppointment = () => {
    const { user } = useAuth();
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAvailableDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAvailableDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/auth/doctors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableDoctors(res.data || []);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [year, month, day] = formData.date.split('-');
            const appointmentDate = new Date(year, month - 1, day);
            const timeParts = formData.time.split(':');
            appointmentDate.setHours(timeParts[0], timeParts[1]);

            await axios.post(
                `${API_URL}/appointments`,
                {
                    doctorId: formData.doctorId,
                    date: appointmentDate.toISOString(),
                    reason: formData.reason
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Rendez-vous réservé avec succès');
            setShowModal(false);
        } catch (err) {
            console.error('Error booking appointment:', err);
            alert('Erreur lors de la réservation: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Book an Appointment</h1>
            <p className="text-gray-600 mb-6">Schedule a consultation with one of our specialists.</p>
            <BookAppointmentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                availableDoctors={availableDoctors}
                onSubmit={handleSubmit}
                loading={loading}
            />
            {!showModal && (
                <p className="text-gray-700">Votre rendez-vous a été créé. Retournez au tableau de bord pour voir vos rendez-vous.</p>
            )}
        </div>
    );
};

export default BookAppointment;
