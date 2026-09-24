'use client'
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface DataTableProps {
  data: Record<string, unknown>[];
  columns?: string[];
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
}

export function DataTable({ data, columns, onSort, sortColumn, sortOrder }: DataTableProps) {
  const [localSortCol, setLocalSortCol] = useState(sortColumn || '');
  const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc'>(sortOrder || 'asc');

  if (data.length === 0) {
    return <div className="card"><EmptyState title="No data" description="This dataset is empty." /></div>;
  }

  const displayColumns = columns || Object.keys(data[0]);
  const displayData = data.slice(0, 100);

  const handleSort = (col: string) => {
    if (onSort) {
      onSort(col);
    } else {
      if (localSortCol === col) {
        setLocalSortOrder(localSortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setLocalSortCol(col);
        setLocalSortOrder('asc');
      }
    }
  };

  const currentSortCol = sortColumn || localSortCol;
  const currentSortOrder = sortOrder || localSortOrder;

  const renderCell = (val: unknown) => {
    if (typeof val === 'boolean') {
      return val ? '✓' : '✗';
    }
    if (typeof val === 'string' && val.startsWith('http')) {
      return <a href={val} target="_blank" rel="noreferrer" className="text-info" style={{ textDecoration: 'underline' }}>Link</a>;
    }
    if (val === null || val === undefined) {
      return '-';
    }
    const strVal = String(val);
    return strVal.length > 50 ? (
      <span className="tooltip" title={strVal}>{strVal.substring(0, 50)}...</span>
    ) : strVal;
  };

  return (
    <div className="table-container card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-surface)', background: 'rgba(0,0,0,0.02)' }}>
              {displayColumns.map(col => (
                <th key={col} onClick={() => handleSort(col)} style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {col}
                    {currentSortCol === col && (
                      currentSortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-surface)' }}>
                {displayColumns.map(col => (
                  <td key={col} style={{ padding: '1rem', fontSize: '0.875rem' }}>{renderCell(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer" style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-muted)', borderTop: '1px solid var(--color-surface)' }}>
        Showing {displayData.length} of {data.length} rows
      </div>
    </div>
  );
}

export default DataTable;
