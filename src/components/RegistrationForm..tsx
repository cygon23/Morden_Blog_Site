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
import { Calendar as CalendarIcon } from "lucide-react";

export const RegistrationForm = ({ open, onClose, onSubmit, event }) => {
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ user_name: "", user_email: "" });
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
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>{event?.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.user_name}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
              placeholder='John Doe'
              required
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              type='email'
              value={formData.user_email}
              onChange={(e) =>
                setFormData({ ...formData, user_email: e.target.value })
              }
              placeholder='john@example.com'
              required
            />
          </div>

          <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <div className='flex items-center space-x-2 text-blue-700'>
              <CalendarIcon className='w-5 h-5' />
              <span className='font-medium'>
                You'll be automatically reminded via Google Calendar
              </span>
            </div>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <CalendarIcon className='w-4 h-4 mr-2 animate-spin' />
                  Adding to Calendar...
                </>
              ) : (
                <>
                  <CalendarIcon className='w-4 h-4 mr-2' />
                  Register & Add to Calendar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
