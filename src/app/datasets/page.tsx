'use client';

import { useState, useEffect } from 'react';
import { Search, Database, BarChart3, Download } from 'lucide-react';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ExportMenu from '@/components/datasets/ExportMenu';
import Badge from '@/components/common/Badge';
import Link from 'next/link';

interface Dataset {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  qualityScore: number;
  createdAt: string;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const res = await fetch('/api/datasets');
        if (res.ok) {
          const data = await res.json();
          setDatasets(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch datasets:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDatasets();
  }, []);

  const filteredDatasets = datasets.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Datasets</h1>
          <p className="text-[var(--color-text-muted)]">Browse and explore your collected data</p>
        </div>
      </header>

      <div className="flex bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search datasets by name..." 
            className="search-input w-full pl-9 pr-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton height="12rem" />
          <Skeleton height="12rem" />
          <Skeleton height="12rem" />
        </div>
      ) : filteredDatasets.length === 0 ? (
        <EmptyState 
          title="No datasets found" 
          description={searchQuery ? "Try a different search term" : "Complete a task to generate a dataset"}
          icon={<Database className="w-10 h-10 text-[var(--color-text-muted)]" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map(dataset => (
            <div key={dataset.id} className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1" title={dataset.name}>{dataset.name}</h3>
                  <Badge 
                    variant={dataset.qualityScore > 80 ? 'success' : dataset.qualityScore > 60 ? 'warning' : 'error'}
                    label={`${dataset.qualityScore}% Q`}
                  />
                </div>
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4 h-10">
                  {dataset.description || "No description provided."}
                </p>
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-4">
                  <span className="flex items-center gap-1"><Database className="w-4 h-4" /> {dataset.rowCount} rows</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] mt-auto">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(dataset.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <ExportMenu datasetId={dataset.id} />
                  <Link href={`/datasets/${dataset.id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
