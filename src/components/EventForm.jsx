import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const EventForm = ({ open, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      date: "",
      time: "",
      type: "Webinar",
      location: "",
      max_attendees: 100,
      speaker_name: "",
      speaker_role: "",
      speaker_avatar: "",
      price: "",
      featured: false,
      status: "upcoming",
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Event" : "Add New Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label>Event Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Date</Label>
              <Input
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                placeholder='Mar 15, 2025'
                required
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                placeholder='9:00 AM EST'
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Event Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Webinar'>Webinar</SelectItem>
                  <SelectItem value='Workshop'>Workshop</SelectItem>
                  <SelectItem value='Panel'>Panel</SelectItem>
                  <SelectItem value='In-Person'>In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label>Max Attendees</Label>
            <Input
              type='number'
              value={formData.max_attendees}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_attendees: parseInt(e.target.value),
                })
              }
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Speaker Name</Label>
              <Input
                value={formData.speaker_name}
                onChange={(e) =>
                  setFormData({ ...formData, speaker_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Speaker Role</Label>
              <Input
                value={formData.speaker_role}
                onChange={(e) =>
                  setFormData({ ...formData, speaker_role: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label>Speaker Avatar URL</Label>
            <Input
              value={formData.speaker_avatar}
              onChange={(e) =>
                setFormData({ ...formData, speaker_avatar: e.target.value })
              }
              placeholder='https://...'
            />
          </div>

          <div>
            <Label>Price</Label>
            <Input
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder='Coming Soon or $25'
              required
            />
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked })
              }
            />
            <Label>Featured Event</Label>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>
              {initialData ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
