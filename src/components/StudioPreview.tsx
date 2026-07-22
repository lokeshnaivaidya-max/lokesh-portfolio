import React from 'react';
import { X, Eye, ExternalLink } from 'lucide-react';
import { cacheBust } from '../lib/cache';

interface PreviewData {
  title?: string;
  description?: string;
  logo_url?: string;
  thumbnail_url?: string;
  tech_tags?: string[];
  live_url?: string;
  github_url?: string;
  company?: string;
  role?: string;
  degree?: string;
  school?: string;
  name?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: PreviewData;
  type: 'project' | 'experience' | 'education' | 'tech' | 'brand';
}

export default function StudioPreview({ open, onClose, data, type }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#141414] border-l border-[#2D2D2D] overflow-y-auto">
        <div className="sticky top-0 bg-[#141414] border-b border-[#2D2D2D] px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#F5B942]" />
            <h3 className="font-display text-xl text-white uppercase tracking-wider">Live Preview</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition cursor-pointer bg-transparent border-0 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Brand Preview */}
          {type === 'brand' && data.logo_url && (
            <div className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-lg p-6 text-center">
              <img src={cacheBust(data.logo_url)} alt="Logo preview" className="max-h-16 mx-auto object-contain" />
              <p className="font-mono text-xs text-gray-500 mt-3 uppercase">Site Logo Preview</p>
            </div>
          )}

          {/* Project Card Preview */}
          {type === 'project' && (
            <div className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-xl p-5 space-y-4">
              {data.thumbnail_url && (
                <img src={cacheBust(data.thumbnail_url)} alt="" className="w-full h-40 object-cover rounded-lg border border-[#2D2D2D]" />
              )}
              <div className="flex items-center gap-2">
                {data.logo_url && <img src={cacheBust(data.logo_url)} alt="" className="w-8 h-8 rounded object-contain" />}
                <h4 className="font-display text-2xl text-[#F5B942] tracking-wide uppercase">{data.title || 'Project Title'}</h4>
              </div>
              <p className="font-mono text-xs text-gray-400 leading-relaxed">{data.description || 'Description...'}</p>
              {data.tech_tags && data.tech_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.tech_tags.map(t => <span key={t} className="font-mono text-[9px] bg-[#141414] text-gray-500 border border-[#222] px-1.5 py-0.5 rounded">{t}</span>)}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {data.live_url && <span className="font-mono text-[10px] text-amber-500 flex items-center gap-1"><ExternalLink className="w-3 h-3" />Live</span>}
                {data.github_url && <span className="font-mono text-[10px] text-gray-500">GitHub</span>}
              </div>
            </div>
          )}

          {/* Experience Preview */}
          {type === 'experience' && (
            <div className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                {data.logo_url && <img src={cacheBust(data.logo_url)} alt="" className="w-10 h-10 rounded object-contain border border-[#2D2D2D]" />}
                <div>
                  <p className="font-mono text-sm text-white font-semibold">{data.role || 'Role'}</p>
                  <p className="font-mono text-xs text-[#F5B942]">{data.company || 'Company'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Education Preview */}
          {type === 'education' && (
            <div className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                {data.logo_url && <img src={cacheBust(data.logo_url)} alt="" className="w-10 h-10 rounded object-contain border border-[#2D2D2D]" />}
                <div>
                  <p className="font-mono text-sm text-white font-semibold">{data.degree || 'Degree'}</p>
                  <p className="font-mono text-xs text-[#F5B942]">{data.school || 'School'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tech Stack Preview */}
          {type === 'tech' && (
            <div className="bg-[#0A0A0A] border border-[#2D2D2D] rounded-xl p-5 flex items-center gap-3">
              {data.logo_url && <img src={cacheBust(data.logo_url)} alt="" className="w-8 h-8 rounded object-contain" />}
              <span className="font-display text-xl text-white tracking-wide">{data.name || 'Technology'}</span>
            </div>
          )}

          <p className="text-center font-mono text-[10px] text-gray-600">Preview updates in real-time as you edit</p>
        </div>
      </div>
    </div>
  );
}
