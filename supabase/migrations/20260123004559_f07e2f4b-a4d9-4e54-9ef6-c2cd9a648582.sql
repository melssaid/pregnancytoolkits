-- Anonymous analytics table for tracking tool usage
CREATE TABLE public.tool_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    action_type TEXT NOT NULL DEFAULT 'view',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (no user data, just stats)
CREATE POLICY "Anyone can insert analytics"
ON public.tool_analytics
FOR INSERT
WITH CHECK (true);

-- No one can read/update/delete directly (admin only via service key)
CREATE POLICY "No direct read access"
ON public.tool_analytics
FOR SELECT
USING (false);

-- Index for performance
CREATE INDEX idx_tool_analytics_tool_id ON public.tool_analytics(tool_id);
CREATE INDEX idx_tool_analytics_created_at ON public.tool_analytics(created_at DESC);