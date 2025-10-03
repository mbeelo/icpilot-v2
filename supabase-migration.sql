-- ICP Pilot Database Schema Migration for Supabase
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  subscription_status TEXT DEFAULT 'active'::text,
  subscription_tier TEXT DEFAULT 'free'::text,
  stripe_customer_id TEXT,
  usage_count INTEGER DEFAULT 0,
  usage_reset_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, (DATE_TRUNC('month'::text, NOW()) + '1 month'::interval))
);

-- Create ICPs table
CREATE TABLE IF NOT EXISTS public.icps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  role TEXT,
  pain_points TEXT[],
  outcomes TEXT[],
  triggers TEXT[],
  company_name TEXT,
  product_service TEXT,
  value_proposition TEXT,
  key_differentiators TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create outputs table
CREATE TABLE IF NOT EXISTS public.outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  icp_id UUID REFERENCES public.icps(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for ICPs table
CREATE POLICY "Users can view own ICPs" ON public.icps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ICPs" ON public.icps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ICPs" ON public.icps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ICPs" ON public.icps FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for outputs table
CREATE POLICY "Users can view own outputs" ON public.outputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outputs" ON public.outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outputs" ON public.outputs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outputs" ON public.outputs FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for usage_logs table
CREATE POLICY "Users can view own usage logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage logs" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET usage_count = usage_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert user record for existing auth user (if sap801@gmail.com exists)
-- This will be handled by the trigger for future signups
DO $$
DECLARE
  auth_user_record RECORD;
BEGIN
  -- Check if there's an auth user with sap801@gmail.com
  SELECT id, email, raw_user_meta_data INTO auth_user_record
  FROM auth.users
  WHERE email = 'sap801@gmail.com'
  LIMIT 1;

  -- If user exists, create profile
  IF FOUND THEN
    INSERT INTO public.users (id, email, name)
    VALUES (
      auth_user_record.id,
      auth_user_record.email,
      COALESCE(
        auth_user_record.raw_user_meta_data->>'name',
        auth_user_record.raw_user_meta_data->>'full_name',
        split_part(auth_user_record.email, '@', 1)
      )
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'User profile created for %', auth_user_record.email;
  ELSE
    RAISE NOTICE 'No auth user found with email sap801@gmail.com';
  END IF;
END $$;