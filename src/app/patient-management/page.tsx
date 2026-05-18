import React from 'react';
import AppLayout from '@/components/AppLayout';
import PatientManagementContent from './components/PatientManagementContent';

export default function PatientManagementPage() {
  return (
    <AppLayout>
      <PatientManagementContent />
    </AppLayout>
  );
}