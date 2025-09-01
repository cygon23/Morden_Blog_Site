// Mock data for CareerNamimi platform

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  likes: number;
  comments: number;
  featured: boolean;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  bio: string;
  joinedAt: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    role: "Senior Product Manager",
    bio: "Passionate about building products that make a difference. 8+ years in tech.",
    joinedAt: "2023-01-15"
  },
  {
    id: "2", 
    name: "Marcus Rodriguez",
    email: "marcus@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    role: "Career Coach & HR Director",
    bio: "Helping professionals navigate their career journey for over 12 years.",
    joinedAt: "2022-11-20"
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    email: "emily@example.com", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    role: "Leadership Development Expert",
    bio: "PhD in Organizational Psychology. Specializing in leadership and team dynamics.",
    joinedAt: "2023-03-10"
  }
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Remote Work: Trends to Watch in 2024",
    excerpt: "Explore the evolving landscape of remote work and how it's reshaping careers across industries.",
    content: "Remote work has fundamentally changed how we think about careers...",
    author: mockUsers[0],
    category: "Future of Work",
    tags: ["remote-work", "trends", "workplace", "productivity"],
    publishedAt: "2024-01-15",
    readTime: 8,
    likes: 127,
    comments: 23,
    featured: true,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop"
  },
  {
    id: "2", 
    title: "Mastering the Art of Salary Negotiation",
    excerpt: "Learn proven strategies to negotiate your worth and secure the compensation you deserve.",
    content: "Salary negotiation is one of the most important skills...",
    author: mockUsers[1],
    category: "Career Growth",
    tags: ["salary", "negotiation", "career-tips", "professional-development"],
    publishedAt: "2024-01-12",
    readTime: 12,
    likes: 89,
    comments: 31,
    featured: true,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop"
  },
  {
    id: "3",
    title: "Building Emotional Intelligence for Leadership Success",
    excerpt: "Discover how emotional intelligence can transform your leadership abilities and career trajectory.",
    content: "Emotional intelligence is the cornerstone of effective leadership...",
    author: mockUsers[2],
    category: "Leadership",
    tags: ["emotional-intelligence", "leadership", "soft-skills", "management"],
    publishedAt: "2024-01-10",
    readTime: 10,
    likes: 156,
    comments: 18,
    featured: true,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop"
  },
  {
    id: "4",
    title: "The Complete Guide to Career Pivots",
    excerpt: "Navigate career transitions with confidence using our step-by-step framework.",
    content: "Career pivots can be both exciting and daunting...",
    author: mockUsers[1],
    category: "Career Change",
    tags: ["career-change", "transition", "planning", "strategy"],
    publishedAt: "2024-01-08",
    readTime: 15,
    likes: 203,
    comments: 45,
    featured: false,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop"
  },
  {
    id: "5",
    title: "Tech Skills That Will Define the Next Decade",
    excerpt: "Stay ahead of the curve with these emerging technologies and in-demand skills.",
    content: "The technology landscape is evolving rapidly...",
    author: mockUsers[0],
    category: "Skills Development",
    tags: ["technology", "skills", "ai", "future-skills"],
    publishedAt: "2024-01-05",
    readTime: 7,
    likes: 94,
    comments: 12,
    featured: false,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop"
  }
];

export const mockCategories = [
  "Future of Work",
  "Career Growth", 
  "Leadership",
  "Career Change",
  "Skills Development",
  "Interview Tips",
  "Networking",
  "Work-Life Balance"
];

export const mockTags = [
  "remote-work",
  "salary",
  "negotiation", 
  "leadership",
  "emotional-intelligence",
  "career-change",
  "technology",
  "ai",
  "productivity",
  "networking",
  "interview-prep",
  "professional-development"
];