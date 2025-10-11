import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  ThumbsUp,
  Users,
  TrendingUp,
  Pin,
  Send,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDiscussions,
  useDiscussion,
  useCategories,
  useForumStats,
  useDiscussionActions,
} from "@/hooks/useForum";
import { Discussion } from "../lib/forum.ts";
import { formatDistanceToNow } from "date-fns";

export default function Forum() {
  const navigate = useNavigate();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  // Fetch data
  const { discussions, loading: discussionsLoading } = useDiscussions({
    limit: 10,
    sortBy: "recent",
  });
  const { categories, loading: categoriesLoading } = useCategories();
  const { stats, loading: statsLoading } = useForumStats();
  const {
    discussion: selectedPost,
    comments,
    loading: postLoading,
  } = useDiscussion(selectedPostId);

  // Local state for optimistic updates
  const [localComments, setLocalComments] = useState(comments);
  const [localLikeCount, setLocalLikeCount] = useState(
    selectedPost?.like_count || 0
  );
  const [localUserLiked, setLocalUserLiked] = useState(
    selectedPost?.user_has_liked || false
  );

  // Sync with fetched data
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (selectedPost) {
      setLocalLikeCount(selectedPost.like_count);
      setLocalUserLiked(selectedPost.user_has_liked || false);
    }
  }, [selectedPost]);

  // Actions
  const { toggleLike, addComment, toggleCommentLike } = useDiscussionActions();

  const [submittingComment, setSubmittingComment] = useState(false);

  const handlePostClick = (post: Discussion) => {
    setSelectedPostId(post.id);
  };

  const handleLikePost = async (discussionId: string) => {
    const result = await toggleLike(discussionId);
    if (result !== null) {
      setLocalUserLiked(result);
      setLocalLikeCount((prev) => (result ? prev + 1 : prev - 1));
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const result = await toggleCommentLike(commentId);
    if (result !== null) {
      setLocalComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                user_has_liked: result,
                like_count: c.like_count + (result ? 1 : -1),
              }
            : c
        )
      );
    }
  };

  const handleSubmitComment = async () => {
    if (!selectedPost || !newComment.trim()) return;

    setSubmittingComment(true);
    const comment = await addComment(selectedPost.id, newComment);
    if (comment) {
      setNewComment("");
      setLocalComments((prev) => [...prev, comment]);
    }
    setSubmittingComment(false);
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      <div className='container-custom py-12'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-heading font-bold mb-4'>
            Career <span className='text-gradient'>Forum</span>
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto mb-6'>
            Connect with professionals, share experiences, and get career advice
            from the community
          </p>
          <Button
            size='lg'
            className='hero-gradient'
            onClick={() => navigate("/create")}>
            Start a Discussion
          </Button>
        </div>

        {/* Stats */}
        <div className='grid md:grid-cols-4 gap-6 mb-12'>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Users className='w-8 h-8 text-primary mx-auto mb-2' />
              {statsLoading ? (
                <Skeleton className='h-8 w-20 mx-auto mb-2' />
              ) : (
                <div className='text-2xl font-bold'>
                  {stats.activeMembers.toLocaleString()}
                </div>
              )}
              <div className='text-sm text-muted-foreground'>
                Active Members
              </div>
            </CardContent>
          </Card>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <MessageSquare className='w-8 h-8 text-primary mx-auto mb-2' />
              {statsLoading ? (
                <Skeleton className='h-8 w-20 mx-auto mb-2' />
              ) : (
                <div className='text-2xl font-bold'>
                  {stats.totalDiscussions.toLocaleString()}
                </div>
              )}
              <div className='text-sm text-muted-foreground'>Discussions</div>
            </CardContent>
          </Card>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <ThumbsUp className='w-8 h-8 text-primary mx-auto mb-2' />
              {statsLoading ? (
                <Skeleton className='h-8 w-20 mx-auto mb-2' />
              ) : (
                <div className='text-2xl font-bold'>
                  {stats.totalComments.toLocaleString()}
                </div>
              )}
              <div className='text-sm text-muted-foreground'>
                Helpful Answers
              </div>
            </CardContent>
          </Card>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <TrendingUp className='w-8 h-8 text-primary mx-auto mb-2' />
              <div className='text-2xl font-bold'>{stats.successRate}%</div>
              <div className='text-sm text-muted-foreground'>Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-heading font-bold'>
                Trending Discussions
              </h2>
              <Button
                variant='outline'
                onClick={() => navigate("/discussions")}>
                View All
              </Button>
            </div>

            {discussionsLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className='p-6'>
                    <div className='flex items-start space-x-4'>
                      <Skeleton className='w-12 h-12 rounded-full' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-6 w-full' />
                        <Skeleton className='h-4 w-48' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : discussions.length === 0 ? (
              <Card className='p-12 text-center'>
                <p className='text-lg text-muted-foreground'>
                  No discussions yet. Be the first to start one!
                </p>
              </Card>
            ) : (
              discussions.map((post) => (
                <Card
                  key={post.id}
                  className='hover:shadow-lg transition-all duration-300 cursor-pointer'
                  onClick={() => handlePostClick(post)}>
                  <CardContent className='p-6'>
                    <div className='flex items-start space-x-4'>
                      <Avatar className='w-12 h-12'>
                        <AvatarImage
                          src={post.author?.avatar_url || ""}
                          alt={post.author?.username || ""}
                        />
                        <AvatarFallback>
                          {post.author?.username?.slice(0, 2).toUpperCase() ||
                            "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2 mb-2'>
                          {post.is_pinned && (
                            <Pin className='w-4 h-4 text-primary' />
                          )}
                          {post.category && (
                            <Badge variant='outline'>
                              {post.category.name}
                            </Badge>
                          )}
                          <span className='text-sm text-muted-foreground'>
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        <h3 className='text-lg font-semibold mb-2 hover:text-primary'>
                          {post.title}
                        </h3>
                        <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                          <div className='flex items-center space-x-1'>
                            <MessageSquare className='w-4 h-4' />
                            <span>{post.reply_count} replies</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <ThumbsUp className='w-4 h-4' />
                            <span>{post.like_count} likes</span>
                          </div>
                          <span>by {post.author?.username || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <MessageSquare className='w-5 h-5' />
                  <span>Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {categoriesLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className='h-12 w-full' />
                    ))
                  : categories.map((category) => (
                      <div
                        key={category.id}
                        className='flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${category.color}`}
                          />
                          <span className='font-medium'>{category.name}</span>
                        </div>
                        <Badge variant='secondary' className='text-xs'>
                          {category.post_count}
                        </Badge>
                      </div>
                    ))}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex items-start space-x-2'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <span>
                    Be respectful and professional in all interactions
                  </span>
                </div>
                <div className='flex items-start space-x-2'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <span>Share genuine experiences and advice</span>
                </div>
                <div className='flex items-start space-x-2'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <span>Keep discussions career-focused and relevant</span>
                </div>
                <div className='flex items-start space-x-2'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                  <span>No spam, self-promotion, or offensive content</span>
                </div>
              </CardContent>
            </Card>

            {/* Join CTA */}
            <Card className='hero-gradient text-white'>
              <CardHeader>
                <CardTitle>Join the Conversation</CardTitle>
                <CardDescription className='text-white/80'>
                  Get personalized career advice from thousands of professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant='secondary' className='w-full'>
                  Sign Up Free
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Post Detail Dialog */}
      <Dialog
        open={!!selectedPostId}
        onOpenChange={() => setSelectedPostId(null)}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
          {postLoading ? (
            <div className='flex items-center justify-center p-12'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
          ) : selectedPost ? (
            <>
              <DialogHeader>
                <DialogTitle className='text-2xl'>
                  {selectedPost.title}
                </DialogTitle>
              </DialogHeader>

              <div className='flex items-start space-x-4 px-6 pb-4 border-b'>
                <Avatar className='w-12 h-12'>
                  <AvatarImage
                    src={selectedPost.author?.avatar_url || ""}
                    alt={selectedPost.author?.username || ""}
                  />
                  <AvatarFallback>
                    {selectedPost.author?.username?.slice(0, 2).toUpperCase() ||
                      "??"}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2 mb-1'>
                    {selectedPost.is_pinned && (
                      <Pin className='w-4 h-4 text-primary' />
                    )}
                    {selectedPost.category && (
                      <Badge variant='outline'>
                        {selectedPost.category.name}
                      </Badge>
                    )}
                    <span className='text-sm text-muted-foreground'>
                      {formatTimeAgo(selectedPost.created_at)}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    by {selectedPost.author?.username || "Unknown"}
                  </p>
                </div>
              </div>

              <ScrollArea className='flex-1 pr-4'>
                <div className='space-y-6'>
                  {/* Post Content */}
                  <div
                    className='prose prose-sm max-w-none text-foreground'
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />

                  {/* Post Actions */}
                  <div className='flex items-center space-x-4 pt-4 border-t'>
                    <Button
                      variant={localUserLiked ? "default" : "outline"}
                      size='sm'
                      onClick={() => handleLikePost(selectedPost.id)}
                      className='space-x-2'>
                      <ThumbsUp className='w-4 h-4' />
                      <span>{localLikeCount}</span>
                    </Button>
                    <div className='flex items-center space-x-2 text-muted-foreground'>
                      <MessageSquare className='w-4 h-4' />
                      <span>{selectedPost.reply_count} replies</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className='space-y-4 pt-6 border-t'>
                    <h3 className='text-lg font-semibold'>Comments</h3>

                    {/* Comments */}
                    {localComments.map((comment) => (
                      <Card key={comment.id} className='bg-muted/30'>
                        <CardContent className='p-4'>
                          <div className='flex items-start space-x-3'>
                            <Avatar className='w-8 h-8'>
                              <AvatarImage
                                src={comment.author?.avatar_url || ""}
                                alt={comment.author?.username || ""}
                              />
                              <AvatarFallback>
                                {comment.author?.username
                                  ?.slice(0, 2)
                                  .toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center space-x-2 mb-1'>
                                <span className='font-semibold text-sm'>
                                  {comment.author?.username || "Unknown"}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {formatTimeAgo(comment.created_at)}
                                </span>
                              </div>
                              <p className='text-sm mb-2 whitespace-pre-wrap'>
                                {comment.content}
                              </p>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleLikeComment(comment.id)}
                                className={`h-7 space-x-1 ${
                                  comment.user_has_liked ? "text-primary" : ""
                                }`}>
                                <ThumbsUp className='w-3 h-3' />
                                <span>{comment.like_count}</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {localComments.length === 0 && (
                      <p className='text-sm text-muted-foreground text-center py-4'>
                        No comments yet. Be the first to comment!
                      </p>
                    )}

                    {/* Add Comment */}
                    <div className='flex items-start space-x-3 pt-4'>
                      <Avatar className='w-8 h-8'>
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                      <div className='flex-1 space-y-2'>
                        <Textarea
                          placeholder='Share your thoughts...'
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className='min-h-[80px]'
                          disabled={submittingComment}
                        />
                        <Button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || submittingComment}
                          className='space-x-2'>
                          {submittingComment ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <Send className='w-4 h-4' />
                          )}
                          <span>
                            {submittingComment ? "Posting..." : "Post Comment"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}