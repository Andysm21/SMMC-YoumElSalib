"use client";

import React, { useState, forwardRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { MapPin, CalendarDays, CheckIcon, ArrowRightIcon, Church, User, Mail, Phone, Building2, Instagram, Music, ChevronDown, Calendar } from 'lucide-react';
import VideoEmbed from "@/components/VideoEmbed";

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Button Component
const buttonVariants = {
  default: "bg-[#D4622A] text-white shadow-sm hover:bg-[#B84F1E]",
  outline: "border-2 border-[#8B4513] text-[#8B4513] bg-white hover:bg-[#F5E6D3] font-semibold",
  ghost: "hover:bg-white/10 text-white",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const sizeClasses = {
      default: "h-10 px-6 py-2 text-base",
      sm: "h-8 px-4 text-sm",
      lg: "h-12 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all duration-200 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:ring disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Input Component
const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// Label Component
const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-4 text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

// Card Component
const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// Background Beams Component
const BackgroundBeams = React.memo(({ className }: { className?: string }) => (
  <div className={cn("absolute h-full w-full inset-0", className)}>
    <svg className="z-0 h-full w-full pointer-events-none absolute" width="100%" height="100%" viewBox="0 0 696 316" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
        stroke="url(#linearGradient-0)"
        strokeOpacity="0.2"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="linearGradient-0" x1="0%" x2="0%" y1="0%" y2="0%">
          <stop stopColor="#D4622A" stopOpacity="0" />
          <stop stopColor="#D4622A" />
          <stop offset="32.5%" stopColor="#B84F1E" />
          <stop offset="100%" stopColor="#D4622A" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </div>
));
BackgroundBeams.displayName = "BackgroundBeams";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  churchName: string;
  otherChurch: string;
  role: string;
}

export default function EventWebsite() {
  const [currentPage, setCurrentPage] = useState<"home" | "about">("home");
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    churchName: '',
    otherChurch: '',
    role: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^01\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Phone must be 01#########";
    }
    if (!formData.churchName) {
      newErrors.churchName = "Please select a church";
    }
    if (formData.churchName === "other" && !formData.otherChurch.trim()) {
      newErrors.otherChurch = "Please specify your church name";
    }
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        church: formData.churchName === "other" ? formData.otherChurch : formData.churchName,
        role: formData.role,
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error || "Failed to submit booking");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        churchName: "st-mary-maraashly",
        otherChurch: "",
        role: "",
      });
    } catch (error) {
      setSubmitError("Network error. Please try again.");
      console.error("Submission error:", error);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      churchName: 'st-mary-maraashly',
      otherChurch: '',
      role: '',
    });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4A484] via-[#E8C4A8] to-[#F5E6D3] text-gray-800">
      {/* Header
      <motion.header
        initial={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        animate={isScrolled ? { backgroundColor: "rgba(255, 255, 255, 0.95)" } : { backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-[#D4AF37]/20"
      >
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Church className="h-8 w-8 text-[#D4AF37]" />
            <span className="text-xl font-bold text-[#8B4513]">Osret Sanawy</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => { setCurrentPage("home"); }} className="text-[#8B4513] hover:bg-transparent hover:text-[#D4AF37]">
              Home
            </Button>
            <Button variant="ghost" onClick={() => { setCurrentPage("about"); }} className="text-[#8B4513] hover:bg-transparent hover:text-[#D4AF37]">
              About
            </Button>
          </div>
        </nav>
      </motion.header> */}

      {/* Hero Section */}
      {currentPage === "home" && (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <BackgroundBeams className="opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Poster and Logos */}
              <div className="flex flex-col items-center gap-6 mb-8">
                {/* Church Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <img src="/ChurchLogo2.png" alt="St. Mary Church Zamalek Logo" className="h-70 w-70 object-contain" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-5xl md:text-7xl font-bold text-[#8B4513] mb-4"
              >
                Youm El Salib - يوم الصليب
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-xl md:text-2xl text-gray-600 mb-4"
              >
                Hosted by Sunday School Family
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-lg text-gray-500 mb-8 flex items-center justify-center gap-2"
              >
                <MapPin className="h-5 w-5 text-[#D4AF37]" />
                St Mary Maraashly Church, Zamalek
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button
                  size="lg"
                  onClick={() => {
                    const bookingSection = document.getElementById('booking-section');
                    bookingSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-w-[200px]"
                >
                  Book Your Spot
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setCurrentPage("about")}
                  className="min-w-[200px]"
                >
                  About the Event
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ChevronDown className="w-8 h-8 text-[#8B4513]" />
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Booking Form Section */}
      {currentPage === "home" && (
        <section id="booking-section" className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-6">
          <BackgroundBeams className="opacity-20" />
          <div className="relative z-10 w-full flex flex-col md:flex-row gap-8 max-w-4xl items-center justify-center">
            {/* Poster Side */}
            <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
              <Image
                src="/poster.jpg"
                alt="Event Poster"
                width={1000}
                height={1200}
                className="object-cover w-full max-w-xs rounded-2xl shadow-2xl border border-[#D4AF37]/30"
                priority
              />
            </div>
            {/* Booking Form Side */}
            <div className="w-full md:w-1/2 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
              >
                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-[#D4AF37]/20"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="flex justify-center mb-6"
                    >
                      <div className="bg-green-100 rounded-full p-4">
                        <CheckIcon className="h-12 w-12 text-green-600" />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#8B4513] mb-4">Registration Successful!</h3>
                    <p className="text-gray-600 mb-8">Thank you for booking your spot. We look forward to seeing you!</p>
                    <div className="space-y-3">
                      <Button onClick={resetForm} className="w-full">
                        Register Another Person
                      </Button>
                      <Button variant="outline" onClick={() => { setCurrentPage("home"); resetForm(); }} className="w-full border-[#D4AF37] text-[#8B4513]">
                        Back to Home
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-2xl p-8 border border-[#D4AF37]/20">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-[#8B4513] mb-2">Book Your Spot</h2>
                      <p className="text-gray-600">Fill in your details to register</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {submitError && (
                        <div className="bg-red-100 border border-red-400 rounded-lg p-4">
                          <p className="text-red-700">{submitError}</p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="fullName"
                            type="text"
                            required
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="pl-10 bg-white text-gray-900"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10 bg-white text-gray-900"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            required
                            placeholder="+20 123 456 7890"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-10 bg-white text-gray-900"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <Label htmlFor="churchName">Church Name *</Label>
                        <div className="relative mt-1">
                          <Church className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                          <select
                            id="churchName"
                            required
                            value={formData.churchName}
                            onChange={(e) => handleInputChange('churchName', e.target.value)}
                            disabled={isLoading}
                            className="pl-10 w-full px-3 py-2 h-10 rounded-xl border border-input bg-white text-gray-900"
                          >
                            <option value="" disabled>
                              -- Please select a church --
                            </option>
                            <option value="st-mary-maraashly">St Mary Maraashly Church</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        {errors.churchName && <p className="text-red-500 text-sm mt-1">{errors.churchName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <div className="relative mt-1">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                          <select
                            id="role"
                            required
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            disabled={isLoading}
                            className="pl-10 w-full px-3 py-2 h-10 rounded-xl border border-input bg-white text-gray-900"
                          >
                            <option value="" disabled>
                              -- Please select a role --
                            </option>
                            <option value="family-member">Family Member</option>
                            <option value="khadem">Khadem</option>
                            <option value="makhdoum">Makhdoum</option>
                          </select>
                        </div>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                      </div>

                      {formData.churchName === 'other' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Label htmlFor="otherChurch">Please specify</Label>
                          <Input
                            id="otherChurch"
                            type="text"
                            required
                            placeholder="Enter your church name"
                            value={formData.otherChurch}
                            onChange={(e) => handleInputChange('otherChurch', e.target.value)}
                            className="mt-1 bg-white text-gray-900"
                            disabled={isLoading}
                          />
                          {errors.otherChurch && <p className="text-red-500 text-sm mt-1">{errors.otherChurch}</p>}
                        </motion.div>
                      )}

                      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Registration"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentPage("home")}
                        className="w-full text-[#8B4513] hover:bg-[#8B4513]/10"
                      >
                        Back to Home
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {currentPage === "about" && (
        <section className="relative min-h-screen pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-[#8B4513] mb-4">About the Event</h2>
                <p className="text-xl text-gray-600">A spiritual gathering at St Mary Maraashly Church</p>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#D4AF37]/20">
                <h3 className="text-2xl font-bold text-[#8B4513] mb-4">Event Description</h3>

                {/* English */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  Join us for a blessed and uplifting spiritual evening as we celebrate Youm El Salib (The Feast of the Cross), hosted by Sunday School Family at St Mary Maraashly Church – Zamalek.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  This special event brings together faith, creativity, and worship through a powerful program that includes live acting, choir performances, and heartfelt praise. Experience the story and meaning of the Cross in a way that touches the heart and strengthens the spirit.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Come and be part of a joyful gathering filled with worship, fellowship, and the presence of God. Let us unite in faith, reflect on the depth of Christ’s love, and celebrate together in an atmosphere of grace and peace.
                </p>

                <p className="text-gray-700 mb-8 font-medium">
                  ✨ All are welcome — we would love to have you with us.
                </p>

                {/* Separator */}
                <div className="w-full h-px bg-[#D4AF37]/40 mb-8"></div>

                {/* Arabic */}
                <p className="text-gray-700 leading-relaxed mb-6 text-right" dir="rtl">
                  انضموا إلينا في أمسية روحية مميزة ومليئة بالبركة للاحتفال بيوم الصليب، والتي تنظمها أسرة ثانوي في كنيسة العذراء مرياشلي – الزمالك.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6 text-right" dir="rtl">
                  يجمع هذا اللقاء بين الإيمان والإبداع من خلال برنامج متكامل يشمل تمثيلًا مؤثرًا، وكورالًا روحيًا، وتسبيحًا مليئًا بالمحبة، لنعيش معًا معنى الصليب بطريقة تمس القلب وتُقوّي الروح.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6 text-right" dir="rtl">
                  تعالوا لنقضي وقتًا مليئًا بالعبادة والشركة وحضور الله، حيث نتأمل في محبة المسيح العظيمة ونجدد حياتنا الروحية في جو من السلام والنعمة.
                </p>

                <p className="text-gray-700 text-right font-medium" dir="rtl">
                  ✨ الدعوة مفتوحة للجميع — يسعدنا حضوركم ومشاركتكم معنا.
                </p>
              </div>

              {/* Event Details Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-white/70 backdrop-blur-lg border-[#D4AF37]/30 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Date & Time</h3>
                    <p className="text-gray-700">April 2, 2025 - 7:30 PM</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-lg border-[#D4AF37]/30 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Location</h3>
                    <p className="text-gray-700">St Mary Maraashly Church, Zamalek</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-lg border-[#D4AF37]/30 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Church className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Host</h3>
                    <p className="text-gray-700">Sunday School Family</p>
                  </CardContent>
                </Card>
              </div>

              {/* Video Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#D4AF37]/20">
                <h3 className="text-2xl font-bold text-[#8B4513] mb-6 text-center">Watch Our Videos</h3>
                
                {/* Behind-Scenes Video Card - Instagram Reel Dimensions */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full max-w-sm bg-gradient-to-br from-[#D4A484]/10 to-[#F5E6D3]/20 rounded-2xl p-6 border border-[#D4AF37]/30 shadow-lg hover:shadow-2xl transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4 justify-center">
                      <div className="bg-gradient-to-tr from-[#D4622A] to-[#F59E42] rounded-full p-2">
                        <Music className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-[#8B4513]">Behind the Scenes</h4>
                    </div>
                    {/* Instagram Reel aspect ratio (9:16) */}
                    <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-lg mb-4 group cursor-pointer">
                      <video
                        src="/assets/videos/Vid1.mp4"
                        controls
                        controlsList="nodownload"
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      {/* Play button overlay for better UX */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/90 rounded-full p-4">
                          <div className="w-0 h-0 border-l-8 border-l-[#D4622A] border-t-5 border-t-transparent border-b-5 border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mb-4">Get an exclusive look at what happens behind the scenes</p>
                  </motion.div>
                </div>

              </div>

              {/* Social Links Section */}
              <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] rounded-2xl shadow-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
                <p className="text-white/90 mb-6">Follow us for updates and inspiration</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* <a
                    href="https://www.tiktok.com/@osretsanawy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Music className="h-5 w-5" />
                    TikTok Account
                  </a> */}
                  <a
                    href="https://www.instagram.com/youmelsalib.zamalek"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity"
                  >
                    <Instagram className="h-5 w-5" />
                    Instagram Account
                  </a>
                </div>
              </div>

              <div className="text-center">
                <Button size="lg" onClick={() => setCurrentPage("home")} className="bg-[#D4AF37] text-[#8B4513] hover:bg-[#C5A028]">
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-[#8B4513] to-[#A0522D] text-white py-8 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">© 2024 Sunday School Family - St Mary Maraashly Church. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
