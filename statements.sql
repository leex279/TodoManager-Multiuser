-- Create profiles table to store user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up Row Level Security (RLS) for todos table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy for viewing todos (users can see their own todos and todos assigned to them)
CREATE POLICY "Users can view their own todos and all todos" ON todos
  FOR SELECT USING (true);

-- Policy for inserting todos (authenticated users can create todos)
CREATE POLICY "Users can create todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for updating todos (users can update their own todos)
CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = assigned_to);

-- Policy for deleting todos (users can delete their own todos)
CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = assigned_to);

-- Set up RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for viewing profiles (all authenticated users can view profiles)
CREATE POLICY "Profiles are viewable by all authenticated users" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy for updating profiles (users can only update their own profile)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Enable realtime subscriptions for todos
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
