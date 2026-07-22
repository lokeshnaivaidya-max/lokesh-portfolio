import React from 'react';
import { Project, TechStack, Experience, Education, Certification } from '../types';
import { hasSupabaseConfig, isProduction } from '../lib/supabase';
import { getCacheVersion } from '../lib/cache';
import { BarChart3, Database, HardDrive, Image, Users, Clock, CheckCircle, XCircle, Award } from 'lucide-react';

interface Props {
  projects: Project[];
  techStack: TechStack[];
  experiences: Experience[];
  educationList: Education[];
  certifications: Certification[];
}

export default function StudioAnalytics({ projects, techStack, experiences, educationList, certifications }: Props) {
  const totalImages = projects.reduce((sum, p) => {
    let count = 0;
    if (p.logo_url) count++;
    if (p.thumbnail_url) count++;
    if (p.hero_banner_url) count++;
    if (p.gallery_images) count += p.gallery_images.length;
    return sum + count;
  }, 0);

  const totalStorage = projects.reduce((sum, p) => {
    let size = 0;
    [p.logo_url, p.thumbnail_url, p.hero_banner_url, ...(p.gallery_images || [])].forEach(u => {
      if (u && !u.startsWith('data:')) size += u.length;
    });
    return sum + size;
  }, 0);

  const allEntries = [...projects, ...techStack, ...experiences, ...educationList, ...certifications];

  const stats = [
    { label: 'Projects', value: projects.length, icon: <BarChart3 className="w-4 h-4 text-[#F5B942]" /> },
    { label: 'Tech Stack', value: techStack.length, icon: <BarChart3 className="w-4 h-4 text-[#F5B942]" /> },
    { label: 'Experience', value: experiences.length, icon: <BarChart3 className="w-4 h-4 text-[#F5B942]" /> },
    { label: 'Education', value: educationList.length, icon: <BarChart3 className="w-4 h-4 text-[#F5B942]" /> },
    { label: 'Certifications', value: certifications.length, icon: <Award className="w-4 h-4 text-[#F5B942]" /> },
    { label: 'Images Uploaded', value: totalImages, icon: <Image className="w-4 h-4 text-green-400" /> },
    { label: 'Approx Storage', value: totalStorage > 1024 * 1024 ? `${(totalStorage / (1024 * 1024)).toFixed(1)} MB` : `${(totalStorage / 1024).toFixed(0)} KB`, icon: <HardDrive className="w-4 h-4 text-blue-400" /> },
  ];

  const statusItems = [
    { label: 'Supabase', status: hasSupabaseConfig, icon: <Database className="w-4 h-4" /> },
    { label: 'Mode', status: isProduction, icon: <Clock className="w-4 h-4" />, text: isProduction ? 'Production' : 'Development' },
    { label: 'Cache Version', status: true, icon: <Clock className="w-4 h-4" />, text: `v${getCacheVersion()}` },
    { label: 'Total Entries', status: true, icon: <Users className="w-4 h-4" />, text: String(allEntries.length) },
  ];

  const lastSync = localStorage.getItem('studio_last_sync') || 'Never';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Studio Analytics</h3>
        <p className="font-mono text-xs text-gray-500 uppercase">Real-time dashboard of your portfolio data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-gray-500">
              {s.icon}
              <span className="font-mono text-[10px] uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="font-display text-3xl text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-lg p-4 space-y-3">
        <h4 className="font-mono text-xs uppercase tracking-wider text-gray-400">System Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusItems.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              {s.status !== undefined ? (
                s.status ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />
              ) : null}
              <div>
                <p className="font-mono text-[10px] text-gray-500 uppercase">{s.label}</p>
                <p className="font-mono text-xs text-white">{s.text || (s.status ? 'Connected' : 'Disconnected')}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-[#2D2D2D] mt-3">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="font-mono text-[10px] text-gray-500">Last Sync: {lastSync}</span>
        </div>
      </div>
    </div>
  );
}
