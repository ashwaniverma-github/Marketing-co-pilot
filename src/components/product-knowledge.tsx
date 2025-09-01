'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Brain,
  Target,
  Users,
  Zap,
  TrendingUp,
  Search,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';

interface ProductKnowledge {
  id: string;
  productId: string;
  basicInfo: {
    name: string;
    tagline: string;
    url: string;
    category: string;
    targetAudience: string;
    valueProposition: string;
  };
  features: {
    core: string[];
    secondary: string[];
    unique: string[];
  };
  competitors: {
    direct: string[];
    indirect: string[];
    advantages: string[];
  };
  marketingAngles: {
    painPoints: string[];
    benefits: string[];
    emotionalTriggers: string[];
    socialProof: string[];
  };
  contentThemes: {
    educational: string[];
    promotional: string[];
    behindTheScenes: string[];
    userGenerated: string[];
  };
  seoKeywords: {
    primary: string[];
    longTail: string[];
    brandTerms: string[];
  };
  brandVoice: {
    tone: string;
    personality: string[];
    language: string;
    restrictions: string[];
  };
  createdAt: string;
  lastUpdated: string;
}

interface ProductKnowledgeProps {
  productId: string;
  productName: string;
  productUrl: string;
  tagline?: string;
  initialDbKnowledge?: any;
}

type EditableSectionKey =
  | 'basicInfo'
  | 'features'
  | 'competitors'
  | 'marketingAngles'
  | 'contentThemes'
  | 'seoKeywords'
  | 'brandVoice';

function mapDbKnowledgeToUiKnowledge(dbKnowledge: any, productId: string, productName: string, productUrl: string): ProductKnowledge {
  const basicInfo = {
    name: productName,
    tagline: '',
    url: productUrl,
    category: '',
    targetAudience: dbKnowledge?.targetAudience || '',
    valueProposition: dbKnowledge?.valueProposition || '',
  };

  const features = {
    core: dbKnowledge?.keyFeatures || [],
    secondary: [],
    unique: dbKnowledge?.uniqueSellingPoints || [],
  };

  const marketingAngles = {
    painPoints: dbKnowledge?.painPoints || [],
    benefits: dbKnowledge?.benefits || [],
    emotionalTriggers: dbKnowledge?.emotionalTriggers || [],
    socialProof: [],
  };

  const contentThemes = {
    educational: dbKnowledge?.contentThemes || [],
    promotional: [],
    behindTheScenes: [],
    userGenerated: [],
  };

  const seoKeywords = {
    primary: dbKnowledge?.primaryKeywords || [],
    longTail: dbKnowledge?.longTailKeywords || [],
    brandTerms: [
      productName?.toLowerCase?.() || '',
      `${productName?.toLowerCase?.() || ''} app`,
      `${productName?.toLowerCase?.() || ''} software`,
    ].filter(Boolean),
  };

  const brandVoice = {
    tone: dbKnowledge?.brandTone || '',
    personality: dbKnowledge?.brandPersonality || [],
    language: dbKnowledge?.communicationStyle || '',
    restrictions: dbKnowledge?.brandGuidelines?.restrictions || [],
  };

  return {
    id: dbKnowledge?.id || Date.now().toString(),
    productId,
    basicInfo,
    features,
    competitors: { direct: [], indirect: [], advantages: [] },
    marketingAngles,
    contentThemes,
    seoKeywords,
    brandVoice,
    createdAt: dbKnowledge?.createdAt || new Date().toISOString(),
    lastUpdated: dbKnowledge?.updatedAt || new Date().toISOString(),
  };
}

export function ProductKnowledge({ productId, productName, productUrl, tagline, initialDbKnowledge }: ProductKnowledgeProps) {
  const [knowledge, setKnowledge] = useState<ProductKnowledge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableKnowledge, setEditableKnowledge] = useState<ProductKnowledge | null>(null);

  useEffect(() => {
    if (initialDbKnowledge) {
      const mapped = mapDbKnowledgeToUiKnowledge(initialDbKnowledge, productId, productName, productUrl);
      setKnowledge(mapped);
      setEditableKnowledge(mapped);
      localStorage.setItem(`knowledge_${productId}`, JSON.stringify(mapped));
    } else {
      loadKnowledge();
    }
  }, [productId, initialDbKnowledge]);

  const loadKnowledge = () => {
    // Load from localStorage for now
    const savedKnowledge = localStorage.getItem(`knowledge_${productId}`);
    if (savedKnowledge) {
      const parsed = JSON.parse(savedKnowledge);
      setKnowledge(parsed);
      setEditableKnowledge(parsed);
    }
  };

  const generateKnowledge = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/enhanced-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productUrl,
          productName,
          tagline,
          existingAnalysis: knowledge
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate knowledge');
      }

      setKnowledge(result.knowledge);
      setEditableKnowledge(result.knowledge);
      
      // Save to localStorage
      localStorage.setItem(`knowledge_${productId}`, JSON.stringify(result.knowledge));

    } catch (error) {
      console.error('Failed to generate knowledge:', error);
      alert('Failed to generate product knowledge. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!editableKnowledge) return;

    const updatedKnowledge = {
      ...editableKnowledge,
      lastUpdated: new Date().toISOString()
    } as ProductKnowledge;

    try {
      const resp = await fetch('/api/enhanced-analysis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, knowledge: updatedKnowledge }),
      });
      if (!resp.ok) {
        const r = await resp.json().catch(() => ({}));
        throw new Error(r.error || 'Failed to save knowledge');
      }
      setKnowledge(updatedKnowledge);
      localStorage.setItem(`knowledge_${productId}`, JSON.stringify(updatedKnowledge));
      setIsEditing(false);
    } catch (e) {
      console.error('Save knowledge failed', e);
      alert('Failed to save knowledge. Please try again.');
    }
  };

  const cancelEditing = () => {
    setEditableKnowledge(knowledge);
    setIsEditing(false);
  };

  const updateField = (section: EditableSectionKey, field: string, value: unknown) => {
    if (!editableKnowledge) return;

    setEditableKnowledge(prev => {
      if (!prev) return prev;
      const sectionValue = (prev as Record<EditableSectionKey, any>)[section] || {};
      return {
        ...prev,
        [section]: {
          ...sectionValue,
          [field]: value,
        },
      } as ProductKnowledge;
    });
  };

  const addArrayItem = (section: EditableSectionKey, field: string) => {
    if (!editableKnowledge) return;
    
    const newItem = prompt(`Add new ${field}:`);
    if (newItem) {
      const currentArray = (editableKnowledge[section] as any)[field] || [];
      updateField(section, field, [...currentArray, newItem]);
    }
  };

  const removeArrayItem = (section: EditableSectionKey, field: string, index: number) => {
    if (!editableKnowledge) return;
    
    const currentArray = (editableKnowledge[section] as any)[field] || [];
    updateField(section, field, currentArray.filter((_: unknown, i: number) => i !== index));
  };

  const renderEditableArray = (section: EditableSectionKey, field: string, items: string[], icon: React.ReactNode) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-foreground flex items-center">
          {icon}
          <span className="ml-2 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
        </h5>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(section, field)}
          disabled={!isEditing}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <span className="text-sm text-foreground">{item}</span>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem(section, field, index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (!knowledge && !isLoading) {
    return (
      <div className="bg-card rounded-2xl border p-8">
        <div className="text-center max-w-md mx-auto">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-foreground mb-3">Enhanced Product Knowledge</h3>
          <p className="text-muted-foreground mb-6">
            Generate comprehensive AI-powered insights about your product to improve content creation and marketing strategies.
          </p>
          <Button onClick={generateKnowledge} disabled={isLoading}>
            <Brain className="w-4 h-4 mr-2" />
            Generate Knowledge Base
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Product</h3>
          <p className="text-muted-foreground">
            Our AI is analyzing your product and generating comprehensive insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">Product Knowledge Base</h3>
          <p className="text-muted-foreground mt-1">
            Comprehensive AI-generated insights about your product
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEditing}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={generateKnowledge} disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>

      {knowledge && (
        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="bg-card rounded-2xl border p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Basic Information
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableKnowledge?.basicInfo.category || ''}
                    onChange={(e) => updateField('basicInfo', 'category', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{knowledge.basicInfo.category}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Target Audience</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableKnowledge?.basicInfo.targetAudience || ''}
                    onChange={(e) => updateField('basicInfo', 'targetAudience', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{knowledge.basicInfo.targetAudience}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Value Proposition</label>
                {isEditing ? (
                  <textarea
                    value={editableKnowledge?.basicInfo.valueProposition || ''}
                    onChange={(e) => updateField('basicInfo', 'valueProposition', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{knowledge.basicInfo.valueProposition}</p>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-card rounded-2xl border p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Features Analysis
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              {renderEditableArray('features', 'core', editableKnowledge?.features?.core || [], <Target className="w-4 h-4 text-blue-500" />)}
              {renderEditableArray('features', 'secondary', editableKnowledge?.features?.secondary || [], <Users className="w-4 h-4 text-green-500" />)}
              {renderEditableArray('features', 'unique', editableKnowledge?.features?.unique || [], <Lightbulb className="w-4 h-4 text-purple-500" />)}
            </div>
          </div>

          {/* Marketing Angles */}
          <div className="bg-card rounded-2xl border p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
              Marketing Angles
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              {renderEditableArray('marketingAngles', 'painPoints', editableKnowledge?.marketingAngles?.painPoints || [], <Target className="w-4 h-4 text-red-500" />)}
              {renderEditableArray('marketingAngles', 'benefits', editableKnowledge?.marketingAngles?.benefits || [], <TrendingUp className="w-4 h-4 text-green-500" />)}
              {renderEditableArray('marketingAngles', 'emotionalTriggers', editableKnowledge?.marketingAngles?.emotionalTriggers || [], <Brain className="w-4 h-4 text-purple-500" />)}
              {renderEditableArray('marketingAngles', 'socialProof', editableKnowledge?.marketingAngles?.socialProof || [], <Users className="w-4 h-4 text-blue-500" />)}
            </div>
          </div>

          {/* SEO Keywords */}
          <div className="bg-card rounded-2xl border p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-500" />
              SEO Strategy
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              {renderEditableArray('seoKeywords', 'primary', editableKnowledge?.seoKeywords?.primary || [], <Target className="w-4 h-4 text-red-500" />)}
              {renderEditableArray('seoKeywords', 'longTail', editableKnowledge?.seoKeywords?.longTail || [], <TrendingUp className="w-4 h-4 text-green-500" />)}
              {renderEditableArray('seoKeywords', 'brandTerms', editableKnowledge?.seoKeywords?.brandTerms || [], <Brain className="w-4 h-4 text-purple-500" />)}
            </div>
          </div>

          {/* Brand Voice */}
          <div className="bg-card rounded-2xl border p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
              Brand Voice
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tone</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableKnowledge?.brandVoice?.tone || ''}
                    onChange={(e) => updateField('brandVoice', 'tone', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{knowledge.brandVoice?.tone || ''}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Language</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableKnowledge?.brandVoice?.language || ''}
                    onChange={(e) => updateField('brandVoice', 'language', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{knowledge.brandVoice?.language || ''}</p>
                )}
              </div>
              <div className="md:col-span-2">
                {renderEditableArray('brandVoice', 'personality', editableKnowledge?.brandVoice?.personality || [], <Users className="w-4 h-4 text-blue-500" />)}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Last updated: {new Date(knowledge.lastUpdated).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
