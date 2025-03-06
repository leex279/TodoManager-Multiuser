import React from 'react';
import CalendarView from '@/components/calendar-view';

export default function CalendarPage({ user }) {
  return (
    <div>
      <CalendarView currentUser={user} />
    </div>
  );
}
