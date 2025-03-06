import React, { useState, useEffect } from 'react';
import TodoItem from '@/components/todo-item';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TodoForm from '@/components/todo-form';
import { fetchTodos, subscribeToTodos } from '@/lib/supabase';
import { Plus } from 'lucide-react';

export default function TodoList({ userId = null, currentUser }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchTodos(userId);
        if (error) throw error;
        setTodos(data || []);
      } catch (err) {
        console.error('Error loading todos:', err);
        setError('Failed to load todos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTodos();

    // Subscribe to realtime updates
    const subscription = subscribeToTodos((payload) => {
      if (payload.eventType === 'INSERT') {
        // Only add if it matches our filter
        if (!userId || payload.new.assigned_to === userId) {
          setTodos(prev => [payload.new, ...prev]);
        }
      } else if (payload.eventType === 'UPDATE') {
        setTodos(prev => 
          prev.map(todo => 
            todo.id === payload.new.id ? payload.new : todo
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setTodos(prev => 
          prev.filter(todo => todo.id !== payload.old.id)
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const handleAddSuccess = (newTodo) => {
    setIsAddDialogOpen(false);
    // The realtime subscription should handle adding the todo
  };

  const handleUpdate = (updatedTodo) => {
    // The realtime subscription should handle updating the todo
  };

  const handleDelete = (todoId) => {
    // The realtime subscription should handle removing the todo
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading todos...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {userId ? 'My Todos' : 'All Todos'}
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Todo
        </Button>
      </div>

      {todos.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No todos found. Create one to get started!</p>
        </div>
      ) : (
        <div>
          {todos.map(todo => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onUpdate={handleUpdate} 
              onDelete={handleDelete}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Add Todo Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Todo</DialogTitle>
          </DialogHeader>
          <TodoForm 
            onSuccess={handleAddSuccess} 
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
