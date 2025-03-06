import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Todo functions
export async function fetchTodos(userId = null) {
  let query = supabase
    .from('todos')
    .select('*, assigned_to(id, email)')
    .order('due_date', { ascending: true })
  
  if (userId) {
    query = query.eq('assigned_to', userId)
  }
  
  const { data, error } = await query
  return { data, error }
}

export async function createTodo(todo) {
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select()
  
  return { data, error }
}

export async function updateTodo(id, updates) {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
  
  return { data, error }
}

export async function deleteTodo(id) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
  
  return { error }
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
  
  return { data, error }
}

// Subscribe to realtime changes
export function subscribeToTodos(callback) {
  return supabase
    .channel('todos-channel')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'todos' 
    }, callback)
    .subscribe()
}
