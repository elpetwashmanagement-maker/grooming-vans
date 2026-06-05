import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://piqrlkxxcmqywzyokvml.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcXJsa3h4Y21xeXd6eW9rdm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTM2NDUsImV4cCI6MjA5NjE4OTY0NX0.YVMkuSEq-ChhbtlX_yBvBnJYdXxwXLXCWJMDu47JdiQ';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
