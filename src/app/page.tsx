import React from 'react';
import AppLayout from '@/components/AppLayout';
import EmergencyDashboardContent from './components/EmergencyDashboardContent';

export default function EmergencyAlertDashboardPage() {
  return (
    <AppLayout>
      <EmergencyDashboardContent />
    </AppLayout>
  );
}