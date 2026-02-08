import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Edit2, Trash2, Search, Users, FileText, Download, Upload } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentPatient, setDocumentPatient] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        contact: '',
        address: '',
        medicalHistory: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/patients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data);
        } catch (err) {
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Filtrer pour n'accepter que PDF, JPEG, PNG
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));
        if (validFiles.length !== files.length) {
            alert('Seuls les fichiers PDF, JPEG et PNG sont autorisés');
        }
        setSelectedFiles(validFiles);
    };

    const handleDocumentFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Filtrer pour n'accepter que PDF, JPEG, PNG
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));
        if (validFiles.length !== files.length) {
            alert('Seuls les fichiers PDF, JPEG et PNG sont autorisés');
        }
        setSelectedDocuments(validFiles);
    };

    const openDocumentModal = (patient) => {
        setDocumentPatient(patient);
        setSelectedDocuments([]);
        setShowDocumentModal(true);
    };

    const closeDocumentModal = () => {
        setShowDocumentModal(false);
        setDocumentPatient(null);
        setSelectedDocuments([]);
    };

    const handleAddDocuments = async (e) => {
        e.preventDefault();
        if (!documentPatient || selectedDocuments.length === 0) {
            alert('Veuillez sélectionner au moins un fichier');
            return;
        }

        const token = localStorage.getItem('token');
        const formDataToSend = new FormData();

        // Ajouter les fichiers
        selectedDocuments.forEach((file) => {
            formDataToSend.append('documents', file);
        });

        try {
            await axios.post(`${API_URL}/patients/${documentPatient._id}/documents`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchPatients();
            closeDocumentModal();
            alert('Documents ajoutés avec succès');
        } catch (err) {
            console.error('Error adding documents:', err);
            alert('Erreur lors de l\'ajout des documents: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Créer FormData pour envoyer les fichiers
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('age', formData.age);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('contact', formData.contact);
        formDataToSend.append('address', formData.address || '');
        formDataToSend.append('medicalHistory', formData.medicalHistory || '');

        // Ajouter les fichiers
        selectedFiles.forEach((file) => {
            formDataToSend.append('documents', file);
        });

        try {
            if (editingPatient) {
                await axios.put(`${API_URL}/patients/${editingPatient._id}`, formDataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${API_URL}/patients`, formDataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            fetchPatients();
            closeModal();
        } catch (err) {
            console.error('Error saving patient:', err);
            alert('Error saving patient: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this patient?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/patients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPatients();
        } catch (err) {
            console.error('Error deleting patient:', err);
        }
    };

    const openEditModal = (patient) => {
        setEditingPatient(patient);
        setFormData({
            name: patient.name,
            age: patient.age.toString(),
            gender: patient.gender,
            contact: patient.contact,
            address: patient.address || '',
            medicalHistory: patient.medicalHistory?.join(', ') || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPatient(null);
        setSelectedFiles([]);
        setFormData({ name: '', age: '', gender: 'Male', contact: '', address: '', medicalHistory: '' });
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contact.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    Add Patient
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search patients by name or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading patients...</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {searchTerm ? 'No patients found matching your search.' : 'No patients yet. Click "Add Patient" to create one.'}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Age</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Gender</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Documents</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPatients.map((patient) => (
                                <motion.tr
                                    key={patient._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{patient.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.age}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.gender}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{patient.contact}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {patient.documents && patient.documents.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {patient.documents.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={`http://localhost:5000${doc.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                        title={doc.originalName}
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        <span className="max-w-[100px] truncate">{doc.originalName}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Aucun document</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(patient)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDocumentModal(patient)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Ajouter des documents"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(patient._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                                </h3>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max="150"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                                    <input
                                        type="text"
                                        value={formData.medicalHistory}
                                        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Comma-separated conditions"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Documents (PDF, JPEG, PNG) - Max 10MB par fichier
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {selectedFiles.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    <span>{file.name}</span>
                                                    <span className="text-gray-400">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingPatient ? 'Update' : 'Add Patient'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal pour ajouter des documents */}
            <AnimatePresence>
                {showDocumentModal && documentPatient && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={closeDocumentModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Ajouter des documents - {documentPatient.name}
                                </h3>
                                <button onClick={closeDocumentModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddDocuments} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Documents (PDF, JPEG, PNG) - Max 10MB par fichier
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleDocumentFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    {selectedDocuments.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {selectedDocuments.map((file, index) => (
                                                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    <span>{file.name}</span>
                                                    <span className="text-gray-400">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {documentPatient.documents && documentPatient.documents.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Documents existants ({documentPatient.documents.length})
                                        </label>
                                        <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-50 rounded-lg">
                                            {documentPatient.documents.map((doc, idx) => (
                                                <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                                    <FileText className="w-3 h-3" />
                                                    <span className="truncate">{doc.originalName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeDocumentModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Ajouter les documents
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Patients;
