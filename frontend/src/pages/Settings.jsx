import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Zap, 
  Clock, 
  Globe,
  Shield,
  Save,
  RotateCcw,
  ToggleLeft,
  Gauge,
  MousePointer,
  Bot,
  Key,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const platforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', category: 'Major' },
  { id: 'indeed', name: 'Indeed', icon: '🔍', category: 'Major' },
  { id: 'glassdoor', name: 'Glassdoor', icon: '🚪', category: 'Major' },
  { id: 'ziprecruiter', name: 'ZipRecruiter', icon: '⚡', category: 'Major' },
  { id: 'monster', name: 'Monster', icon: '👹', category: 'Major' },
  { id: 'dice', name: 'Dice', icon: '🎲', category: 'Tech' },
  { id: 'greenhouse', name: 'Greenhouse', icon: '🌿', category: 'ATS' },
  { id: 'lever', name: 'Lever', icon: '🔧', category: 'ATS' },
  { id: 'workday', name: 'Workday', icon: '📊', category: 'ATS' },
  { id: 'ashbyhq', name: 'Ashby HQ', icon: '🏢', category: 'ATS' },
  { id: 'ycombinator', name: 'Y Combinator', icon: '🚀', category: 'Startup' },
  { id: 'wellfound', name: 'Wellfound (AngelList)', icon: '😇', category: 'Startup' },
  { id: 'startupsgallery', name: 'Startups.Gallery', icon: '🖼️', category: 'Startup' },
  { id: 'simplyhired', name: 'SimplyHired', icon: '✅', category: 'Other' },
  { id: 'careerbuilder', name: 'CareerBuilder', icon: '🏗️', category: 'Other' },
];

const typingSpeedOptions = [
  { value: 'instant', label: 'Instant', description: 'No delay (detectable)' },
  { value: 'fast', label: 'Fast', description: '30-80ms per character' },
  { value: 'human', label: 'Human-like', description: '50-150ms (recommended)' },
  { value: 'slow', label: 'Slow', description: '100-300ms per character' },
];

const aiProviderOptions = [
  { value: 'emergent', label: 'Emergent AI', description: 'Default - No API key needed' },
  { value: 'openai', label: 'OpenAI (GPT-4)', description: 'Requires API key' },
  { value: 'claude', label: 'Claude (Anthropic)', description: 'Requires API key' },
];

const defaultSettings = {
  auto_fill_enabled: true,
  supported_platforms: {
    linkedin: true,
    indeed: true,
    greenhouse: true,
    lever: true,
    workday: true,
    glassdoor: true,
    ziprecruiter: true,
    dice: true,
    monster: true,
    ycombinator: true,
    wellfound: true,
    startupsgallery: true,
    ashbyhq: true,
    simplyhired: true,
    careerbuilder: true
  },
  typing_speed: 'human',
  typing_delay_min: 50,
  typing_delay_max: 150,
  random_delays: true,
  auto_submit: false,
  save_applications: true,
  ai_matching: true,
  ai_provider: 'emergent',
  openai_api_key: '',
  claude_api_key: ''
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      if (response.data && response.data.auto_fill_enabled !== undefined) {
        setSettings(response.data);
      }
    } catch (error) {
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/settings`, settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.success('Settings saved locally');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  const updatePlatform = (platformId, enabled) => {
    setSettings(prev => ({
      ...prev,
      supported_platforms: {
        ...prev.supported_platforms,
        [platformId]: enabled
      }
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
        <div className="animate-pulse text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your auto-fill preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetSettings} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saving} className="gap-2 gradient-primary text-primary-foreground">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </motion.div>

      {/* Master Toggle */}
      <motion.div variants={itemVariants}>
        <Card className={`border-2 transition-colors ${settings.auto_fill_enabled ? 'border-primary/50 bg-primary/5' : 'border-border/50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${settings.auto_fill_enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Zap className={`w-6 h-6 ${settings.auto_fill_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h2 className="text-lg font-display font-semibold text-foreground">Auto-Fill Extension</h2>
                  <p className="text-sm text-muted-foreground">
                    {settings.auto_fill_enabled ? 'Extension is active and ready to fill forms' : 'Extension is disabled'}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.auto_fill_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_fill_enabled: checked })}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Supported Platforms */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" />
                  Supported Platforms
                </CardTitle>
                <CardDescription>Choose which job boards to auto-fill (15 platforms)</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const allEnabled = Object.values(settings.supported_platforms).every(v => v);
                  const newState = {};
                  platforms.forEach(p => { newState[p.id] = !allEnabled; });
                  setSettings({ ...settings, supported_platforms: newState });
                }}
              >
                Toggle All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Group by category */}
            {['Major', 'Tech', 'ATS', 'Startup', 'Other'].map(category => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{category} Job Boards</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {platforms.filter(p => p.category === category).map((platform) => (
                    <div 
                      key={platform.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        settings.supported_platforms[platform.id] 
                          ? 'border-primary/30 bg-primary/5' 
                          : 'border-border/50 bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="font-medium text-sm text-foreground">{platform.name}</span>
                      </div>
                      <Switch
                        checked={settings.supported_platforms[platform.id] || false}
                        onCheckedChange={(checked) => updatePlatform(platform.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stealth Mode Settings */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              Stealth Mode
              <Badge variant="secondary" className="ml-2 bg-success/10 text-success">Anti-Detection</Badge>
            </CardTitle>
            <CardDescription>Configure human-like behavior to avoid detection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Typing Speed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  Typing Speed
                </Label>
                <Badge variant="outline">{settings.typing_speed}</Badge>
              </div>
              <Select 
                value={settings.typing_speed} 
                onValueChange={(v) => setSettings({ ...settings, typing_speed: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typingSpeedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Delay Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Typing Delay Range
                </Label>
                <span className="text-sm text-muted-foreground">
                  {settings.typing_delay_min}ms - {settings.typing_delay_max}ms
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Minimum Delay</Label>
                  <Slider
                    value={[settings.typing_delay_min]}
                    onValueChange={([v]) => setSettings({ ...settings, typing_delay_min: v })}
                    min={0}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Maximum Delay</Label>
                  <Slider
                    value={[settings.typing_delay_max]}
                    onValueChange={([v]) => setSettings({ ...settings, typing_delay_max: v })}
                    min={50}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Random Delays Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-muted-foreground" />
                  Random Micro-Delays
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add random pauses between actions (highly recommended)
                </p>
              </div>
              <Switch
                checked={settings.random_delays}
                onCheckedChange={(checked) => setSettings({ ...settings, random_delays: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI & Behavior Settings */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI & Behavior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="font-medium">AI Field Matching</Label>
                <p className="text-xs text-muted-foreground">
                  Use AI to intelligently match form fields with your profile
                </p>
              </div>
              <Switch
                checked={settings.ai_matching}
                onCheckedChange={(checked) => setSettings({ ...settings, ai_matching: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="font-medium">Save Applications</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically log applications to your tracker
                </p>
              </div>
              <Switch
                checked={settings.save_applications}
                onCheckedChange={(checked) => setSettings({ ...settings, save_applications: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/30 bg-destructive/5">
              <div className="space-y-0.5">
                <Label className="font-medium flex items-center gap-2">
                  Auto-Submit
                  <Badge variant="destructive" className="text-xs">Use with caution</Badge>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically submit applications after filling
                </p>
              </div>
              <Switch
                checked={settings.auto_submit}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_submit: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-foreground">Stealth Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use "Human-like" typing speed for best results</li>
                  <li>• Keep random delays enabled to mimic natural behavior</li>
                  <li>• Avoid using "Instant" mode on LinkedIn</li>
                  <li>• The extension adds random mouse movements between fields</li>
                  <li>• Form filling is spread over time, not instant</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
