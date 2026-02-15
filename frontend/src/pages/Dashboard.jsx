import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Calendar,
  ArrowUpRight,
  Briefcase,
  Building2,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const statCards = [
  { 
    label: 'Total Applications', 
    key: 'total',
    icon: Briefcase, 
    color: 'primary',
    gradient: 'from-primary/20 to-primary/5'
  },
  { 
    label: 'This Week', 
    key: 'weekly_applications',
    icon: Calendar, 
    color: 'accent',
    gradient: 'from-accent/20 to-accent/5'
  },
  { 
    label: 'Interviews', 
    key: 'interviews',
    icon: Target, 
    color: 'success',
    gradient: 'from-success/20 to-success/5'
  },
  { 
    label: 'Success Rate', 
    key: 'success_rate',
    icon: TrendingUp, 
    color: 'warning',
    gradient: 'from-warning/20 to-warning/5',
    suffix: '%'
  },
];

const COLORS = ['hsl(173, 80%, 45%)', 'hsl(200, 90%, 50%)', 'hsl(152, 70%, 45%)', 'hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)'];

// Mock data for charts
const mockWeeklyData = [
  { day: 'Mon', applications: 5 },
  { day: 'Tue', applications: 8 },
  { day: 'Wed', applications: 12 },
  { day: 'Thu', applications: 7 },
  { day: 'Fri', applications: 15 },
  { day: 'Sat', applications: 3 },
  { day: 'Sun', applications: 2 },
];

const mockRecentApplications = [
  { company: 'Google', position: 'Marketing Analyst', platform: 'LinkedIn', status: 'Applied', date: '2 hours ago' },
  { company: 'Meta', position: 'Growth Marketing Manager', platform: 'Greenhouse', status: 'Interview', date: '1 day ago' },
  { company: 'Amazon', position: 'Sr. Marketing Analyst', platform: 'Indeed', status: 'Applied', date: '2 days ago' },
  { company: 'Spotify', position: 'Digital Marketing Lead', platform: 'Lever', status: 'In Progress', date: '3 days ago' },
  { company: 'Netflix', position: 'Marketing Analytics Manager', platform: 'Workday', status: 'Rejected', date: '5 days ago' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 52,
    weekly_applications: 23,
    interviews: 8,
    success_rate: 15.4,
    status_breakdown: {
      Applied: 35,
      'In Progress': 8,
      Interview: 6,
      Rejected: 2,
      Offer: 1
    },
    platform_breakdown: {
      LinkedIn: 25,
      Indeed: 12,
      Greenhouse: 8,
      Lever: 4,
      Workday: 3
    }
  });
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState(mockRecentApplications);

  useEffect(() => {
    fetchStats();
    fetchRecentApplications();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/applications/stats`);
      if (response.data) {
        setStats(prev => ({
          ...prev,
          ...response.data,
          interviews: response.data.status_breakdown?.Interview || 0
        }));
      }
    } catch (error) {
      console.log('Using mock stats data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/applications?limit=5`);
      if (response.data?.applications?.length > 0) {
        setRecentApps(response.data.applications.map(app => ({
          company: app.company,
          position: app.position,
          platform: app.platform,
          status: app.status,
          date: new Date(app.applied_date).toLocaleDateString()
        })));
      }
    } catch (error) {
      console.log('Using mock applications data');
    }
  };

  const statusData = Object.entries(stats.status_breakdown || {}).map(([name, value]) => ({
    name,
    value
  }));

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-primary/20 text-primary',
      'In Progress': 'bg-accent/20 text-accent',
      'Interview': 'bg-success/20 text-success',
      'Rejected': 'bg-destructive/20 text-destructive',
      'Offer': 'bg-warning/20 text-warning'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your job application progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-medium text-success">Extension Active</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
              <CardContent className="relative p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">
                      {stats[stat.key] || 0}{stat.suffix || ''}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-${stat.color}/10`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} style={{ color: `hsl(var(--${stat.color}))` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Over Time */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWeeklyData}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173, 80%, 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(173, 80%, 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="day" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 18%, 12%)', 
                      border: '1px solid hsl(220, 15%, 18%)',
                      borderRadius: '8px',
                      color: 'hsl(210, 20%, 95%)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="hsl(173, 80%, 45%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorApps)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 18%, 12%)', 
                      border: '1px solid hsl(220, 15%, 18%)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {statusData.slice(0, 4).map((status, index) => (
                <div key={status.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-muted-foreground">{status.name}</span>
                  <span className="font-medium text-foreground ml-auto">{status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Applications */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Recent Applications
              </CardTitle>
              <a href="/applications" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApps.map((app, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{app.position}</p>
                      <p className="text-sm text-muted-foreground">{app.company} · {app.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:block">{app.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Applications by Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.platform_breakdown || {}).slice(0, 5).map(([platform, count], index) => {
                const percentage = (count / (stats.total || 1)) * 100;
                return (
                  <div key={platform} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{platform}</span>
                      <span className="text-muted-foreground">{count} applications</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
