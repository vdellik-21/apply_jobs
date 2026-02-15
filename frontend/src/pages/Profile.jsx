import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Linkedin, 
  MapPin, 
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const defaultProfile = {
  personal_info: {
    full_name: "Vineeth Dellikar",
    email: "vineeth.dellikar@gmail.com",
    phone: "+1 (309) 612-8928",
    linkedin: "linkedin.com/in/vineethdellikar",
    location: "Normal, IL, USA",
    street_address: "906 Hovey Ave Apt 2",
    city: "Normal",
    state: "IL",
    state_full: "Illinois",
    zip_code: "61761",
    country: "United States",
    country_code: "US",
    website: "",
    github: "",
    portfolio: ""
  },
  summary: "Results-driven Marketing Analytics professional with 4+ years of experience in digital marketing, performance marketing, and data-driven campaign optimization. Currently pursuing MS in Marketing Analytics (STEM) at Illinois State University with a 3.92 GPA. Proven track record of achieving 28-32x ROAS on high-ticket B2C campaigns.",
  highlight_tags: [
    "28x-32x ROAS Achieved",
    "$336K-$384K Monthly Revenue",
    "4+ Years Marketing Experience",
    "3.92 GPA - MS Marketing Analytics",
    "STEM Designated Program",
    "Google & Meta Certified",
    "14 Professional Certifications",
    "US Work Authorization"
  ],
  work_experience: [
    {
      id: "exp1",
      title: "Graduate Research Assistant",
      company: "Illinois State University",
      location: "Normal, IL",
      start_date: "Aug 2025",
      end_date: "May 2026",
      current: true,
      description: "Collaborate with faculty on research papers, build AI-powered apps for research tasks.",
      achievements: ["100+ marketing research papers supported", "30% research prep time reduction", "6+ hours/week saved via AI tools"]
    },
    {
      id: "exp2",
      title: "Marketing Lead",
      company: "Ardent Technologies",
      location: "USA",
      start_date: "May 2025",
      end_date: "Dec 2025",
      current: false,
      description: "Managed paid advertising for US IVF clinics, executed Meta & Google Ads.",
      achievements: ["35% improvement in consultations", "28% reduction in Cost per Consultation", "40% increase in booking rates"]
    },
    {
      id: "exp3",
      title: "Marketing Chairperson",
      company: "M.A.S.S. RSO, Illinois State University",
      location: "Normal, IL",
      start_date: "Oct 2024",
      end_date: "Dec 2025",
      current: false,
      description: "Led marketing campaigns, revamped branding and outreach using A/B testing.",
      achievements: ["60% YoY increase in event participation", "25% boost in new member sign-ups"]
    },
    {
      id: "exp4",
      title: "Digital Marketing Manager",
      company: "Marketing Dollar",
      location: "India",
      start_date: "Apr 2021",
      end_date: "July 2024",
      current: false,
      description: "Freelance consultancy for high-ticket IVF clients. Managed $12,000/month ad budget.",
      achievements: ["28x-32x ROAS achieved", "28-32 deals closed per week", "$336K-$384K monthly revenue"]
    },
    {
      id: "exp5",
      title: "Digital Marketing Specialist",
      company: "The Stars Wellness",
      location: "India",
      start_date: "Apr 2020",
      end_date: "Apr 2021",
      current: false,
      description: "Market research with 10,000+ survey respondents, pricing strategy development.",
      achievements: ["125% ROI achieved", "1,000+ sign-ups in month 1", "$44,000 revenue in month 1"]
    },
    {
      id: "exp6",
      title: "Partner Acquisition Specialist",
      company: "UrbanCompany",
      location: "India",
      start_date: "Feb 2020",
      end_date: "Apr 2020",
      current: false,
      description: "India's largest home services marketplace. Outbound prospecting and partner onboarding.",
      achievements: ["7-8 qualified appointments per day", "50+ partners onboarded in 3 months"]
    },
    {
      id: "exp7",
      title: "Program Coordinator",
      company: "Landmark Worldwide",
      location: "India",
      start_date: "Jan 2020",
      end_date: "Sept 2020",
      current: false,
      description: "Orchestrated large events, managed 50+ volunteers, crisis management.",
      achievements: ["Coordinated 300-person events", "20% reduction in setup time"]
    },
    {
      id: "exp8",
      title: "Business Development Intern",
      company: "AIESEC",
      location: "India",
      start_date: "Oct 2019",
      end_date: "Jan 2020",
      current: false,
      description: "International student exchange program promotion, recruitment initiatives.",
      achievements: ["Led student recruitment", "Cross-cultural communication"]
    },
    {
      id: "exp9",
      title: "Digital Marketing Intern",
      company: "DDIP (Digital Deepak)",
      location: "India",
      start_date: "2019",
      end_date: "2019",
      current: false,
      description: "6-month intensive training in Meta Ads, Google Ads, SEO, email marketing.",
      achievements: ["10+ SEO blog posts", "Built WordPress sites", "Landing page design"]
    }
  ],
  education: [
    {
      id: "edu1",
      degree: "Master of Science",
      field: "Marketing Analytics (STEM)",
      institution: "Illinois State University",
      location: "Normal, IL",
      start_date: "Aug 2024",
      end_date: "May 2026",
      gpa: "3.92/4.0",
      achievements: ["STEM Designated Program"]
    },
    {
      id: "edu2",
      degree: "Bachelor of Business Administration",
      field: "Business Administration",
      institution: "Osmania University",
      location: "India",
      start_date: "2019",
      end_date: "2022",
      gpa: "3.4/4.0",
      achievements: []
    }
  ],
  skills: [
    "Google Analytics", "GA4", "Google Ads", "Meta Ads", "Facebook Ads",
    "Tableau", "SQL", "Python", "R/RStudio", "Power BI",
    "HubSpot", "Salesforce CRM", "SEO", "Email Marketing",
    "A/B Testing", "Market Research", "Data Analysis"
  ],
  certifications: [
    { id: "cert1", name: "Google Analytics Certified", issuer: "Google", date: "2023" },
    { id: "cert2", name: "Google Ads Certified", issuer: "Google", date: "2023" },
    { id: "cert3", name: "Meta Blueprint Certified", issuer: "Meta", date: "2022" },
    { id: "cert4", name: "HubSpot Marketing Software Certified", issuer: "HubSpot", date: "2022" },
    { id: "cert5", name: "Tableau Certified", issuer: "Tableau", date: "2023" }
  ],
  languages: ["English", "Hindi", "Telugu"]
};

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSkill, setEditingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/profile`);
      if (response.data && response.data.personal_info) {
        setProfile(response.data);
      }
    } catch (error) {
      console.log('Using default profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/profile`, profile);
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const resetProfile = async () => {
    try {
      await axios.post(`${API_URL}/api/profile/reset`);
      setProfile(defaultProfile);
      toast.success('Profile reset to default');
    } catch (error) {
      setProfile(defaultProfile);
      toast.success('Profile reset to default');
    }
  };

  const updatePersonalInfo = (field, value) => {
    setProfile(prev => ({
      ...prev,
      personal_info: { ...prev.personal_info, [field]: value }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your auto-fill information</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetProfile} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={saveProfile} disabled={saving} className="gap-2 gradient-primary text-primary-foreground">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic contact details for job applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  value={profile.personal_info.full_name}
                  onChange={(e) => updatePersonalInfo('full_name', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  type="email"
                  value={profile.personal_info.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone
                </label>
                <Input
                  value={profile.personal_info.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="+1 (xxx) xxx-xxxx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                  LinkedIn
                </label>
                <Input
                  value={profile.personal_info.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Location
                </label>
                <Input
                  value={profile.personal_info.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="City, State, Country"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  Website (Optional)
                </label>
                <Input
                  value={profile.personal_info.website || ''}
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  placeholder="yourwebsite.com"
                />
              </div>
            </div>
            
            {/* Address Section */}
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Address (for smart auto-fill)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                  <label className="text-xs text-muted-foreground">Street Address</label>
                  <Input
                    value={profile.personal_info.street_address || ''}
                    onChange={(e) => updatePersonalInfo('street_address', e.target.value)}
                    placeholder="123 Main St Apt 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">City</label>
                  <Input
                    value={profile.personal_info.city || ''}
                    onChange={(e) => updatePersonalInfo('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">State (Abbrev)</label>
                  <Input
                    value={profile.personal_info.state || ''}
                    onChange={(e) => updatePersonalInfo('state', e.target.value)}
                    placeholder="IL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">State (Full)</label>
                  <Input
                    value={profile.personal_info.state_full || ''}
                    onChange={(e) => updatePersonalInfo('state_full', e.target.value)}
                    placeholder="Illinois"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">ZIP Code</label>
                  <Input
                    value={profile.personal_info.zip_code || ''}
                    onChange={(e) => updatePersonalInfo('zip_code', e.target.value)}
                    placeholder="61761"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Country</label>
                  <Input
                    value={profile.personal_info.country || ''}
                    onChange={(e) => updatePersonalInfo('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Country Code</label>
                  <Input
                    value={profile.personal_info.country_code || ''}
                    onChange={(e) => updatePersonalInfo('country_code', e.target.value)}
                    placeholder="US"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Highlight Tags */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Highlight Tags
                </CardTitle>
                <CardDescription>Key achievements that stand out on applications</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingTags(!editingTags)}>
                {editingTags ? 'Done' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(profile.highlight_tags || defaultProfile.highlight_tags).map((tag, index) => (
                <Badge 
                  key={index} 
                  className="px-3 py-1.5 text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors group"
                >
                  {tag}
                  {editingTags && (
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {editingTags && (
              <div className="flex gap-2 mt-4">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a highlight tag (e.g., '5x Revenue Growth')..."
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Professional Summary */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-accent" />
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.summary}
              onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Write a brief professional summary..."
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">{profile.summary.length} characters</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Work Experience */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-success" />
                  Work Experience
                </CardTitle>
                <CardDescription>{profile.work_experience.length} positions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {profile.work_experience.map((exp, index) => (
                <AccordionItem key={exp.id} value={exp.id} className="border border-border/50 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">{exp.company} · {exp.start_date} - {exp.current ? 'Present' : exp.end_date}</p>
                      </div>
                      {exp.current && (
                        <Badge className="ml-2 bg-success/10 text-success">Current</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...profile.work_experience];
                            updated[index].title = e.target.value;
                            setProfile(prev => ({ ...prev, work_experience: updated }));
                          }}
                          placeholder="Job Title"
                        />
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...profile.work_experience];
                            updated[index].company = e.target.value;
                            setProfile(prev => ({ ...prev, work_experience: updated }));
                          }}
                          placeholder="Company"
                        />
                      </div>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...profile.work_experience];
                          updated[index].description = e.target.value;
                          setProfile(prev => ({ ...prev, work_experience: updated }));
                        }}
                        placeholder="Job description..."
                        className="min-h-20"
                      />
                      <div className="flex flex-wrap gap-2">
                        {exp.achievements.map((achievement, achIndex) => (
                          <Badge key={achIndex} variant="secondary" className="gap-1">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Education */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-warning" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={edu.id} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={`${edu.degree} in ${edu.field}`}
                        onChange={(e) => {
                          const [degree, ...fieldParts] = e.target.value.split(' in ');
                          const updated = [...profile.education];
                          updated[index].degree = degree;
                          updated[index].field = fieldParts.join(' in ');
                          setProfile(prev => ({ ...prev, education: updated }));
                        }}
                        className="font-medium"
                      />
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{edu.institution}</span>
                        <span>·</span>
                        <span>{edu.start_date} - {edu.end_date}</span>
                        {edu.gpa && (
                          <>
                            <span>·</span>
                            <span>GPA: {edu.gpa}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Skills
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setEditingSkill(!editingSkill)}>
                {editingSkill ? 'Done' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 transition-colors group"
                >
                  {skill}
                  {editingSkill && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {editingSkill && (
              <div className="flex gap-2 mt-4">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Certifications */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.certifications.map((cert) => (
                <div key={cert.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
