'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Database, BarChart3, Globe } from 'lucide-react';
import Skeleton from '@/components/common/Skeleton';
import Badge from '@/components/common/Badge';
import DataTable from '@/components/datasets/DataTable';
import DataChart from '@/components/datasets/DataChart';
import ExportMenu from '@/components/datasets/ExportMenu';
import Link from 'next/link';

interface Source {
  url: string;
  domain: string;
  fetchedAt: string;
  statusCode: number;
}

interface DataPointParsed {
  id: string;
  data: Record<string, unknown>;
  sourceId: string | null;
  isValid: boolean;
  confidence: number;
  source: Source | null;
}

interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  qualityScore: number;
  schema: string;
  format: string;
  createdAt: string;
}

interface DatasetApiResponse {
  dataset: DatasetInfo;
  dataPoints: DataPointParsed[];
  pagination: { total: number; page: number; limit: number };
  stats: Record<string, { min?: number; max?: number; uniqueValues: number; type: string }>;
}

export default function DatasetDetailPage() {
  const { id } = useParams() as { id: string };
  const [response, setResponse] = useState<DatasetApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'chart' | 'sources'>('table');

  useEffect(() => {
    async function fetchDataset() {
      try {
        const res = await fetch(`/api/datasets/${id}`);
        if (res.ok) {
          const data = await res.json();
          setResponse(data);
        }
      } catch (error) {
        console.error('Failed to fetch dataset:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDataset();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '80rem', margin: '0 auto' }}>
        <Skeleton height="2rem" width="12rem" />
        <Skeleton height="6rem" />
        <Skeleton height="24rem" />
      </div>
    );
  }

  if (!response) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h2>Dataset not found</h2>
        <Link href="/datasets" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Datasets</Link>
      </div>
    );
  }

  const dataset = response.dataset;
  const parsedData = response.dataPoints.map(dp => dp.data || {});

  // Extract unique sources
  const sources: Source[] = response.dataPoints
    .filter(dp => dp.source)
    .map(dp => dp.source as Source)
    .filter((s, i, arr) => arr.findIndex(x => x.url === s.url) === i);

  const qualityVariant: 'success' | 'warning' | 'danger' = dataset.qualityScore > 80 ? 'success' : dataset.qualityScore > 60 ? 'warning' : 'danger';

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', maxWidth: '80rem', margin: '0 auto' }}>
      <Link href="/datasets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={16} />
        Back to Datasets
      </Link>

      <header className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database size={24} style={{ color: 'var(--color-primary)' }} />
              {dataset.name}
            </h1>
            {dataset.description && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{dataset.description}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Badge label={`${dataset.rowCount} rows`} variant="info" />
              <Badge label={`${dataset.qualityScore}% Quality`} variant={qualityVariant} />
            </div>
          </div>
          <ExportMenu datasetId={dataset.id} />
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
          <Database size={16} /> Data Table
        </button>
        <button className={`tab ${activeTab === 'chart' ? 'active' : ''}`} onClick={() => setActiveTab('chart')}>
          <BarChart3 size={16} /> Visualization
        </button>
        <button className={`tab ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>
          <Globe size={16} /> Sources
        </button>
      </div>

      {/* Tab Content */}
      <div className="card" style={{ padding: '1.5rem', minHeight: '400px' }}>
        {activeTab === 'table' && <DataTable data={parsedData} />}

        {activeTab === 'chart' && <DataChart data={parsedData} />}

        {activeTab === 'sources' && (
          <div>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '1rem' }}>Data Sources</h3>
            {sources.length > 0 ? (
              <div className="grid-2">
                {sources.map((source, i) => (
                  <div key={i} className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{source.domain}</span>
                      <Badge label={String(source.statusCode)} variant={source.statusCode === 200 ? 'success' : 'danger'} size="sm" />
                    </div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', wordBreak: 'break-all' }}>
                      {source.url}
                    </a>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                      Fetched: {new Date(source.fetchedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>No source information available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
