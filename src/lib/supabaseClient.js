
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cusbmtfemtkdizclqzpb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c2JtdGZlbXRrZGl6Y2xxenBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTg5NDUsImV4cCI6MjA2NTk5NDk0NX0.QcJY2Vm0p3R3YIFt59nMGI59eKRJ-JcMQPKS0ltItPg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
