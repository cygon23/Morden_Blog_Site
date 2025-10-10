import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export const RatingForm = ({ open, onClose, onSubmit, event }) => {
  const [formData, setFormData] = useState({
    user_email: "",
    rating: 0,
    comment: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      return;
    }
    if (!formData.user_email) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ user_email: "", rating: 0, comment: "" });
      onClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Rate This Event</DialogTitle>
          <DialogDescription>{event?.title}</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label>Your Email</Label>
            <Input
              type='email'
              value={formData.user_email}
              onChange={(e) =>
                setFormData({ ...formData, user_email: e.target.value })
              }
              placeholder='your@email.com'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label>Rating</Label>
            <div className='flex items-center space-x-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className='transition-transform hover:scale-110'>
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || formData.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className='text-sm text-muted-foreground ml-2'>
                  {formData.rating} / 5
                </span>
              )}
            </div>
          </div>

          <div>
            <Label>Comment (Optional)</Label>
            <Textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              placeholder='Share your experience with this event...'
              rows={4}
            />
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
