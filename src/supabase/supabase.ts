import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miyxjuwgtmwuzhlaavjt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peXhqdXdndG13dXpobGFhdmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTczOTksImV4cCI6MjA2NDY3MzM5OX0.WVU50n3J2II1Uh02_ETTNgV6N73hSRlvkKzZNdVikY0';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type definitions for users
export interface Student {
  id: string;
  email: string;
  full_name: string;
  role: 'student';
  created_at: string;
  faculty: string | null;
  program: string | null;
  courses: string[] | null;
}

export interface Lecturer {
  id: string;
  email: string;
  full_name: string;
  role: 'lecturer';
  created_at: string;
}