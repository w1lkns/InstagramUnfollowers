import React from 'react';
import { UserNode } from '../model/user';

interface NotSearchingProps {
  onScan?: () => void;
  cachedScan?: { results: UserNode[]; timestamp: number } | null;
  onRestoreScan?: () => void;
}

function formatAge(timestamp: number): string {
  const ms = Date.now() - timestamp;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

export const NotSearching = ({ onScan, cachedScan, onRestoreScan }: NotSearchingProps) => (
  <>
    {cachedScan && (
      <div className="cached-scan-banner">
        <div className="cached-scan-info">
          <span className="cached-scan-title">Previous scan available</span>
          <span className="cached-scan-meta">{cachedScan.results.length} users · {formatAge(cachedScan.timestamp)}</span>
        </div>
        <div className="cached-scan-actions">
          <button className="button-restore" onClick={onRestoreScan}>Use Previous</button>
          <button className="button-fresh" onClick={onScan}>Fresh Scan</button>
        </div>
      </div>
    )}
    {!cachedScan && <button className='run-scan' onClick={onScan}>RUN</button>}
  </>
);
