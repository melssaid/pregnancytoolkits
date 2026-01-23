import { motion } from "framer-motion";
import { Star, MessageCircle, Heart } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    avatar: "👩‍🦰",
    text: "This app helped me through my entire pregnancy! Worth every penny.",
    rating: 5,
  },
  {
    name: "Emily R.",
    avatar: "👩",
    text: "The premium features are amazing. I use it every single day!",
    rating: 5,
  },
  {
    name: "Jessica L.",
    avatar: "👩‍🦱",
    text: "Best investment for my pregnancy journey. Highly recommend!",
    rating: 5,
  },
];

const stats = [
  { value: "500K+", label: "Happy Moms" },
  { value: "4.9★", label: "App Rating" },
  { value: "31", label: "Tools" },
  { value: "24/7", label: "Support" },
];

export function SocialProof() {
  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="container">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-2xl bg-card shadow-card border border-border"
            >
              <div className="text-3xl font-extrabold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Loved by Moms Worldwide 💕
          </h2>
          <p className="text-muted-foreground">
            Join thousands of happy mothers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border relative"
            >
              {/* Quote mark */}
              <div className="absolute top-4 right-4 text-4xl text-primary/20 font-serif">
                "
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-3">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-4 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{testimonial.avatar}</span>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-primary text-primary" />
                    Verified Mom
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-2 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <MessageCircle className="h-4 w-4" />
            <span>127 moms subscribed in the last hour</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default SocialProof;
