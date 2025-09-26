// import React, { useState, useEffect } from "react";
// import { createClient } from "@supabase/supabase-js";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import {
//   Mail,
//   Users,
//   TrendingUp,
//   Send,
//   Eye,
//   MousePointer,
//   Calendar,
//   Plus,
//   Edit,
//   Trash2,
// } from "lucide-react";

// const supabase = createClient(
//   "https://your-supabase-url.supabase.co",
//   "your-anon-key"
// );

// const NewsletterAdminDashboard = () => {
//   const [stats, setStats] = useState({
//     totalSubscribers: 0,
//     activeSubscribers: 0,
//     totalCampaigns: 0,
//     averageOpenRate: 0,
//     averageClickRate: 0,
//   });

//   const [campaigns, setCampaigns] = useState([]);
//   const [subscribers, setSubscribers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCampaign, setSelectedCampaign] = useState(null);
//   const [showCreateCampaign, setShowCreateCampaign] = useState(false);

//   const [newCampaign, setNewCampaign] = useState({
//     title: "",
//     subject: "",
//     content: "",
//     preview_text: "",
//   });

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Fetch subscribers
//       const { data: subscribersData, error: subscribersError } = await supabase
//         .from("newsletter_subscribers")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (subscribersError) throw subscribersError;

//       // Fetch campaigns
//       const { data: campaignsData, error: campaignsError } = await supabase
//         .from("newsletter_campaigns")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (campaignsError) throw campaignsError;

//       // Fetch analytics for recent campaigns
//       const { data: analyticsData } = await supabase
//         .from("newsletter_analytics")
//         .select("*")
//         .order("created_at", { ascending: false });

//       // Calculate stats
//       const totalSubscribers = subscribersData?.length || 0;
//       const activeSubscribers =
//         subscribersData?.filter((s) => s.status === "active").length || 0;
//       const totalCampaigns =
//         campaignsData?.filter((c) => c.status === "sent").length || 0;

//       // Calculate average rates
//       let totalOpens = 0,
//         totalClicks = 0,
//         totalSent = 0;

//       if (analyticsData) {
//         totalSent = analyticsData.filter((a) => a.event_type === "sent").length;
//         totalOpens = analyticsData.filter(
//           (a) => a.event_type === "opened"
//         ).length;
//         totalClicks = analyticsData.filter(
//           (a) => a.event_type === "clicked"
//         ).length;
//       }

//       setStats({
//         totalSubscribers,
//         activeSubscribers,
//         totalCampaigns,
//         averageOpenRate: totalSent > 0 ? (totalOpens / totalSent) * 100 : 0,
//         averageClickRate: totalSent > 0 ? (totalClicks / totalSent) * 100 : 0,
//       });

//       setSubscribers(subscribersData || []);
//       setCampaigns(campaignsData || []);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateCampaign = async (e) => {
//     e.preventDefault();

//     try {
//       const { data, error } = await supabase
//         .from("newsletter_campaigns")
//         .insert([newCampaign])
//         .select()
//         .single();

//       if (error) throw error;

//       setCampaigns((prev) => [data, ...prev]);
//       setNewCampaign({ title: "", subject: "", content: "", preview_text: "" });
//       setShowCreateCampaign(false);
//     } catch (error) {
//       console.error("Error creating campaign:", error);
//     }
//   };

//   const handleSendCampaign = async (campaignId) => {
//     try {
//       const { data, error } = await supabase.functions.invoke(
//         "newsletter-send",
//         {
//           body: { campaignId },
//         }
//       );

//       if (error) throw error;

//       // Refresh campaigns
//       fetchDashboardData();
//       alert(
//         `Campaign sent successfully! ${data.successCount} emails delivered.`
//       );
//     } catch (error) {
//       console.error("Error sending campaign:", error);
//       alert("Failed to send campaign. Please try again.");
//     }
//   };

//   const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
//     <Card className='relative overflow-hidden'>
//       <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//         <CardTitle className='text-sm font-medium text-gray-600'>
//           {title}
//         </CardTitle>
//         <Icon className={`h-4 w-4 text-${color}-600`} />
//       </CardHeader>
//       <CardContent>
//         <div className='text-2xl font-bold text-gray-900'>{value}</div>
//         {trend && (
//           <p className='text-xs text-gray-600 flex items-center mt-1'>
//             <TrendingUp className='h-3 w-3 mr-1' />
//             {trend}
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );

//   const CampaignCard = ({ campaign }) => {
//     const getStatusColor = (status) => {
//       switch (status) {
//         case "draft":
//           return "gray";
//         case "scheduled":
//           return "blue";
//         case "sending":
//           return "yellow";
//         case "sent":
//           return "green";
//         case "failed":
//           return "red";
//         default:
//           return "gray";
//       }
//     };

//     return (
//       <Card className='hover:shadow-md transition-shadow'>
//         <CardHeader>
//           <div className='flex items-center justify-between'>
//             <div>
//               <CardTitle className='text-lg'>{campaign.title}</CardTitle>
//               <CardDescription>{campaign.subject}</CardDescription>
//             </div>
//             <Badge
//               variant='outline'
//               className={`text-${getStatusColor(campaign.status)}-600`}>
//               {campaign.status}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className='flex items-center justify-between text-sm text-gray-600 mb-4'>
//             <span>
//               Created: {new Date(campaign.created_at).toLocaleDateString()}
//             </span>
//             {campaign.recipient_count && (
//               <span>{campaign.recipient_count} recipients</span>
//             )}
//           </div>
//           <div className='flex gap-2'>
//             {campaign.status === "draft" && (
//               <>
//                 <Button
//                   size='sm'
//                   onClick={() => handleSendCampaign(campaign.id)}
//                   className='bg-blue-600 hover:bg-blue-700'>
//                   <Send className='h-4 w-4 mr-1' />
//                   Send Now
//                 </Button>
//                 <Button size='sm' variant='outline'>
//                   <Edit className='h-4 w-4 mr-1' />
//                   Edit
//                 </Button>
//               </>
//             )}
//             {campaign.status === "sent" && (
//               <Button
//                 size='sm'
//                 variant='outline'
//                 onClick={() => setSelectedCampaign(campaign)}>
//                 <Eye className='h-4 w-4 mr-1' />
//                 View Analytics
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   if (loading) {
//     return (
//       <div className='flex items-center justify-center min-h-screen'>
//         <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
//       </div>
//     );
//   }

//   return (
//     <div className='min-h-screen bg-gray-50 p-6'>
//       <div className='max-w-7xl mx-auto'>
//         {/* Header */}
//         <div className='mb-8'>
//           <h1 className='text-3xl font-bold text-gray-900 mb-2'>
//             Newsletter Dashboard
//           </h1>
//           <p className='text-gray-600'>
//             Manage your email campaigns and subscribers
//           </p>
//         </div>

//         {/* Stats Grid */}
//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
//           <StatCard
//             title='Total Subscribers'
//             value={stats.totalSubscribers.toLocaleString()}
//             icon={Users}
//             trend='+12% from last month'
//             color='blue'
//           />
//           <StatCard
//             title='Active Subscribers'
//             value={stats.activeSubscribers.toLocaleString()}
//             icon={Users}
//             color='green'
//           />
//           <StatCard
//             title='Campaigns Sent'
//             value={stats.totalCampaigns}
//             icon={Mail}
//             color='purple'
//           />
//           <StatCard
//             title='Avg Open Rate'
//             value={`${stats.averageOpenRate.toFixed(1)}%`}
//             icon={Eye}
//             color='orange'
//           />
//           <StatCard
//             title='Avg Click Rate'
//             value={`${stats.averageClickRate.toFixed(1)}%`}
//             icon={MousePointer}
//             color='pink'
//           />
//         </div>

//         {/* Main Content */}
//         <Tabs defaultValue='campaigns' className='space-y-6'>
//           <TabsList className='grid w-full grid-cols-3'>
//             <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
//             <TabsTrigger value='subscribers'>Subscribers</TabsTrigger>
//             <TabsTrigger value='templates'>Templates</TabsTrigger>
//           </TabsList>

//           <TabsContent value='campaigns' className='space-y-6'>
//             <div className='flex justify-between items-center'>
//               <h2 className='text-2xl font-bold text-gray-900'>
//                 Email Campaigns
//               </h2>
//               <Button
//                 onClick={() => setShowCreateCampaign(true)}
//                 className='bg-blue-600 hover:bg-blue-700'>
//                 <Plus className='h-4 w-4 mr-2' />
//                 Create Campaign
//               </Button>
//             </div>

//             {showCreateCampaign && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Create New Campaign</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleCreateCampaign} className='space-y-4'>
//                     <div>
//                       <label className='block text-sm font-medium mb-1'>
//                         Campaign Title
//                       </label>
//                       <Input
//                         value={newCampaign.title}
//                         onChange={(e) =>
//                           setNewCampaign((prev) => ({
//                             ...prev,
//                             title: e.target.value,
//                           }))
//                         }
//                         placeholder='Weekly Career Tips #1'
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className='block text-sm font-medium mb-1'>
//                         Email Subject
//                       </label>
//                       <Input
//                         value={newCampaign.subject}
//                         onChange={(e) =>
//                           setNewCampaign((prev) => ({
//                             ...prev,
//                             subject: e.target.value,
//                           }))
//                         }
//                         placeholder='5 Career Tips That Will Transform Your 2024'
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className='block text-sm font-medium mb-1'>
//                         Preview Text
//                       </label>
//                       <Input
//                         value={newCampaign.preview_text}
//                         onChange={(e) =>
//                           setNewCampaign((prev) => ({
//                             ...prev,
//                             preview_text: e.target.value,
//                           }))
//                         }
//                         placeholder='The secret strategies top performers use...'
//                       />
//                     </div>
//                     <div>
//                       <label className='block text-sm font-medium mb-1'>
//                         Email Content (HTML)
//                       </label>
//                       <textarea
//                         className='w-full h-40 p-3 border rounded-md resize-none'
//                         value={newCampaign.content}
//                         onChange={(e) =>
//                           setNewCampaign((prev) => ({
//                             ...prev,
//                             content: e.target.value,
//                           }))
//                         }
//                         placeholder="<h2>Hello {{name}}!</h2><p>Here are this week's top career tips...</p>"
//                         required
//                       />
//                     </div>
//                     <div className='flex gap-2'>
//                       <Button type='submit'>Create Campaign</Button>
//                       <Button
//                         type='button'
//                         variant='outline'
//                         onClick={() => setShowCreateCampaign(false)}>
//                         Cancel
//                       </Button>
//                     </div>
//                   </form>
//                 </CardContent>
//               </Card>
//             )}

//             <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
//               {campaigns.map((campaign) => (
//                 <CampaignCard key={campaign.id} campaign={campaign} />
//               ))}
//             </div>
//           </TabsContent>

//           <TabsContent value='subscribers' className='space-y-6'>
//             <div className='flex justify-between items-center'>
//               <h2 className='text-2xl font-bold text-gray-900'>Subscribers</h2>
//               <div className='text-sm text-gray-600'>
//                 {stats.activeSubscribers} active of {stats.totalSubscribers}{" "}
//                 total
//               </div>
//             </div>

//             <Card>
//               <CardContent className='p-0'>
//                 <div className='overflow-x-auto'>
//                   <table className='w-full'>
//                     <thead className='bg-gray-50 border-b'>
//                       <tr>
//                         <th className='text-left p-4 font-medium text-gray-900'>
//                           Email
//                         </th>
//                         <th className='text-left p-4 font-medium text-gray-900'>
//                           Name
//                         </th>
//                         <th className='text-left p-4 font-medium text-gray-900'>
//                           Status
//                         </th>
//                         <th className='text-left p-4 font-medium text-gray-900'>
//                           Source
//                         </th>
//                         <th className='text-left p-4 font-medium text-gray-900'>
//                           Subscribed
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className='divide-y'>
//                       {subscribers.slice(0, 20).map((subscriber) => (
//                         <tr key={subscriber.id} className='hover:bg-gray-50'>
//                           <td className='p-4 text-sm'>{subscriber.email}</td>
//                           <td className='p-4 text-sm'>
//                             {subscriber.name || "-"}
//                           </td>
//                           <td className='p-4'>
//                             <Badge
//                               variant={
//                                 subscriber.status === "active"
//                                   ? "default"
//                                   : "secondary"
//                               }
//                               className={
//                                 subscriber.status === "active"
//                                   ? "bg-green-100 text-green-800"
//                                   : ""
//                               }>
//                               {subscriber.status}
//                             </Badge>
//                           </td>
//                           <td className='p-4 text-sm'>
//                             {subscriber.source || "website"}
//                           </td>
//                           <td className='p-4 text-sm'>
//                             {new Date(
//                               subscriber.subscribed_at
//                             ).toLocaleDateString()}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value='templates' className='space-y-6'>
//             <div className='flex justify-between items-center'>
//               <h2 className='text-2xl font-bold text-gray-900'>
//                 Email Templates
//               </h2>
//               <Button className='bg-blue-600 hover:bg-blue-700'>
//                 <Plus className='h-4 w-4 mr-2' />
//                 Create Template
//               </Button>
//             </div>

//             <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//               {/* Template cards would go here */}
//               <Card className='border-2 border-dashed border-gray-300'>
//                 <CardContent className='flex flex-col items-center justify-center h-48 text-gray-500'>
//                   <Plus className='h-8 w-8 mb-2' />
//                   <p>Create your first template</p>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default NewsletterAdminDashboard;
