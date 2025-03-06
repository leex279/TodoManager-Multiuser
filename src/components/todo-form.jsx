import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createTodo, updateTodo, fetchUsers } from '@/lib/supabase';

export default function TodoForm({ todo = null, onSuccess, currentUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [assignedTo, setAssignedTo] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '');
      setDescription(todo.description || '');
      setDate(todo.due_date ? new Date(todo.due_date) : null);
      setAssignedTo(todo.assigned_to || null);
    } else {
      setAssignedTo(currentUser?.id || null);
    }

    const loadUsers = async () => {
      const { data, error } = await fetchUsers();
      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      setUsers(data || []);
    };

    loadUsers();
  }, [todo, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const todoData = {
        title,
        description,
        due_date: date,
        assigned_to: assignedTo,
      };

      let result;
      if (todo) {
        result = await updateTodo(todo.id, todoData);
      } else {
        result = await createTodo(todoData);
      }

      if (result.error) {
        throw result.error;
      }

      setTitle('');
      setDescription('');
      setDate(null);
      if (!todo) {
        setAssignedTo(currentUser?.id || null);
      }
      
      if (onSuccess) {
        onSuccess(result.data?.[0]);
      }
    } catch (err) {
      console.error('Error saving todo:', err);
      setError('Failed to save todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due-date">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned-to">Assigned To</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : todo ? 'Update Todo' : 'Create Todo'}
      </Button>
    </form>
  );
}
