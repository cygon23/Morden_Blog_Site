import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories, useDiscussionActions } from "@/hooks/useForum";
import { useToast } from "@/hooks/use-toast";

// Import React Quill
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreateDiscussion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  const { createDiscussion } = useDiscussionActions();

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Please select a category";
    }

    const plainContent = formData.content.replace(/<[^>]+>/g, "").trim();
    if (!plainContent) {
      newErrors.content = "Content is required";
    } else if (plainContent.length < 50) {
      newErrors.content = "Content must be at least 50 characters";
    } else if (plainContent.length > 5000) {
      newErrors.content = "Content must be less than 5000 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const discussion = await createDiscussion({
      title: formData.title.trim(),
      category_id: formData.category_id,
      content: formData.content.trim(),
    });

    if (discussion) {
      navigate("/forum");
      toast({ title: "Discussion posted successfully!" });
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      <div className='container-custom py-12'>
        <div className='max-w-3xl mx-auto'>
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
              Start a <span className='text-gradient'>Discussion</span>
            </h1>
            <p className='text-xl text-muted-foreground'>
              Share your experience, ask for advice, or start a conversation
              with the community
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Discussion</CardTitle>
              <CardDescription>
                Fill in the details below to start a new discussion thread
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Title */}
                <div className='space-y-2'>
                  <Label htmlFor='title'>
                    Discussion Title <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='title'
                    placeholder='e.g., How to negotiate a better salary in tech?'
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-destructive" : ""}
                    maxLength={200}
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className='text-sm text-destructive'>{errors.title}</p>
                  )}
                  <p className='text-xs text-muted-foreground'>
                    {formData.title.length}/200 characters
                  </p>
                </div>

                {/* Category */}
                <div className='space-y-2'>
                  <Label htmlFor='category'>
                    Category <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      handleInputChange("category_id", value)
                    }
                    disabled={isSubmitting || categoriesLoading}>
                    <SelectTrigger
                      className={
                        errors.category_id ? "border-destructive" : ""
                      }>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className='text-sm text-destructive'>
                      {errors.category_id}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className='space-y-2'>
                  <Label htmlFor='content'>
                    Discussion Content{" "}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <ReactQuill
                    theme='snow'
                    value={formData.content}
                    onChange={(value) => handleInputChange("content", value)}
                    placeholder='Share your thoughts, experiences, or questions in detail...'
                    className={`min-h-[200px] ${
                      errors.content ? "border-destructive" : ""
                    }`}
                    readOnly={isSubmitting}
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                      ],
                    }}
                    formats={[
                      "bold",
                      "italic",
                      "underline",
                      "list",
                      "bullet",
                      "link",
                    ]}
                  />
                  {errors.content && (
                    <p className='text-sm text-destructive'>{errors.content}</p>
                  )}
                  <p className='text-xs text-muted-foreground'>
                    {formData.content.replace(/<[^>]+>/g, "").length}/5000
                    characters
                  </p>
                </div>

                {/* Guidelines */}
                <Card className='bg-muted/50'>
                  <CardContent className='pt-6'>
                    <h4 className='font-semibold mb-2'>Posting Guidelines</h4>
                    <ul className='space-y-1 text-sm text-muted-foreground'>
                      <li>• Be respectful and professional</li>
                      <li>• Provide context and details</li>
                      <li>• Stay on topic and career-focused</li>
                      <li>• No spam or self-promotion</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className='flex items-center space-x-4'>
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='space-x-2'
                    size='lg'>
                    {isSubmitting ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <Send className='w-4 h-4' />
                    )}
                    <span>
                      {isSubmitting ? "Posting..." : "Post Discussion"}
                    </span>
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => navigate("/forum")}
                    disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
