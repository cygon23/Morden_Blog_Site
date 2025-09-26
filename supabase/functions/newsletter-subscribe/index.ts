import "https://deno.land/std@0.168.0/dotenv/load.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// -------------------
// Supabase Client
// -------------------
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// -------------------
// CORS Headers
// -------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// -------------------
// Send Welcome Email
// -------------------
async function sendWelcomeEmail(toEmail: string, toName?: string) {
  try {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CareerNamimi - Your Career Intelligence Partner</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          line-height: 1.6;
        }
        
        .email-container {
          max-width: 650px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .header-section {
          background: linear-gradient(135deg, #FE047F 0%, #FF6B35 50%, #006708 100%);
          position: relative;
          padding: 50px 30px;
          text-align: center;
          overflow: hidden;
        }
        
        .header-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1.5" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="10" r="0.8" fill="rgba(255,255,255,0.12)"/><circle cx="10" cy="60" r="1.2" fill="rgba(255,255,255,0.06)"/><circle cx="90" cy="40" r="0.6" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
          opacity: 0.3;
        }
        
        .logo-container {
          position: relative;
          z-index: 2;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 42px;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          letter-spacing: -1px;
          margin-bottom: 8px;
        }
        
        .tagline {
          font-size: 18px;
          color: rgba(255,255,255,0.9);
          font-weight: 300;
          letter-spacing: 0.5px;
        }
        
        .content-section {
          padding: 50px 40px;
          background: #ffffff;
        }
        
        .welcome-badge {
          display: inline-block;
          background: linear-gradient(135deg, #FE047F 0%, #FF6B35 100%);
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 25px;
        }
        
        .main-heading {
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 20px;
          line-height: 1.2;
        }
        
        .highlight-text {
          background: linear-gradient(135deg, #FE047F 0%, #FF6B35 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .description {
          font-size: 18px;
          color: #4a5568;
          margin-bottom: 35px;
          line-height: 1.7;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin: 40px 0;
        }
        
        .feature-card {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 30px 25px;
          border-radius: 15px;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #e2e8f0;
        }
        
        .feature-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #FE047F 0%, #FF6B35 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }
        
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 10px;
        }
        
        .feature-desc {
          font-size: 14px;
          color: #718096;
          line-height: 1.5;
        }
        
        .cta-section {
          text-align: center;
          margin: 45px 0;
          padding: 40px 30px;
          background: linear-gradient(135deg, rgba(254, 4, 127, 0.05) 0%, rgba(0, 103, 8, 0.05) 100%);
          border-radius: 20px;
          border: 1px solid rgba(254, 4, 127, 0.1);
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #FE047F 0%, #006708 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 18px 40px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(254, 4, 127, 0.3);
          text-transform: uppercase;
        }
        
        .secondary-cta {
          display: inline-block;
          margin-left: 20px;
          color: #FE047F;
          text-decoration: none;
          font-weight: 600;
          padding: 18px 30px;
          border: 2px solid #FE047F;
          border-radius: 50px;
          transition: all 0.3s ease;
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin: 40px 0;
          text-align: center;
        }
        
        .stat-item {
          padding: 20px;
        }
        
        .stat-number {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #FE047F 0%, #006708 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }
        
        .stat-label {
          font-size: 14px;
          color: #718096;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .footer-section {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          color: #e2e8f0;
          padding: 40px 30px;
          text-align: center;
        }
        
        .social-links {
          margin: 25px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 15px;
          color: #e2e8f0;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }
        
        .footer-text {
          font-size: 13px;
          color: #a0aec0;
          margin: 15px 0;
        }
        
        .unsubscribe-link {
          color: #FE047F;
          text-decoration: none;
          font-weight: 500;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 15px;
          }
          
          .header-section {
            padding: 40px 20px;
          }
          
          .company-name {
            font-size: 32px;
          }
          
          .content-section {
            padding: 30px 25px;
          }
          
          .main-heading {
            font-size: 26px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .secondary-cta {
            margin-left: 0;
            margin-top: 15px;
            display: block;
          }
          
          .stats-section {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header Section -->
        <div class="header-section">
          <div class="logo-container">
            <div class="company-name">CareerNamimi</div>
            <div class="tagline">Intelligent Career Solutions</div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="content-section">
          <div class="welcome-badge">Welcome Aboard</div>
          
          <h1 class="main-heading">
            Hello <span class="highlight-text">${
              toName || "Career Pioneer"
            }</span>! 🚀
          </h1>
          
          <p class="description">
            Welcome to CareerNamimi, where cutting-edge technology meets career excellence. 
            We're thrilled to have you join our community of forward-thinking professionals 
            who leverage intelligent search capabilities and creative solutions to accelerate their careers.
          </p>
          
          <!-- Features Grid -->
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🔍</div>
              <div class="feature-title">Smart Career Search</div>
              <div class="feature-desc">AI-powered job matching with real-time market intelligence</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">💡</div>
              <div class="feature-title">Creative Solutions</div>
              <div class="feature-desc">Innovative approaches to career challenges and opportunities</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <div class="feature-title">Market Insights</div>
              <div class="feature-desc">Real-time industry trends and salary benchmarking</div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <div class="feature-title">Targeted Growth</div>
              <div class="feature-desc">Personalized career roadmaps and skill development plans</div>
            </div>
          </div>
          
          <!-- Stats Section -->
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-number">100+</span>
              <span class="stat-label">Active Users</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">95%</span>
              <span class="stat-label">Success Rate</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Support</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">200++</span>
              <span class="stat-label">Job Matches</span>
            </div>
          </div>
          
          <!-- CTA Section -->
          <div class="cta-section">
            <h3 style="margin-bottom: 20px; color: #2d3748;">Ready to Transform Your Career?</h3>
            <p style="margin-bottom: 30px; color: #718096;">
              Discover opportunities that match your ambitions with our intelligent career platform.
            </p>
            
            <a href="https://careernamimi.org/" class="cta-button">
              Launch Your Journey
            </a>
            
            <a href="https://careernamimi.org/explore" class="secondary-cta">
              Explore Features
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer-section">
          <div class="social-links">
            <a href="https://careernamimi.org/about">About Us</a>
            <a href="https://careernamimi.org/blog">Career Blog</a>
            <a href="https://careernamimi.org/resources">Resources</a>
            <a href="https://careernamimi.org/contact">Contact</a>
          </div>
          
          <p class="footer-text">
            © 2025 CareerNamimi.org - Empowering careers through intelligent technology
          </p>
          
          <p class="footer-text">
            You received this email because you signed up for CareerNamimi. 
            <br>
            <a href="https://morden-blog-site.vercel.app/unsubscribe?email=${toEmail}" class="unsubscribe-link">
              Update preferences or unsubscribe
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const nodemailer = await import("npm:nodemailer@6.9.4");

    const transporter = nodemailer.createTransport({
      host: Deno.env.get("EMAIL_HOST") || "smtp.hostinger.com",
      port: Number(Deno.env.get("EMAIL_PORT") || 465),
      secure: true,
      auth: {
        user: Deno.env.get("EMAIL_USER"),
        pass: Deno.env.get("EMAIL_PASS"),
      },
    });

    const mailOptions = {
      from: `"CareerNamimi - Intelligent Career Solutions" <${Deno.env.get(
        "EMAIL_USER"
      )}>`,
      to: toEmail,
      subject: "🚀 Welcome to CareerNamimi - Your Career Intelligence Partner",
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

// -------------------
// Server
// -------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { email, name, source } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if subscriber exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, message: "Already subscribed" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Insert subscriber
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email, name, source }])
      .select();

    if (error) throw error;

    // Send welcome email asynchronously
    sendWelcomeEmail(email, name).catch((err) =>
      console.error("Error sending welcome email:", err)
    );

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
