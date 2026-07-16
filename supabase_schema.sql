-- 1. Create Incidents Table
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    rca_report JSONB NOT NULL,
    confidence NUMERIC,
    mtti TEXT,
    blast_radius_nodes JSONB,
    timeline_events JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security (RLS) for Incidents
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to SELECT incidents (Both Admin and SRE need to view them)
CREATE POLICY "Allow authenticated read access to incidents" 
ON public.incidents FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only Admins to INSERT incidents (Simulations) or System/SREs depending on rules
CREATE POLICY "Allow authenticated insert access to incidents" 
ON public.incidents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Create Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    user_role TEXT NOT NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin' );

-- Anyone authenticated can insert their own audit logs
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Optional: Block UPDATE and DELETE on audit logs so they are immutable
CREATE POLICY "Block updates to audit logs" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY "Block deletes to audit logs" ON public.audit_logs FOR DELETE USING (false);
