import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hdrbkhfnkrjygxftyrel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkcmJraGZua3JqeWd4ZnR5cmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzc3NjQsImV4cCI6MjA2NTMxMzc2NH0.9T4_Xw2VZgnNtN4q5zN7kqjhl-LR_CIJPrpteb_MrfU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);