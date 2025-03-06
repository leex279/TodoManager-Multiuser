import React from 'react';
import TodoList from '@/components/todo-list';

export default function AllTodos({ user }) {
  return (
    <div>
      <TodoList currentUser={user} />
    </div>
  );
}
