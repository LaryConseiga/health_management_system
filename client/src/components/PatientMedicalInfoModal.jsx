import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const PatientMedicalInfoModal = ({ isOpen, onClose, patientInfo, loading }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Your Medical Information</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading...</p>
                ) : patientInfo ? (
                    <div className="space-y-6">
                        {/* Personal Info */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium text-gray-900">{patientInfo.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="font-medium text-gray-900">{patientInfo.age} years</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Gender</p>
                                    <p className="font-medium text-gray-900">{patientInfo.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Contact</p>
                                    <p className="font-medium text-gray-900">{patientInfo.contact}</p>
                                </div>
                            </div>
                        </div>

                        {/* Medical History */}
                        {patientInfo.medicalHistory && patientInfo.medicalHistory.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Medical History</h4>
                                <ul className="space-y-2">
                                    {patientInfo.medicalHistory.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                                            <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                            <span className="text-gray-800">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Consultation Notes */}
                        {patientInfo.consultationNotes && patientInfo.consultationNotes.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Recent Consultations</h4>
                                <div className="space-y-3">
                                    {patientInfo.consultationNotes.slice(0, 5).map((note, i) => (
                                        <div key={i} className="border-l-4 border-blue-500 p-3 bg-blue-50 rounded">
                                            <p className="text-sm text-gray-600">{new Date(note.date).toLocaleDateString()}</p>
                                            <p className="font-medium text-gray-900 mt-1">{note.notes}</p>
                                            {note.diagnosis && <p className="text-sm text-gray-700 mt-1"><strong>Diagnosis:</strong> {note.diagnosis}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No medical information available</p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default PatientMedicalInfoModal;
