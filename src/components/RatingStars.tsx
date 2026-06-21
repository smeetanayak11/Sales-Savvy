import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({ rating, size = "sm" }: RatingStarsProps) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4.5 w-4.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            className={`${sizeClass} ${filled ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
          />
        );
      })}
    </div>
  );
}
