import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsletter } from "../../hooks/useNewsletter.ts";
import { toast } from "sonner";

interface NewsletterFormProps {
  className?: string;
  variant?: "default" | "inline" | "modal";
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  className = "",
  variant = "default",
}) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { subscribe, loading, success } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await subscribe(email, name);
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
      setName("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  if (success && variant === "modal") {
    return (
      <div className='text-center py-8'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg
            className='w-8 h-8 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h3 className='text-xl font-semibold mb-2'>Welcome to CareerNamimi!</h3>
        <p className='text-gray-600 mb-4'>
          You've successfully joined our community of 250+ professionals.
        </p>
        <p className='text-sm text-gray-500'>
          Check your inbox for a welcome email with exclusive resources.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {variant === "default" && (
        <div>
          <Input
            type='text'
            placeholder='Your name (optional)'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full'
          />
        </div>
      )}

      <div className={variant === "inline" ? "flex gap-2" : ""}>
        <Input
          type='email'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={variant === "inline" ? "flex-1" : "w-full"}
        />

        <Button
          type='submit'
          disabled={loading}
          className={variant === "inline" ? "px-6" : "w-full"}>
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>

      <p className='text-xs text-gray-500 text-center'>
        Join 250+ professionals. Unsubscribe anytime.
      </p>
    </form>
  );
};
