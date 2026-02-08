import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PatientMedicalInfoModal from '../components/PatientMedicalInfoModal';

const API_URL = 'http://localhost:5000/api';

const MedicalRecords = () => {
    const { user } = useAuth();
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(true);

    useEffect(() => {
        fetchPatientInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPatientInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/patients/my-info`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatientInfo(res.data);
        } catch (err) {
            console.error('Error fetching patient info:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">My Medical Records</h1>
            <p className="text-gray-600 mb-6">Consultez vos antécédents médicaux et notes de consultation.</p>
            <PatientMedicalInfoModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                patientInfo={patientInfo}
                loading={loading}
            />
            {!openModal && (
                <div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : patientInfo ? (
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="font-semibold text-lg">{patientInfo.name}</h2>
                            <p className="text-sm text-gray-600">Age: {patientInfo.age || '—'}</p>
                            <p className="text-sm text-gray-600">Contact: {patientInfo.contact || '—'}</p>
                        </div>
                    ) : (
                        <p className="text-gray-600">Aucune information médicale disponible.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;
