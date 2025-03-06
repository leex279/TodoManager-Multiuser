import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Clock, MoreVertical, Trash, Edit, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import TodoForm from '@/components/todo-form';
import { updateTodo, deleteTodo } from '@/lib/supabase';

export default function TodoItem({ todo, onUpdate, onDelete, currentUser }) {
  const [isCompleted, setIsCompleted] = useState(todo.is_completed || false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCompletedChange = async () => {
    setLoading(true);
    try {
      const newStatus = !isCompleted;
      const { data, error } = await updateTodo(todo.id, { is_completed: newStatus });
      
      if (error) throw error;
      
      setIsCompleted(newStatus);
      if (onUpdate) onUpdate(data[0]);
    } catch (error) {
      console.error('Error updating todo status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await deleteTodo(todo.id);
      
      if (error) throw error;
      
      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete(todo.id);
    } catch (error) {
      console.error('Error deleting todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = (updatedTodo) => {
    setIsEditDialogOpen(false);
    if (onUpdate) onUpdate(updatedTodo);
  };

  const isAssignedToCurrentUser = todo.assigned_to === currentUser?.id;
  const isPastDue = todo.due_date && new Date(todo.due_date) < new Date() && !isCompleted;

  return (
    <div className={`p-4 border rounded-lg mb-3 ${isCompleted ? 'bg-gray-50' : isPastDue ? 'bg-red-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Checkbox 
            checked={isCompleted} 
            onCheckedChange={handleCompletedChange}
            disabled={loading}
            className="mt-1"
          />
          <div className="flex-1">
            <h3 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                {todo.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {todo.due_date && (
                <div className={`flex items-center text-xs ${isPastDue ? 'text-red-600' : 'text-gray-500'}`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(todo.due_date)}
                </div>
              )}
              {todo.assigned_to && (
                <div className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  {todo.assigned_to.email}
                </div>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          <TodoForm 
            todo={todo} 
            onSuccess={handleEditSuccess} 
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this todo? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
