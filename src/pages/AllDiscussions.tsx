import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, ThumbsUp, Pin, Search, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDiscussions, useCategories } from "@/hooks/useForum";
import { formatDistanceToNow } from "date-fns";

export default function AllDiscussions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "mostReplies">(
    "recent"
  );

  const { categories } = useCategories();
  const { discussions, loading } = useDiscussions({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: searchQuery,
    sortBy,
  });

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      <div className='container-custom py-12'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => navigate("/forum")}
            className='mb-4'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Forum
          </Button>
          <h1 className='text-4xl md:text-5xl font-heading font-bold mb-4'>
            All <span className='text-gradient'>Discussions</span>
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl'>
            Browse through all career discussions and find the insights you need
          </p>
        </div>

        {/* Filters */}
        <div className='grid md:grid-cols-3 gap-4 mb-8'>
          <div className='relative md:col-span-2'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Search discussions...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='All'>All</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className='flex items-center justify-between mb-6'>
          <p className='text-sm text-muted-foreground'>
            {loading ? (
              <Skeleton className='h-4 w-32' />
            ) : (
              <>
                Showing {discussions.length} discussion
                {discussions.length !== 1 ? "s" : ""}
              </>
            )}
          </p>
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='recent'>Most Recent</SelectItem>
              <SelectItem value='popular'>Most Popular</SelectItem>
              <SelectItem value='mostReplies'>Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discussions List */}
        <div className='space-y-4'>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
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
                No discussions found. Try adjusting your filters.
              </p>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className='hover:shadow-lg transition-all duration-300 cursor-pointer'
                onClick={() => navigate("/")}>
                <CardContent className='p-6'>
                  <div className='flex items-start space-x-4'>
                    <Avatar className='w-12 h-12'>
                      <AvatarImage
                        src={discussion.author?.avatar_url || ""}
                        alt={discussion.author?.username || ""}
                      />
                      <AvatarFallback>
                        {discussion.author?.username
                          ?.slice(0, 2)
                          .toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-2 mb-2'>
                        {discussion.is_pinned && (
                          <Pin className='w-4 h-4 text-primary' />
                        )}
                        {discussion.category && (
                          <Badge variant='outline'>
                            {discussion.category.name}
                          </Badge>
                        )}
                        <span className='text-sm text-muted-foreground'>
                          {formatTimeAgo(discussion.created_at)}
                        </span>
                      </div>
                      <h3 className='text-lg font-semibold mb-2 hover:text-primary'>
                        {discussion.title}
                      </h3>
                      <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                        <div className='flex items-center space-x-1'>
                          <MessageSquare className='w-4 h-4' />
                          <span>{discussion.reply_count} replies</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                          <ThumbsUp className='w-4 h-4' />
                          <span>{discussion.like_count} likes</span>
                        </div>
                        <span>
                          by {discussion.author?.username || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
