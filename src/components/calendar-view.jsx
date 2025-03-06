import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchTodos } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function CalendarView({ currentUser }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todosForSelectedDate, setTodosForSelectedDate] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchTodos();
        if (error) throw error;
        setTodos(data || []);
      } catch (err) {
        console.error('Error loading todos for calendar:', err);
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Function to check if a date has todos
  const hasTodos = (date) => {
    return todos.some(todo => {
      if (!todo.due_date) return false;
      const todoDate = new Date(todo.due_date);
      return (
        todoDate.getDate() === date.getDate() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Function to get todos for a specific date
  const getTodosForDate = (date) => {
    return todos.filter(todo => {
      if (!todo.due_date) return false;
      const todoDate = new Date(todo.due_date);
      return (
        todoDate.getDate() === date.getDate() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const todosForDate = getTodosForDate(date);
    setTodosForSelectedDate(todosForDate);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading calendar...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Calendar View</h2>
      
      <div className="border rounded-lg p-4 bg-white">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="mx-auto"
          modifiers={{
            hasTodos: (date) => hasTodos(date),
          }}
          modifiersStyles={{
            hasTodos: {
              fontWeight: 'bold',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '100%',
            }
          }}
        />
      </div>

      {/* Dialog to show todos for selected date */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Todos for {formatDate(selectedDate)}</DialogTitle>
          </DialogHeader>
          
          {todosForSelectedDate.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No todos for this date.</p>
          ) : (
            <div className="space-y-3 mt-2">
              {todosForSelectedDate.map(todo => (
                <div key={todo.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {todo.assigned_to?.email}
                    </span>
                  </div>
                  {todo.description && (
                    <p className="text-sm mt-1 text-gray-600">{todo.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
