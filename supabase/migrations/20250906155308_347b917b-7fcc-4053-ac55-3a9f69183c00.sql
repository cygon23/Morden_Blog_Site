-- Add foreign key relationship between blogs and profiles
ALTER TABLE public.blogs 
ADD CONSTRAINT blogs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Create an index for better performance on the foreign key
CREATE INDEX IF NOT EXISTS idx_blogs_user_id ON public.blogs(user_id);