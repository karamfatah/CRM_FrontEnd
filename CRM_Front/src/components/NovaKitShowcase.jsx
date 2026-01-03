import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  RadialBarChart,
  RadialBar
} from "recharts";
import { 
  Rocket,
  Sparkles,
  Palette,
  Component,
  Settings,
  Feather,
  Sun,
  Moon,
  ChevronRight,
  Star,
  Heart,
  ArrowUpRight,
  Search,
  Gauge,
  ShieldCheck,
  Layers,
  ChartArea,
  Bell,
  Menu
} from "lucide-react";

// shadcn/ui
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

/**
 * NovaKit — a single-file showcase packed with modern components & patterns.
 * TailwindCSS required. Uses shadcn/ui, lucide-react, framer-motion, recharts.
 *
 * Sections included:
 * - Sticky Navbar with Glassmorphism & Command Bar
 * - Hero with gradient text & animated sparkles
 * - Feature Grid (neo-brutalist cards)
 * - Analytics Dashboard widgets (Stats, Charts, Activity)
 * - Pricing cards
 * - Testimonials carousel-like strip
 * - CTA banner
 * - Footer
 * - Reusable micro components (Chip, GlassCard, GradientText, Stat, IconButton)
 */

// ---------- Reusable Micro Components ----------
const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
    {children}
  </span>
);

const GlassCard = ({ className = "", children }) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 p-[1px] backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_20px_50px_-20px_rgba(0,0,0,0.4)] ${className}`}
  >
    <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5">{children}</div>
  </div>
);

const IconButton = ({ icon: Icon, label, className = "", ...props }) => (
  <Button
    variant="ghost"
    className={`gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 ${className}`}
    {...props}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </Button>
);

const Chip = ({ children }) => (
  <Badge className="rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-1 text-white shadow-md">
    {children}
  </Badge>
);

const Stat = ({ label, value, delta, icon: Icon }) => (
  <GlassCard className="p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs/4 text-white/60">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
          <span className={`text-xs ${delta.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{delta}</span>
        </div>
      </div>
    </div>
  </GlassCard>
);

// ---------- Navbar ----------
const Navbar = ({ dark, setDark }) => {
  return (
    <div className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
              <Rocket className="h-5 w-5" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs text-white/60">UI Kit</p>
              <h1 className="text-sm font-semibold tracking-tight text-white">NovaKit</h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="relative">
              <Input className="w-72 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/50 focus-visible:ring-0" placeholder="Search components…" />
              <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-white/50" />
            </div>
            <IconButton icon={Bell} label="Alerts" />
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:flex">
              <Sun className="h-4 w-4 text-yellow-300" />
              <Switch checked={dark} onCheckedChange={setDark} />
              <Moon className="h-4 w-4 text-indigo-300" />
            </div>
            <Avatar className="ml-2">
              <AvatarImage src="https://i.pravatar.cc/100?img=20" alt="user" />
              <AvatarFallback>NF</AvatarFallback>
            </Avatar>
          </div>

          <Button variant="ghost" className="md:hidden text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------- Hero ----------
const Hero = () => {
  return (
    <div className="mx-auto mt-10 max-w-7xl px-4">
      <GlassCard className="relative overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 p-8 md:grid-cols-2 md:p-14">
          <div>
            <Chip>New in v2.7 — Animated Charts</Chip>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
              The <GradientText>most beautiful</GradientText> React component kit
            </h2>
            <p className="mt-4 max-w-xl text-white/70">
              NovaKit ships polished building blocks: glassy surfaces, gradient accents, subtle motion, and accessible components.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                Get Started <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white">
                Live Demo <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-white/70">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">4.9/5</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4" /> MIT Licensed
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-fuchsia-600/20 to-cyan-500/20 blur-2xl" />
            <GlassCard className="relative z-10 p-4">
              <PreviewCharts />
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// ---------- Feature Grid ----------
const features = [
  { icon: Sparkles, title: "Micro-animations", desc: "Framer Motion choreography out of the box." },
  { icon: Palette, title: "Theming", desc: "Beautiful gradients, dark mode, and soft shadows." },
  { icon: Component, title: "Composable", desc: "Small primitives stacked into powerful patterns." },
  { icon: Settings, title: "Configurable", desc: "Props that matter, sensible defaults that shine." },
  { icon: Layers, title: "Layered Glass", desc: "Frosted-glass surfaces with subtle borders." },
  { icon: ChartArea, title: "Charts", desc: "Recharts components styled to match the kit." },
];

const FeatureGrid = () => (
  <div className="mx-auto mt-14 max-w-7xl px-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-white shadow-lg">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-white/70">{f.desc}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  </div>
);

// ---------- Dashboard ----------
const mockChartData = [
  { name: "Mon", users: 400, sales: 240, conv: 2.1 },
  { name: "Tue", users: 800, sales: 320, conv: 2.9 },
  { name: "Wed", users: 700, sales: 360, conv: 3.4 },
  { name: "Thu", users: 900, sales: 540, conv: 3.1 },
  { name: "Fri", users: 1100, sales: 600, conv: 3.8 },
  { name: "Sat", users: 1300, sales: 760, conv: 4.0 },
  { name: "Sun", users: 900, sales: 520, conv: 3.2 },
];

const PreviewCharts = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <Card className="rounded-2xl border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Weekly Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip contentStyle={{ background: "#0b0b12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }} />
              <Area type="monotone" dataKey="users" stroke="#818cf8" fillOpacity={1} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    <Card className="rounded-2xl border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Sales vs Conversion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip contentStyle={{ background: "#0b0b12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }} />
              <Legend wrapperStyle={{ color: "white" }} />
              <Bar dataKey="sales" fill="#22d3ee" radius={[8,8,0,0]} />
              <Bar dataKey="conv" fill="#a78bfa" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ActivityItem = ({ icon: Icon, title, time, meta }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-white">{title}</p>
      <p className="text-xs text-white/60">{meta}</p>
    </div>
    <span className="text-xs text-white/50">{time}</span>
  </div>
);

const Dashboard = () => {
  return (
    <div className="mx-auto mt-14 max-w-7xl px-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-3">
          <Stat label="Active Users" value="12,418" delta="+8.4%" icon={Gauge} />
          <Stat label="MRR" value="$43,210" delta="+3.1%" icon={Feather} />
          <Stat label="NPS" value="72" delta="+2" icon={Heart} />
          <Stat label="Latency" value="82ms" delta="-4ms" icon={ShieldCheck} />

          <GlassCard className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white">Usage Trend</h3>
              <Tabs defaultValue="area">
                <TabsList className="rounded-xl bg-white/10">
                  <TabsTrigger value="area" className="text-white">Area</TabsTrigger>
                  <TabsTrigger value="line" className="text-white">Line</TabsTrigger>
                </TabsList>
                <TabsContent value="area" className="mt-2">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                        <YAxis stroke="rgba(255,255,255,0.6)" />
                        <Tooltip contentStyle={{ background: "#0b0b12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }} />
                        <Area type="monotone" dataKey="users" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.25} />
                        <Area type="monotone" dataKey="sales" stroke="#34d399" fill="#34d399" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="line" className="mt-2">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                        <YAxis stroke="rgba(255,255,255,0.6)" />
                        <Tooltip contentStyle={{ background: "#0b0b12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white" }} />
                        <Line type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="sales" stroke="#34d399" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="mb-3 text-white">Activity</h3>
            <div className="space-y-4">
              <ActivityItem icon={Rocket} title="Deployed v2.7 to production" time="2h" meta="by Nova CI" />
              <ActivityItem icon={Layers} title="New component: GlassCard" time="5h" meta="PR #482 merged" />
              <ActivityItem icon={Sparkles} title="Motion polish: Cards cascade" time="1d" meta="Design system" />
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4 lg:col-span-1">
          <GlassCard className="p-4">
            <h3 className="text-white">Engagement</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="40%" outerRadius="100%" data={[{ name: "Engagement", value: 72, fill: "#a78bfa" }]} startAngle={90} endAngle={-270}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="mb-3 text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <IconButton icon={Rocket} label="Launch" />
              <IconButton icon={Settings} label="Settings" />
              <IconButton icon={Palette} label="Theme" />
              <IconButton icon={Component} label="Blocks" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ---------- Pricing ----------
const PricingCard = ({ name, price, features, highlighted }) => (
  <GlassCard className={`p-6 ${highlighted ? "ring-2 ring-fuchsia-500" : ""}`}>
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-semibold text-white">{name}</h3>
      {highlighted && <Chip>Popular</Chip>}
    </div>
    <p className="mt-2 text-4xl font-bold text-white">
      {price}
      <span className="text-base font-normal text-white/60">/mo</span>
    </p>
    <ul className="mt-4 space-y-2">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-2 text-white/80">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> {f}
        </li>
      ))}
    </ul>
    <Button className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">Choose {name}</Button>
  </GlassCard>
);

const Pricing = () => (
  <div className="mx-auto mt-14 max-w-7xl px-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <PricingCard name="Starter" price="$9" features={["All base components", "Email support", "MIT license"]} />
      <PricingCard name="Pro" price="$29" highlighted features={["All components", "Analytics widgets", "Priority support"]} />
      <PricingCard name="Enterprise" price="$99" features={["Unlimited seats", "Design tokens", "SLA & SSO"]} />
    </div>
  </div>
);

// ---------- Testimonials ----------
const testimonials = [
  { name: "Aya Ibrahim", role: "Product Designer", quote: "The gradients & glass layers are delicious. Shipped a dashboard in hours." },
  { name: "Omar Hassan", role: "Frontend Lead", quote: "Motion defaults feel premium without being distracting." },
  { name: "Lina Nasser", role: "Founder", quote: "Our marketing site looks custom — but it's just NovaKit blocks." },
];

const Testimonials = () => (
  <div className="mx-auto mt-14 max-w-7xl px-4">
    <GlassCard className="p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Card className="rounded-2xl border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://i.pravatar.cc/100?img=${10 + i}`} />
                  <AvatarFallback>{t.name[0]}{t.name.split(" ")[1]?.[0] ?? ""}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white">{t.name}</p>
                  <p className="text-xs text-white/60">{t.role}</p>
                </div>
              </div>
              <p className="mt-3 text-white/80">“{t.quote}”</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  </div>
);

// ---------- CTA ----------
const CTA = () => (
  <div className="mx-auto mt-14 max-w-7xl px-4">
    <GlassCard className="overflow-hidden p-6">
      <div className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-2xl font-semibold text-white">Build delightful apps — faster.</h3>
          <p className="mt-2 text-white/70">Install NovaKit and start composing with our polished components today.</p>
        </div>
        <div className="flex justify-end">
          <Button className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white shadow-lg">Install Now</Button>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
      </div>
    </GlassCard>
  </div>
);

// ---------- Footer ----------
const Footer = () => (
  <div className="mx-auto my-16 max-w-7xl px-4">
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
            <Feather className="h-5 w-5" />
          </div>
          <span>© {new Date().getFullYear()} NovaKit. Crafted with care.</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="rounded-xl text-white/80">Docs</Button>
          <Button variant="ghost" className="rounded-xl text-white/80">Components</Button>
          <Button variant="ghost" className="rounded-xl text-white/80">Changelog</Button>
        </div>
      </div>
    </div>
  </div>
);

// ---------- Page Shell ----------
export default function NovaKitShowcase({ dark: darkProp, setDark: setDarkProp }) {
  const [dark, setDark] = useState(darkProp !== undefined ? darkProp : true);
  
  // Sync with external theme if provided
  useEffect(() => {
    if (darkProp !== undefined) {
      setDark(darkProp);
    }
  }, [darkProp]);

  // If external setDark is provided, use it; otherwise manage internally
  const handleDarkChange = (newDark) => {
    if (setDarkProp) {
      setDarkProp(newDark);
    } else {
      setDark(newDark);
    }
  };

  return (
    <div className={`${dark ? "bg-[#0b0b12]" : "bg-white"} min-h-screen font-sans antialiased`}>
      {/* Glowy gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12rem] -translate-x-1/2 transform">
          <div className="aspect-[1108/632] w-[72rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 blur-3xl" />
        </div>
      </div>

      <Navbar dark={dark} setDark={handleDarkChange} />
      <Hero />
      <FeatureGrid />
      <Dashboard />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
