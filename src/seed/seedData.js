export const siteSettingsSeed = {
  siteName: "Otter Society",
  siteTagline: "PREMIUM SPORTS COMMUNITY",
  logoUrl:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
  navigationLinks: [
    { label: "Home", href: "/#home", order: 1 },
    { label: "Membership", href: "/membership", order: 2 },
    { label: "Events", href: "/#events", order: 3 },
    { label: "Community", href: "/community", order: 4 },
    { label: "About", href: "/#about", order: 5 },
    { label: "Testimonials", href: "/#testimonials", order: 6 },
    { label: "Contact", href: "/#contact", order: 7 },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com", order: 1 },
    { label: "YouTube", href: "https://youtube.com", order: 2 },
    { label: "LinkedIn", href: "https://linkedin.com", order: 3 },
  ],
  contact: {
    email: "hello@ottersociety.dev",
    phone: "+91 90000 12345",
    whatsapp: "+91 90000 12345",
    address: "24 Arena Drive, Sector 5, Bengaluru",
    mapUrl: "https://maps.google.com",
  },
  globalCta: {
    label: "Get Started",
    href: "/register",
  },
  isActive: true,
};

export const heroContentSeed = {
  eyebrow: "Premium Sports Community",
  title: "A modern club for athletes, families, and performance-driven teams.",
  subtitle:
    "Explore professional-grade courts, structured training programs, and curated community experiences in one destination.",
  backgroundImageUrl:
    "/hero-bg.png",
  primaryCta: {
    label: "Explore Membership",
    href: "#why-join",
  },
  secondaryCta: {
    label: "See Upcoming Events",
    href: "#events",
  },
  stats: [
    { label: "Athletes & Members", value: "2,500+" },
    { label: "Coaching Sessions / Month", value: "320+" },
    { label: "Active Programs", value: "18" },
    { label: "Weekly Community Events", value: "12" },
  ],
  isActive: true,
};

export const aboutContentSeed = {
  sectionLabel: "About The Club",
  heading: "Built for performance, wellness, and meaningful community.",
  description:
    "Otter Society blends premium sports infrastructure with coaching, events, and social spaces designed for all skill levels.",
  keyPoints: [
    "Specialized coaching paths for youth, adults, and advanced players.",
    "Integrated fitness and recovery zones for complete athletic development.",
    "Structured tournaments and social events that keep members engaged.",
  ],
  mission:
    "To make high-quality sports and wellness experiences consistently accessible to every member of our community.",
  vision:
    "To become the most trusted multi-sport community club where training excellence and member culture grow together.",
  imageUrl:
    "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1400",
  isActive: true,
};

export const homeSectionsSeed = [
  {
    key: "whyJoinUs",
    sectionLabel: "Why Join Us",
    title: "Everything you need to train, compete, and belong.",
    subtitle: "Designed for athletes, teams, and families who value consistency and quality.",
    cards: [
      {
        title: "World-Class Facilities",
        description:
          "Indoor and outdoor sports areas maintained for high performance and year-round usability.",
        meta: "Infrastructure",
      },
      {
        title: "Structured Coaching",
        description:
          "Program tracks with measurable goals, coaching plans, and progression milestones.",
        meta: "Coaching System",
      },
      {
        title: "Community Culture",
        description:
          "Events and member-led clubs that turn training routines into a vibrant social ecosystem.",
        meta: "Member Experience",
      },
    ],
    order: 1,
    isActive: true,
  },
  {
    key: "eventsPreview",
    sectionLabel: "Featured Events",
    title: "Upcoming events and high-energy club experiences.",
    subtitle: "All event cards below are managed from CMS and delivered via API.",
    cards: [
      {
        title: "Saturday Skill Sprint Clinic",
        description:
          "Fast-paced tactical training sessions focused on speed, movement, and coordination.",
        meta: "Saturday • 7:30 AM",
        imageUrl:
          "https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&w=1200&q=80",
        ctaLabel: "View Details",
        ctaHref: "#contact",
      },
      {
        title: "Community Match Night",
        description:
          "Friendly inter-group format with live scoring, mentors, and post-game networking.",
        meta: "Wednesday • 8:00 PM",
        imageUrl:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
        ctaLabel: "Reserve Spot",
        ctaHref: "#contact",
      },
      {
        title: "Family Fitness Sunday",
        description:
          "A blended wellness program for families including guided mobility and beginner drills.",
        meta: "Sunday • 9:30 AM",
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
        ctaLabel: "Join Session",
        ctaHref: "#contact",
      },
    ],
    order: 2,
    isActive: true,
  },
  {
    key: "testimonials",
    sectionLabel: "Member Voices",
    title: "What our members value most.",
    subtitle: "Published feedback from active programs and community initiatives.",
    order: 3,
    isActive: true,
  },
  {
    key: "contactCta",
    sectionLabel: "Contact & Visit",
    title: "Plan your first visit and experience the club in person.",
    subtitle:
      "Talk to our team for membership plans, coaching schedules, and event participation details.",
    ctaLabel: "Talk To The Team",
    ctaHref: "mailto:hello@ottersociety.dev",
    order: 4,
    isActive: true,
  },
];

export const testimonialsSeed = [
  {
    personName: "Rajesh Kumar",
    personRole: "Youth Soccer Parent",
    quote:
      "The soccer development program at Otter Society completely changed my son's game. The coaches don't just teach elite techniques; they build confidence, discipline, and outstanding team player values.",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    personName: "Priya Sharma",
    personRole: "Weekend Badminton League Champion",
    quote:
      "I love the Saturday match nights! The competitive atmosphere is electric, the scoring is real-time, and the club has created a fantastic community where players connect post-game over drinks.",
    avatarUrl:
      "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    personName: "David Miller",
    personRole: "Corporate Wellness Organizer",
    quote:
      "We hosted our corporate athletic tournament at Otter Society and it was absolute perfection. Highly professional coordinators, premium indoor courts, and stellar hospitality that left our employees thrilled.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    personName: "Ananya Sen",
    personRole: "Marathon & Physical Prep Trainee",
    quote:
      "The early morning track coaching and customized physical prep sessions have taken my marathon prep to the next level. Having professional recovery services right here on-site is a massive advantage.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    isFeatured: true,
    isActive: true,
  },
  {
    personName: "Marcus Vance",
    personRole: "Club Volleyball Captain",
    quote:
      "We've been training here for three seasons now. The courts are always immaculate, the social mixers connect us with amazing players, and the staff treated our squad like family from day one.",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    isFeatured: true,
    isActive: true,
  },
];
