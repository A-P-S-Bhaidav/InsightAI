'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2, FileSpreadsheet, FileJson, FileText } from 'lucide-react';

interface ExportMenuProps {
  datasetId: string;
}

export function ExportMenu({ datasetId }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: string) => {
    setIsExporting(format);
    setIsOpen(false);
    // Mock export delay
    setTimeout(() => {
      console.log(`Exported dataset ${datasetId} as ${format}`);
      setIsExporting(null);
    }, 1500);
  };

  return (
    <div className="dropdown" ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting !== null}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
        {isExporting ? `Exporting ${isExporting}...` : 'Export'}
      </button>
      
      {isOpen && (
        <div className="dropdown-menu animate-slide-up" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', zIndex: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', minWidth: '150px' }}>
          <button className="dropdown-item" onClick={() => handleExport('CSV')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', borderRadius: '0.25rem', textAlign: 'left' }}>
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button className="dropdown-item" onClick={() => handleExport('JSON')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', borderRadius: '0.25rem', textAlign: 'left' }}>
            <FileJson size={16} /> JSON
          </button>
          <button className="dropdown-item" onClick={() => handleExport('PDF')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', borderRadius: '0.25rem', textAlign: 'left' }}>
            <FileText size={16} /> PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
