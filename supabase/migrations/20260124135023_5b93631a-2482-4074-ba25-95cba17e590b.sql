-- Add constraints to tool_analytics table to prevent abuse

-- Add metadata size limit to prevent storage attacks (max 10KB)
ALTER TABLE public.tool_analytics 
ADD CONSTRAINT metadata_size_limit 
CHECK (pg_column_size(metadata) < 10000);

-- Add tool_id validation to prevent arbitrary data injection
ALTER TABLE public.tool_analytics 
ADD CONSTRAINT valid_tool_id 
CHECK (tool_id ~ '^[a-z0-9_-]{2,50}$');

-- Add session_id length limit
ALTER TABLE public.tool_analytics 
ADD CONSTRAINT valid_session_id 
CHECK (char_length(session_id) <= 100);

-- Add action_type validation
ALTER TABLE public.tool_analytics 
ADD CONSTRAINT valid_action_type 
CHECK (action_type ~ '^[a-z_]{2,50}$');