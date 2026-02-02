import { Layout } from "@/components/Layout";
import { Mail, Phone, Clock, MapPin, Instagram, Facebook, Twitter, MessageCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Contact() {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/pregnancytoolkits",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      handle: "@pregnancytoolkits"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/pregnancytoolkits",
      color: "bg-blue-600",
      handle: "Pregnancy Toolkits"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/pregnancytools",
      color: "bg-sky-500",
      handle: "@pregnancytools"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/97333775705",
      color: "bg-green-500",
      handle: "+973 3377 5705"
    }
  ];

  return (
    <Layout title="Contact Us" showBack>
      <div className="container py-8 max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <p className="text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-primary">
            <Heart className="w-4 h-4 fill-primary" />
            <span>Supporting your pregnancy journey</span>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid gap-4">
          {/* Email Card */}
          <motion.a
            href="mailto:M.melssaid@gmail.com"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Email</h3>
              <p className="text-muted-foreground text-sm">M.melssaid@gmail.com</p>
            </div>
          </motion.a>

          {/* Phone Card */}
          <motion.a
            href="tel:+97333775705"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Phone</h3>
              <p className="text-muted-foreground text-sm">+973 3377 5705</p>
            </div>
          </motion.a>

          {/* WhatsApp Card */}
          <motion.a
            href="https://wa.me/97333775705"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">WhatsApp</h3>
              <p className="text-muted-foreground text-sm">Quick chat support</p>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              Fast Response
            </span>
          </motion.a>
        </div>

        {/* Working Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Sunday - Thursday</span>
                  <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Friday</span>
                  <span className="font-medium text-foreground">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium text-orange-600">Closed</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                * Response time may vary. We aim to respond within 24 hours.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kingdom of Bahrain
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                We provide remote support worldwide
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Follow Us</CardTitle>
              <p className="text-sm text-muted-foreground">
                Stay updated with pregnancy tips and app news
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${social.color}`}>
                      <social.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{social.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{social.handle}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-4"
        >
          <Separator className="mb-6" />
          <p className="text-sm text-muted-foreground">
            💡 For faster support, please include your device type and app version in your message.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
