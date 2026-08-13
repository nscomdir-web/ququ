'use client';
import { useState } from 'react';
import ProfileTab from './components/ProfileTab';
import StudentsTab from './components/StudentsTab';
import TestsTab from './components/TestsTab';
import BookingsTab from './components/BookingsTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Профиль', component: <ProfileTab /> },
    { id: 'students', name: 'Оқушылар', component: <StudentsTab /> },
    { id: 'tests', name: 'Тесттер', component: <TestsTab /> },
    { id: 'bookings', name: 'Брондар', component: <BookingsTab /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Басқару панелі</h1>
      
      {/* Навигация */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div>
        {tabs.find(t => t.id === activeTab)?.component}
      </div>
    </div>
  );
}
