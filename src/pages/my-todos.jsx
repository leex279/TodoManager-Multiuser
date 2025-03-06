import React from 'react';
import TodoList from '@/components/todo-list';

export default function MyTodos({ user }) {
  return (
    <div>
      <TodoList userId={user?.id} currentUser={user} />
    </div>
  );
}
