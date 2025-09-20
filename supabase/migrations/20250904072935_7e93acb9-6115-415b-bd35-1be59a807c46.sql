-- Insert sample blog posts for testing
INSERT INTO public.blogs (title, excerpt, content, category, image_url, status, user_id, published_at, tags) VALUES
(
  'How to Master the Art of Remote Interviews',
  'Remote interviews have become the new standard. Learn how to excel in virtual job interviews and make a lasting impression on potential employers.',
  '# How to Master the Art of Remote Interviews

Remote interviews have become the new standard in today''s job market. With companies embracing remote work culture, mastering virtual interviews is crucial for career success.

## Preparation is Key

Before your remote interview, ensure you have:

- **Stable internet connection**: Test your connection beforehand
- **Professional setup**: Choose a quiet, well-lit space with a clean background
- **Technology check**: Test your camera, microphone, and screen sharing capabilities

## During the Interview

### Body Language Matters
Even through a screen, your body language speaks volumes:
- Maintain eye contact by looking at the camera, not the screen
- Sit up straight and use hand gestures naturally
- Smile and show enthusiasm

### Technical Etiquette
- Join the call 5 minutes early
- Mute yourself when not speaking
- Have a backup plan (phone number) ready

## Common Pitfalls to Avoid

1. **Poor lighting**: Avoid sitting with your back to a window
2. **Distractions**: Turn off notifications and close unnecessary applications
3. **Technical difficulties**: Always have a Plan B

## Conclusion

Remote interviews are here to stay. By following these guidelines, you''ll be well-prepared to showcase your skills and personality through any video platform.',
  'Interview Tips',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
  'published',
  '00000000-0000-4000-8000-000000000001',
  now(),
  ARRAY['remote work', 'interviews', 'career tips']
),
(
  'Building Your Personal Brand in Tech',
  'Your personal brand is your professional reputation. Discover how to build a strong personal brand that opens doors and accelerates your tech career.',
  '# Building Your Personal Brand in Tech

In the competitive tech industry, having strong technical skills isn''t enough. Your personal brand—how you present yourself professionally—can be the differentiator that lands you your dream job.

## What is Personal Branding?

Personal branding is the practice of marketing yourself and your career as brands. It''s about identifying and communicating what makes you unique, relevant, and valuable to your target audience.

## Key Elements of a Strong Tech Personal Brand

### 1. Define Your Niche
- Identify your area of expertise
- Focus on 2-3 key technologies or domains
- Become known for something specific

### 2. Create Quality Content
- Write technical blog posts
- Share insights on LinkedIn
- Contribute to open-source projects
- Speak at conferences or meetups

### 3. Network Strategically
- Attend industry events
- Join tech communities
- Engage with thought leaders
- Mentor junior developers

## Building Your Online Presence

### Professional Social Media
- **LinkedIn**: Share industry insights and achievements
- **Twitter**: Engage in tech discussions and share quick tips
- **GitHub**: Showcase your code and contribute to projects

### Content Creation
- Start a technical blog
- Create educational videos
- Write detailed case studies
- Share lessons learned from projects

## Measuring Your Brand Impact

Track these metrics to gauge your brand''s effectiveness:
- Social media engagement
- Speaking opportunities
- Job offers and inquiries
- Industry recognition

## Common Mistakes to Avoid

1. **Inconsistent messaging**: Keep your brand message uniform across platforms
2. **Over-promotion**: Focus on providing value, not just self-promotion
3. **Neglecting engagement**: Respond to comments and messages promptly

Your personal brand is a long-term investment in your career. Start building it today!',
  'Career Development',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  'published',
  '00000000-0000-4000-8000-000000000001',
  now() - interval '2 days',
  ARRAY['personal branding', 'tech career', 'networking']
),
(
  'The Future of Work: Trends Every Professional Should Know',
  'The workplace is evolving rapidly. Stay ahead of the curve by understanding these key trends that will shape the future of work.',
  '# The Future of Work: Trends Every Professional Should Know

The world of work is transforming at breakneck speed. From artificial intelligence to remote work, these changes are reshaping how we think about careers, productivity, and professional development.

## Major Trends Shaping the Future

### 1. Hybrid Work Models
The pandemic accelerated the adoption of hybrid work arrangements:
- Flexible schedules and locations
- Results-oriented work environments
- Digital-first collaboration tools
- Emphasis on work-life balance

### 2. AI and Automation
Artificial intelligence is changing job landscapes:
- **Job displacement**: Some roles will be automated
- **Job creation**: New roles in AI management and ethics
- **Skill augmentation**: AI will enhance human capabilities
- **Continuous learning**: Staying relevant requires ongoing education

### 3. Gig Economy Growth
The rise of freelance and contract work:
- Increased flexibility for workers
- Project-based employment models
- Multiple income streams
- Platform-based work opportunities

## Skills for the Future

### Technical Skills
- Data analysis and interpretation
- AI and machine learning basics
- Digital marketing and e-commerce
- Cybersecurity awareness

### Soft Skills
- **Adaptability**: Embracing change and uncertainty
- **Critical thinking**: Analyzing complex problems
- **Emotional intelligence**: Understanding and managing emotions
- **Digital communication**: Effective online collaboration

## Preparing for Change

### For Individuals
1. **Continuous learning**: Invest in upskilling and reskilling
2. **Network building**: Maintain professional relationships
3. **Personal branding**: Establish your digital presence
4. **Financial planning**: Prepare for income variability

### For Organizations
1. **Culture transformation**: Embrace flexibility and innovation
2. **Employee development**: Invest in workforce training
3. **Technology adoption**: Implement digital tools effectively
4. **Diversity and inclusion**: Build inclusive work environments

## Industry-Specific Impacts

### Technology
- Cloud computing expertise in high demand
- Cybersecurity roles expanding rapidly
- DevOps and automation specialists needed

### Healthcare
- Telemedicine and digital health solutions
- Health informatics professionals
- Mental health support roles

### Education
- Online learning platform development
- Digital content creation skills
- Student engagement technologies

## Conclusion

The future of work is being written now. By understanding these trends and proactively developing relevant skills, professionals can position themselves for success in the evolving job market.

Stay curious, stay adaptable, and embrace the exciting possibilities that lie ahead!',
  'Future of Work',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  'published',
  '00000000-0000-4000-8000-000000000001',
  now() - interval '5 days',
  ARRAY['future of work', 'AI', 'remote work', 'career trends']
);

-- Create a sample user profile for the blog posts
INSERT INTO public.profiles (user_id, full_name, avatar_url, bio) VALUES
(
  '00000000-0000-4000-8000-000000000001',
  'Alex Johnson',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'Career strategist and tech industry expert with over 10 years of experience helping professionals navigate their career journeys.'
);

-- Add some sample likes and comments for engagement
INSERT INTO public.likes (blog_id, user_id) 
SELECT id, '00000000-0000-4000-8000-000000000001' 
FROM public.blogs 
WHERE status = 'published' 
LIMIT 2;

INSERT INTO public.comments (blog_id, user_id, content) VALUES
(
  (SELECT id FROM public.blogs WHERE title LIKE '%Remote Interviews%' LIMIT 1),
  '00000000-0000-4000-8000-000000000001',
  'Great tips! The technical setup advice really helped me ace my last remote interview.'
),
(
  (SELECT id FROM public.blogs WHERE title LIKE '%Personal Brand%' LIMIT 1),
  '00000000-0000-4000-8000-000000000001',
  'This article motivated me to finally start my tech blog. Thanks for the actionable advice!'
);