import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import CreateBlog from "./pages/CreateBlog";
import BlogPost from "./pages/BlogPost";
import EditBlog from "./pages/EditBlog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Tools from "./pages/Tools";
import ResumeChecker from "./pages/tools/ResumeChecker";
import SalaryCalculator from "./pages/tools/SalaryCalculator";
import SkillsAssessment from "./pages/tools/SkillsAssessment";
import CareerPath from "./pages/tools/CareerPath";
import InterviewPrep from "./pages/tools/InterviewPrep";
import Forum from "./pages/Forum";
import Events from "./pages/Events";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CreateDiscussion from "./pages/CreateDiscussion.tsx";
import AllDiscussions from "./pages/AllDiscussions.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme='light' storageKey='careernamimi-theme'>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth page without navigation and footer */}
            <Route path='/auth' element={<Auth />} />

            {/* All other pages with navigation and footer */}
            <Route
              path='*'
              element={
                <div className='flex flex-col min-h-screen'>
                  <Navigation />
                  <main className='flex-1'>
                    <Routes>
                      <Route path='/' element={<Index />} />
                      <Route path='/blog' element={<Blog />} />
                      <Route path='/blog/:id' element={<BlogPost />} />
                      <Route path='/create-blog' element={<CreateBlog />} />
                      <Route path='/edit-blog/:id' element={<EditBlog />} />
                      <Route path='/about' element={<About />} />
                      <Route path='/contact' element={<Contact />} />
                      <Route path='/tools' element={<Tools />} />
                      <Route
                        path='/tools/resume-checker'
                        element={<ResumeChecker />}
                      />
                      <Route
                        path='/tools/salary-calculator'
                        element={<SalaryCalculator />}
                      />
                      <Route
                        path='/tools/skills-assessment'
                        element={<SkillsAssessment />}
                      />
                      <Route
                        path='/tools/career-path'
                        element={<CareerPath />}
                      />
                      <Route
                        path='/tools/interview-prep'
                        element={<InterviewPrep />}
                      />
                      <Route path='/forum' element={<Forum />} />
                      <Route path='/discussions' element={<AllDiscussions />} />
                      <Route path='/create' element={<CreateDiscussion />} />
                      <Route path='/events' element={<Events />} />
                      <Route path='/profile' element={<Profile />} />
                      <Route path='/settings' element={<Settings />} />
                      <Route path='/categories' element={<Blog />} />
                      <Route path='*' element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
