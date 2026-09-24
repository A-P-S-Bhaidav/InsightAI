'use client'
import React from 'react';
import { Briefcase, Users, TrendingUp, BarChart3, Star, Newspaper } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TemplateGalleryProps {
  onSelect: (prompt: string) => void;
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const templates = [
    {
      title: 'Job Market Research',
      description: 'Find tech job openings with salary data across major platforms',
      icon: Briefcase,
      prompt: 'Find tech job openings with salary data across major platforms',
      category: 'Research'
    },
    {
      title: 'Sales Lead Generation',
      description: 'Collect business contact information for potential B2B clients',
      icon: Users,
      prompt: 'Collect business contact information for potential B2B clients',
      category: 'Sales'
    },
    {
      title: 'Competitor Analysis',
      description: 'Research competitor products, pricing, and market positioning',
      icon: TrendingUp,
      prompt: 'Research competitor products, pricing, and market positioning',
      category: 'Analysis'
    },
    {
      title: 'Market Trends',
      description: 'Monitor emerging trends and industry developments',
      icon: BarChart3,
      prompt: 'Monitor emerging trends and industry developments',
      category: 'Monitoring'
    },
    {
      title: 'Product Reviews',
      description: 'Gather and analyze customer reviews from multiple sources',
      icon: Star,
      prompt: 'Gather and analyze customer reviews from multiple sources',
      category: 'Analysis'
    },
    {
      title: 'News Monitoring',
      description: 'Track breaking news and developments in specific industries',
      icon: Newspaper,
      prompt: 'Track breaking news and developments in specific industries',
      category: 'Monitoring'
    }
  ];

  return (
    <div className="template-gallery grid-3">
      {templates.map((template, idx) => (
        <div 
          key={idx} 
          className="card template-card"
          onClick={() => onSelect(template.prompt)}
          style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div className="template-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <template.icon size={24} className="template-icon text-primary" />
            <Badge label={template.category} variant="info" size="sm" />
          </div>
          <h3 className="template-title" style={{ margin: 0, fontSize: '1.125rem' }}>{template.title}</h3>
          <p className="template-description" style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>{template.description}</p>
        </div>
      ))}
    </div>
  );
}

export default TemplateGallery;
