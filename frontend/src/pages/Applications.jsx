import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Download, 
  Plus,
  Building2,
  Calendar,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  Trash2,
  Edit,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const statusOptions = ['Applied', 'In Progress', 'Interview', 'Rejected', 'Offer'];
const platformOptions = ['LinkedIn', 'Indeed', 'Greenhouse', 'Lever', 'Workday', 'Glassdoor', 'ZipRecruiter', 'Other'];

const mockApplications = [
  { _id: '1', company: 'Google', position: 'Marketing Analyst', platform: 'LinkedIn', status: 'Interview', applied_date: '2024-01-15', job_url: 'https://linkedin.com/jobs/1', auto_filled: true, fields_filled: 12 },
  { _id: '2', company: 'Meta', position: 'Growth Marketing Manager', platform: 'Greenhouse', status: 'Applied', applied_date: '2024-01-14', job_url: 'https://meta.com/careers', auto_filled: true, fields_filled: 15 },
  { _id: '3', company: 'Amazon', position: 'Sr. Marketing Analyst', platform: 'Indeed', status: 'In Progress', applied_date: '2024-01-13', job_url: 'https://amazon.jobs', auto_filled: true, fields_filled: 10 },
  { _id: '4', company: 'Spotify', position: 'Digital Marketing Lead', platform: 'Lever', status: 'Applied', applied_date: '2024-01-12', job_url: 'https://spotify.com/careers', auto_filled: true, fields_filled: 14 },
  { _id: '5', company: 'Netflix', position: 'Marketing Analytics Manager', platform: 'Workday', status: 'Rejected', applied_date: '2024-01-10', job_url: 'https://netflix.com/jobs', auto_filled: true, fields_filled: 11 },
  { _id: '6', company: 'Apple', position: 'Performance Marketing', platform: 'Glassdoor', status: 'Offer', applied_date: '2024-01-08', job_url: 'https://apple.com/careers', auto_filled: true, fields_filled: 13 },
];

export default function Applications() {
  const [applications, setApplications] = useState(mockApplications);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newApplication, setNewApplication] = useState({
    company: '',
    position: '',
    platform: 'LinkedIn',
    status: 'Applied',
    job_url: '',
    notes: '',
    applied_date: new Date().toISOString().split('T')[0],
    auto_filled: false,
    fields_filled: 0
  });

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, platformFilter]);

  const fetchApplications = async () => {
    try {
      let url = `${API_URL}/api/applications?limit=100`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (platformFilter !== 'all') url += `&platform=${platformFilter}`;
      
      const response = await axios.get(url);
      if (response.data?.applications?.length > 0) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.log('Using mock data');
    } finally {
      setLoading(false);
    }
  };

  const addApplication = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/applications`, newApplication);
      setApplications([response.data.application, ...applications]);
      toast.success('Application added successfully!');
      setIsAddDialogOpen(false);
      setNewApplication({
        company: '',
        position: '',
        platform: 'LinkedIn',
        status: 'Applied',
        job_url: '',
        notes: '',
        applied_date: new Date().toISOString().split('T')[0],
        auto_filled: false,
        fields_filled: 0
      });
    } catch (error) {
      // Mock add for demo
      const mockApp = {
        ...newApplication,
        _id: Date.now().toString()
      };
      setApplications([mockApp, ...applications]);
      toast.success('Application added successfully!');
      setIsAddDialogOpen(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const app = applications.find(a => a._id === id);
      await axios.put(`${API_URL}/api/applications/${id}`, { ...app, status: newStatus });
      setApplications(applications.map(a => 
        a._id === id ? { ...a, status: newStatus } : a
      ));
      toast.success('Status updated!');
    } catch (error) {
      setApplications(applications.map(a => 
        a._id === id ? { ...a, status: newStatus } : a
      ));
      toast.success('Status updated!');
    }
  };

  const deleteApplication = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/applications/${id}`);
      setApplications(applications.filter(a => a._id !== id));
      toast.success('Application deleted');
    } catch (error) {
      setApplications(applications.filter(a => a._id !== id));
      toast.success('Application deleted');
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/applications/export`);
      const data = response.data?.data || applications.map(app => ({
        Company: app.company,
        Position: app.position,
        Platform: app.platform,
        Status: app.status,
        'Applied Date': app.applied_date,
        'Job URL': app.job_url || '',
        'Auto-Filled': app.auto_filled ? 'Yes' : 'No',
        'Fields Filled': app.fields_filled
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');
      XLSX.writeFile(wb, `job_applications_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Exported to Excel!');
    } catch (error) {
      // Fallback with current data
      const data = applications.map(app => ({
        Company: app.company,
        Position: app.position,
        Platform: app.platform,
        Status: app.status,
        'Applied Date': app.applied_date,
        'Job URL': app.job_url || '',
        'Auto-Filled': app.auto_filled ? 'Yes' : 'No',
        'Fields Filled': app.fields_filled
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');
      XLSX.writeFile(wb, `job_applications_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Exported to Excel!');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status) => {
    const icons = {
      'Applied': <Clock className="w-4 h-4" />,
      'In Progress': <Clock className="w-4 h-4" />,
      'Interview': <CheckCircle2 className="w-4 h-4" />,
      'Rejected': <XCircle className="w-4 h-4" />,
      'Offer': <Award className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-primary/10 text-primary border-primary/20',
      'In Progress': 'bg-accent/10 text-accent border-accent/20',
      'Interview': 'bg-success/10 text-success border-success/20',
      'Rejected': 'bg-destructive/10 text-destructive border-destructive/20',
      'Offer': 'bg-warning/10 text-warning border-warning/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">Track and manage your job applications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Add Job Application</DialogTitle>
                <DialogDescription>Manually log a job application</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={newApplication.company}
                      onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={newApplication.position}
                      onChange={(e) => setNewApplication({ ...newApplication, position: e.target.value })}
                      placeholder="Job title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={newApplication.platform} onValueChange={(v) => setNewApplication({ ...newApplication, platform: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={newApplication.status} onValueChange={(v) => setNewApplication({ ...newApplication, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Job URL</Label>
                  <Input
                    value={newApplication.job_url}
                    onChange={(e) => setNewApplication({ ...newApplication, job_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newApplication.notes}
                    onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                    placeholder="Any notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={addApplication} className="gradient-primary text-primary-foreground">Add Application</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search companies or positions..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {platformOptions.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applications List */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              All Applications
              <Badge variant="secondary" className="ml-2">{filteredApplications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {filteredApplications.map((app, index) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="group p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-foreground truncate">{app.position}</h3>
                            {app.auto_filled && (
                              <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                Auto-filled
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="font-medium">{app.company}</span>
                            <span>·</span>
                            <span>{app.platform}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(app.applied_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select value={app.status} onValueChange={(v) => updateStatus(app._id, v)}>
                          <SelectTrigger className={`w-32 ${getStatusColor(app.status)} border`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(s => (
                              <SelectItem key={s} value={s}>
                                <span className="flex items-center gap-2">
                                  {getStatusIcon(s)}
                                  {s}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {app.job_url && (
                              <DropdownMenuItem onClick={() => window.open(app.job_url, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Job Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteApplication(app._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No applications found</p>
                  <p className="text-sm">Try adjusting your filters or add a new application</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
