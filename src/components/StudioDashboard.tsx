import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchProjects, saveProject, deleteProject, 
  fetchTechStack, saveTechStack, deleteTechStack,
  loginUser, logoutUser, checkSession, fetchResumeUrl, saveResume,
  fetchExperiences, saveExperience, deleteExperience,
  fetchEducation, saveEducation, deleteEducation,
  fetchCertifications, saveCertification, deleteCertification,
  fetchMetadata, saveMetadata, applyMetadata,
  uploadProjectImage, hasSupabaseConfig, isProduction,
  addToRecycleBin, restoreFromRecycleBin, removeFromRecycleBin, setLastSync,
  fetchAvatarUrl, saveAvatarUrl
} from '../lib/supabase';
import { Project, TechStack, Experience, Education, Certification } from '../types';
import TechIcon from './TechIcon';
import ImageUploadZone from './ImageUploadZone';
import StudioHealthCheck from './StudioHealthCheck';
import ConfirmationDialog from './ConfirmationDialog';
import StudioAnalytics from './StudioAnalytics';
import StudioPreview from './StudioPreview';
import { bumpCacheVersion } from '../lib/cache';
import { 
  LogOut, Plus, Trash2, Edit2, Link as LinkIcon, 
  Code, Briefcase, FileText, Check, AlertCircle, Save, Loader2,
  Image, Upload, Star, Tag, GripVertical, GraduationCap, Activity, Eye, Award
} from 'lucide-react';

export default function StudioDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'tech' | 'experiences' | 'education' | 'certifications' | 'assets' | 'profile' | 'health' | 'analytics'>('projects');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [techStack, setTechStack] = useState<TechStack[]>([]);
  const [resumeUrl, setResumeUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [ogUrl, setOgUrl] = useState('');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Confirmation Dialog
  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; message: string; variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Live Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>({});
  const [previewType, setPreviewType] = useState<'project' | 'experience' | 'education' | 'tech' | 'brand'>('project');

  // Undo Toast
  const [undoState, setUndoState] = useState<{ message: string; itemId: string; type: any; data: any } | null>(null);

  // Drag & Drop
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projLive, setProjLive] = useState('');
  const [projGit, setProjGit] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projFeatured, setProjFeatured] = useState(false);
  const [projOrder, setProjOrder] = useState(0);
  const [projLogo, setProjLogo] = useState('');
  const [projThumbnail, setProjThumbnail] = useState('');
  const [projHero, setProjHero] = useState('');
  const [projGallery, setProjGallery] = useState<string[]>([]);

  const [newTechName, setNewTechName] = useState('');
  const [newTechCategory, setNewTechCategory] = useState<string>('frontend');
  const [newTechIconUrl, setNewTechIconUrl] = useState('');
  const [editTechId, setEditTechId] = useState<string | null>(null);

  const [editingExperience, setEditingExperience] = useState<Partial<Experience> | null>(null);
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expDetails, setExpDetails] = useState('');
  const [expLogo, setExpLogo] = useState('');

  const [editingEducation, setEditingEducation] = useState<Partial<Education> | null>(null);
  const [eduDegree, setEduDegree] = useState('');
  const [eduSchool, setEduSchool] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  const [eduGrade, setEduGrade] = useState('');
  const [eduLogo, setEduLogo] = useState('');
  const [eduUniversity, setEduUniversity] = useState('');
  const [eduLocation, setEduLocation] = useState('');
  const [eduDescription, setEduDescription] = useState('');


  useEffect(() => {
    async function loadSession() {
      const auth = await checkSession();
      setIsAuthenticated(auth);
      setLoading(false);
      if (auth) loadData();
    }
    loadSession();
  }, []);

  async function loadData() {
    try {
      const [projs, tech, resume, exps, metadata, edu, certs, avatar] = await Promise.all([
        fetchProjects(),
        fetchTechStack(),
        fetchResumeUrl(),
        fetchExperiences(),
        fetchMetadata(),
        fetchEducation(),
        fetchCertifications(),
        fetchAvatarUrl()
      ]);
      setProjects(projs);
      setTechStack(tech);
      setResumeUrl(resume);
      setAvatarUrl(avatar);
      setExperiences(exps);
      setLogoUrl(metadata.logo);
      setFaviconUrl(metadata.favicon);
      setOgUrl(metadata.opengraph);
      setEducationList(edu);
      setCertifications(certs);
    } catch (err) {
      console.error('Failed to load DB resources:', err);
    }
  }

  // Autosave drafts every 5 seconds
  const saveDraftRef = useRef({});
  saveDraftRef.current = {
    editingProject, projTitle, projDesc, projTags, projLive, projGit, projCategory, projFeatured, projOrder, projLogo, projThumbnail, projHero, projGallery,
    editingExperience, expRole, expCompany, expDuration, expLocation, expDetails, expLogo,
    editingEducation, eduDegree, eduSchool, eduField, eduStart, eduEnd, eduGrade, eduLogo, eduUniversity, eduLocation, eduDescription
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const d = saveDraftRef.current as any;
      try {
        if (d.editingProject) localStorage.setItem('studio_draft_project', JSON.stringify({ title: d.projTitle, desc: d.projDesc, tags: d.projTags, live: d.projLive, git: d.projGit, category: d.projCategory, featured: d.projFeatured, order: d.projOrder, logo: d.projLogo, thumb: d.projThumbnail, hero: d.projHero, gallery: d.projGallery }));
        if (d.editingExperience) localStorage.setItem('studio_draft_experience', JSON.stringify({ role: d.expRole, company: d.expCompany, duration: d.expDuration, location: d.expLocation, details: d.expDetails, logo: d.expLogo }));
        if (d.editingEducation) localStorage.setItem('studio_draft_education', JSON.stringify({ degree: d.eduDegree, school: d.eduSchool, field: d.eduField, start: d.eduStart, end: d.eduEnd, grade: d.eduGrade, logo: d.eduLogo, university: d.eduUniversity, location: d.eduLocation, description: d.eduDescription }));
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Undo timer: auto-delete after 30s
  useEffect(() => {
    if (!undoState) return;
    const timer = setTimeout(async () => {
      const item = undoState;
      setUndoState(null);
      try {
        if (item.type === 'project') await deleteProject(item.itemId);
        if (item.type === 'experience') await deleteExperience(item.itemId);
        if (item.type === 'education') await deleteEducation(item.itemId);
        if (item.type === 'tech') await deleteTechStack(item.itemId);
        removeFromRecycleBin(item.itemId);
        loadData();
      } catch (err) {
        console.error('Permanent delete failed:', err);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [undoState]);

  async function handleUndo() {
    if (!undoState) return;
    const restored = restoreFromRecycleBin(undoState.itemId);
    if (restored) triggerNotification('Item restored successfully.');
    else triggerNotification('Could not restore item.', true);
    setUndoState(null);
    loadData();
  }

  function confirmDelete(title: string, message: string, onConfirm: () => void) {
    setConfirmState({ open: true, title, message, variant: 'danger', onConfirm });
  }

  // Drag & Drop helpers
  function handleDragStart(index: number) { setDragIndex(index); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }
  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    const copy = [...arr]; const [removed] = copy.splice(from, 1); copy.splice(to, 0, removed); return copy;
  }

  // Preview helper
  function openPreview(data: any, type: 'project' | 'experience' | 'education' | 'tech' | 'brand') {
    setPreviewData(data); setPreviewType(type); setPreviewOpen(true);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    const result = await loginUser(email, password);
    setAuthSubmitting(false);
    if (result.success) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setAuthError(result.error || 'Invalid credentials');
    }
  }

  async function handleLogout() {
    await logoutUser();
    setIsAuthenticated(false);
  }

  function triggerNotification(message: string, isError = false) {
    if (isError) {
      setActionError(message);
      setTimeout(() => setActionError(null), 6000);
    } else {
      setActionSuccess(message);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  }

  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projTitle || !projDesc) {
      triggerNotification('Title and Description are required', true);
      return;
    }
    const tempId = editingProject?.id || `new_${Date.now()}`;
    try {
      const uploadImage = async (dataUrl: string | undefined, bucket: any) => {
        if (!dataUrl) return undefined;
        if (!dataUrl.startsWith('data:')) return dataUrl;
        return uploadProjectImage(tempId, dataUrl, bucket);
      };
      const [logoUrl_saved, thumbUrl, heroUrl, galleryUrls] = await Promise.all([
        uploadImage(projLogo, 'project-logos'),
        uploadImage(projThumbnail, 'project-thumbnails'),
        uploadImage(projHero, 'project-hero'),
        Promise.all(projGallery.map(u => uploadImage(u, 'project-gallery')))
      ]);
      const projectData = {
        id: tempId, title: projTitle, description: projDesc,
        category: projCategory || undefined, featured: projFeatured, display_order: projOrder,
        logo_url: logoUrl_saved, thumbnail_url: thumbUrl, hero_banner_url: heroUrl,
        gallery_images: galleryUrls.filter(Boolean) as string[],
        tech_tags: projTags.split(',').map(t => t.trim()).filter(Boolean),
        live_url: projLive || undefined, github_url: projGit || undefined
      };
      const saved = await saveProject(projectData);
      triggerNotification(`Successfully ${editingProject?.id ? 'updated' : 'created'} project: "${saved.title}"`);
      bumpCacheVersion(); setLastSync();
      cancelEditProject();
      loadData();
    } catch (err) {
      console.error('Failed to save project:', err);
      triggerNotification(`Failed to save project: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    }
  }

  function startEditProject(proj: Project) {
    setEditingProject(proj);
    setProjTitle(proj.title);
    setProjDesc(proj.description);
    setProjTags(proj.tech_tags.join(', '));
    setProjLive(proj.live_url || '');
    setProjGit(proj.github_url || '');
    setProjCategory(proj.category || '');
    setProjFeatured(proj.featured || false);
    setProjOrder(proj.display_order ?? 0);
    setProjLogo(proj.logo_url || '');
    setProjThumbnail(proj.thumbnail_url || '');
    setProjHero(proj.hero_banner_url || '');
    setProjGallery(proj.gallery_images || []);
  }

  function cancelEditProject() {
    setEditingProject(null);
    setProjTitle(''); setProjDesc(''); setProjTags(''); setProjLive(''); setProjGit('');
    setProjCategory(''); setProjFeatured(false); setProjOrder(0);
    setProjLogo(''); setProjThumbnail(''); setProjHero(''); setProjGallery([]);
  }

  async function handleDeleteProject(id: string, data: any) {
    confirmDelete('Delete Project', 'This will move the project to the recycle bin. You can undo within 30 seconds.', () => {
      addToRecycleBin('project', data);
      setUndoState({ message: 'Project deleted. Undo?', itemId: id, type: 'project', data });
      triggerNotification('Project moved to recycle bin. Undo available for 30s.');
      loadData();
    });
  }

  async function handleTechSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTechName) { triggerNotification('Technology name is required', true); return; }
    try {
      let iconUrl: string | undefined = newTechIconUrl;
      if (newTechIconUrl?.startsWith('data:')) {
        const id = editTechId || `tech_${Date.now()}`;
        iconUrl = await uploadProjectImage(id, newTechIconUrl, 'tech-logos');
      }
      const saved = await saveTechStack({
        id: editTechId || undefined,
        name: newTechName,
        icon_name: newTechName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        category: newTechCategory,
        icon_url: iconUrl || undefined
      });
      triggerNotification(`Successfully ${editTechId ? 'updated' : 'added'} technology: "${saved.name}"`);
      bumpCacheVersion(); setLastSync();
      setNewTechName(''); setNewTechIconUrl(''); setEditTechId(null);
      loadData();
    } catch (err) {
      console.error('Failed to save technology:', err);
      triggerNotification(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    }
  }

  function startEditTech(tech: TechStack) {
    setNewTechName(tech.name);
    setNewTechCategory(tech.category || 'frontend');
    setNewTechIconUrl(tech.icon_url || '');
    setEditTechId(tech.id);
  }

  function cancelEditTech() {
    setNewTechName(''); setNewTechIconUrl(''); setEditTechId(null);
  }

  async function handleDeleteTech(id: string, data: any) {
    confirmDelete('Delete Technology', 'This entry will be moved to the recycle bin. You can undo within 30 seconds.', () => {
      addToRecycleBin('tech', data);
      setUndoState({ message: 'Technology deleted. Undo?', itemId: id, type: 'tech', data });
      triggerNotification('Technology moved to recycle bin.');
      loadData();
    });
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await Promise.all([
        saveResume(resumeUrl),
        saveAvatarUrl(avatarUrl)
      ]);
      bumpCacheVersion();
      setLastSync();
      triggerNotification('Profile details updated successfully.');
      loadData();
    } catch (err) {
      console.error('Failed to update profile:', err);
      triggerNotification(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    }
  }

  async function handleExperienceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expRole || !expCompany) { triggerNotification('Role and Company are required', true); return; }
    try {
      let logo: string | undefined = expLogo;
      if (expLogo?.startsWith('data:')) {
        const id = editingExperience?.id || `exp_${Date.now()}`;
        logo = await uploadProjectImage(id, expLogo, 'experience-logos');
      }
      const saved = await saveExperience({
        id: editingExperience?.id, role: expRole, company: expCompany,
        duration: expDuration, location: expLocation,
        details: expDetails.split('\n').map(d => d.trim()).filter(Boolean),
        logo_url: logo || undefined
      });
      triggerNotification(`Successfully ${editingExperience?.id ? 'updated' : 'created'} experience`);
      bumpCacheVersion(); setLastSync();
      setEditingExperience(null); setExpRole(''); setExpCompany(''); setExpDuration(''); setExpLocation(''); setExpDetails(''); setExpLogo('');
      loadData();
    } catch (err) {
      console.error('Failed to save experience:', err);
      triggerNotification(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    }
  }

  function startEditExperience(exp: Experience) {
    setEditingExperience(exp);
    setExpRole(exp.role); setExpCompany(exp.company); setExpDuration(exp.duration);
    setExpLocation(exp.location); setExpDetails(exp.details.join('\n')); setExpLogo(exp.logo_url || '');
  }

  function cancelEditExperience() {
    setEditingExperience(null); setExpRole(''); setExpCompany(''); setExpDuration(''); setExpLocation(''); setExpDetails(''); setExpLogo('');
  }

  async function handleDeleteExperience(id: string, data: any) {
    confirmDelete('Delete Experience', 'This entry will be moved to the recycle bin. You can undo within 30 seconds.', () => {
      addToRecycleBin('experience', data);
      setUndoState({ message: 'Experience deleted. Undo?', itemId: id, type: 'experience', data });
      triggerNotification('Experience moved to recycle bin.');
      loadData();
    });
  }

  async function handleEducationSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eduDegree || !eduSchool) { triggerNotification('Degree and School are required', true); return; }
    try {
      let logo: string | undefined = eduLogo;
      if (eduLogo?.startsWith('data:')) {
        const id = editingEducation?.id || `edu_${Date.now()}`;
        logo = await uploadProjectImage(id, eduLogo, 'education-logos');
      }
      const saved = await saveEducation({
        id: editingEducation?.id, degree: eduDegree, school: eduSchool,
        field: eduField || undefined, start_year: eduStart || undefined, end_year: eduEnd || undefined,
        grade: eduGrade || undefined, logo_url: logo || undefined,
        university: eduUniversity || undefined, location: eduLocation || undefined,
        description: eduDescription || undefined
      });
      triggerNotification(`Successfully ${editingEducation?.id ? 'updated' : 'created'} education: "${saved.degree}"`);
      bumpCacheVersion(); setLastSync();
      setEditingEducation(null); setEduDegree(''); setEduSchool(''); setEduField(''); setEduStart(''); setEduEnd(''); setEduGrade(''); setEduLogo(''); setEduUniversity(''); setEduLocation(''); setEduDescription('');
      loadData();
    } catch (err) {
      console.error('Failed to save education:', err);
      triggerNotification(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    }
  }

  function startEditEducation(edu: Education) {
    setEditingEducation(edu); setEduDegree(edu.degree); setEduSchool(edu.school);
    setEduField(edu.field || ''); setEduStart(edu.start_year || ''); setEduEnd(edu.end_year || '');
    setEduGrade(edu.grade || ''); setEduLogo(edu.logo_url || '');
    setEduUniversity(edu.university || ''); setEduLocation(edu.location || ''); setEduDescription(edu.description || '');
  }

  function cancelEditEducation() {
    setEditingEducation(null); setEduDegree(''); setEduSchool(''); setEduField('');
    setEduStart(''); setEduEnd(''); setEduGrade(''); setEduLogo('');
    setEduUniversity(''); setEduLocation(''); setEduDescription('');
  }

  async function handleDeleteEducation(id: string, data: any) {
    confirmDelete('Delete Education', 'This entry will be moved to the recycle bin. You can undo within 30 seconds.', () => {
      addToRecycleBin('education', data);
      setUndoState({ message: 'Education deleted. Undo?', itemId: id, type: 'education', data });
      triggerNotification('Education moved to recycle bin.');
      loadData();
    });
  }

  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [certLogo, setCertLogo] = useState('');
  const [editingCert, setEditingCert] = useState<Partial<Certification> | null>(null);

  async function handleCertSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      let savedLogo = certLogo;
      if (certLogo?.startsWith('data:')) {
        const id = editingCert?.id || `cert_${Date.now()}`;
        savedLogo = await uploadProjectImage(id, certLogo, 'certification-logos');
      }
      await saveCertification({
        id: editingCert?.id,
        title: certTitle,
        issuer: certIssuer,
        issue_date: certDate,
        credential_url: certUrl || undefined,
        logo_url: savedLogo || undefined
      });
      triggerNotification('Certification saved successfully.');
      cancelEditCert();
      loadData();
    } catch (err) {
      console.error('Failed to save certification:', err);
      triggerNotification(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    }
  }

  function startEditCert(cert: Certification) {
    setEditingCert(cert); setCertTitle(cert.title); setCertIssuer(cert.issuer);
    setCertDate(cert.issue_date); setCertUrl(cert.credential_url || ''); setCertLogo(cert.logo_url || '');
  }

  function cancelEditCert() {
    setEditingCert(null); setCertTitle(''); setCertIssuer(''); setCertDate(''); setCertUrl(''); setCertLogo('');
  }

  async function handleDeleteCert(id: string, data: any) {
    confirmDelete('Delete Certification', 'This entry will be moved to the recycle bin. You can undo within 30 seconds.', () => {
      addToRecycleBin('certification', data);
      setUndoState({ message: 'Certification deleted. Undo?', itemId: id, type: 'certification', data });
      triggerNotification('Certification moved to recycle bin.');
      loadData();
    });
  }

  async function handleMetadataSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSyncing(true);
    try {
      await Promise.all([
        saveMetadata('logo', logoUrl), saveMetadata('favicon', faviconUrl), saveMetadata('opengraph', ogUrl)
      ]);
      bumpCacheVersion(); setLastSync();
      triggerNotification('Branding & SEO metadata synced successfully.');
    } catch (err) {
      console.error('Failed to update metadata:', err);
      triggerNotification(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, true);
    } finally {
      setIsSyncing(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'favicon' | 'opengraph') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === 'logo') setLogoUrl(base64String);
      if (target === 'favicon') setFaviconUrl(base64String);
      if (target === 'opengraph') setOgUrl(base64String);
      triggerNotification(`Uploaded ${target} image successfully. (Remember to click Sync to save)`);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#F5B942] mb-4" />
        <p className="font-mono text-xs tracking-widest text-gray-500 uppercase">Warming Up Engines...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 font-sans relative tire-tracks">
        <div className="absolute top-6 left-6">
          <button onClick={() => navigate('/')} className="text-xs font-mono tracking-widest text-[#F5B942] hover:text-white transition duration-200 uppercase bg-[#141414] px-4 py-2 rounded border border-[#2D2D2D] hover:border-[#F5B942]">← Public Site</button>
        </div>
        <div className="w-full max-w-md bg-[#141414] border border-[#2D2D2D] p-8 rounded-lg relative overflow-hidden speed-glow">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#E8332A]" />
          <h2 className="font-display text-4xl text-[#F5B942] tracking-wider mb-2 uppercase text-center">STUDIO CONTROL</h2>
          <p className="font-mono text-xs text-gray-500 mb-8 uppercase tracking-widest text-center">P. Lokesh Admin Panel Access</p>
          {authError && (
            <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-200 text-xs mb-6 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><span>{authError}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Identifier Email</label>
              <input type="text" placeholder="lokesh81@myyahoo.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#2D2D2D] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Security Password</label>
              <input type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#2D2D2D] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
            </div>
            <button type="submit" disabled={authSubmitting} className="w-full bg-gradient-to-r from-[#E8332A] to-[#F5B942] text-white font-display text-xl uppercase tracking-widest py-3 px-4 rounded hover:brightness-110 active:brightness-95 transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer">
              {authSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ENGAGE IGNITION'}
            </button>
          </form>
          <div className="mt-6 border-t border-[#2D2D2D]/60 pt-4 text-center">
            <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">Dual-Mode Ready: Authenticates through Supabase Auth, or automatically falls back to full Local Storage mode.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative pb-20">
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-4 bg-green-950/90 border border-green-500 rounded-lg text-green-200 text-sm shadow-xl animate-bounce">
          <Check className="w-5 h-5 text-green-400" /><span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-4 bg-red-950/90 border border-red-500 rounded-lg text-red-200 text-sm shadow-xl animate-bounce">
          <AlertCircle className="w-5 h-5 text-red-400" /><span>{actionError}</span>
        </div>
      )}

      {undoState && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 p-4 bg-[#1C1C1C] border border-[#F5B942]/60 rounded-lg text-white text-sm shadow-xl">
          <span className="font-mono text-xs">{undoState.message}</span>
          <button onClick={handleUndo} className="px-3 py-1.5 bg-[#F5B942] text-black font-mono text-xs font-bold uppercase rounded hover:bg-white transition cursor-pointer">Undo</button>
        </div>
      )}

      <header className="bg-[#141414] border-b border-[#2D2D2D] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-3xl text-[#F5B942] tracking-wider uppercase">STUDIO CONTROL PANEL</h1>
            <span className="font-mono text-[10px] text-gray-500 border border-[#2D2D2D] px-2 py-0.5 rounded uppercase">ADMINSECURE</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-xs font-mono uppercase tracking-widest bg-[#0A0A0A] hover:bg-[#F5B942] hover:text-[#0A0A0A] border border-[#2D2D2D] hover:border-transparent px-4 py-2 rounded transition-all duration-200 cursor-pointer">Live Portfolio</button>
            <button onClick={() => setPreviewOpen(!previewOpen)} className={`text-xs font-mono uppercase tracking-widest border px-3 py-2 rounded transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${previewOpen ? 'bg-[#F5B942] text-black border-transparent' : 'bg-[#0A0A0A] text-gray-400 border-[#2D2D2D] hover:border-[#F5B942]'}`} title="Toggle Live Preview">
              <Eye className="w-3.5 h-3.5" /><span>Preview</span>
            </button>
            <button onClick={handleLogout} className="text-xs font-mono uppercase tracking-widest bg-red-950/60 text-red-300 hover:bg-[#E8332A] hover:text-white border border-red-900/60 hover:border-transparent px-4 py-2 rounded transition-all duration-200 flex items-center gap-1.5 cursor-pointer">
              <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-2">
          {([['projects', 'Projects Database', <Briefcase key="p" className="w-5 h-5 opacity-60" />],
            ['tech', 'Garage Tech Stack', <Code key="t" className="w-5 h-5 opacity-60" />],
            ['experiences', 'Experience History', <Briefcase key="e" className="w-5 h-5 opacity-60" />],
            ['education', 'Education', <GraduationCap key="ed" className="w-5 h-5 opacity-60" />],
            ['certifications', 'Certifications', <Award key="c" className="w-5 h-5 opacity-60" />],

            ['assets', 'Logos & Opengraph', <Image key="a" className="w-5 h-5 opacity-60" />],
            ['profile', 'Resume & Profile', <FileText key="r" className="w-5 h-5 opacity-60" />],
            ['health', 'Health Check', <Activity key="h" className="w-5 h-5 opacity-60" />],
            ['analytics', 'Analytics', <Activity key="an" className="w-5 h-5 opacity-60" />],
          ] as const).map(([tab, label, icon]) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`w-full text-left font-display text-2xl uppercase tracking-wider py-3 px-4 rounded transition-all duration-200 flex items-center justify-between ${
                activeTab === tab ? 'bg-[#E8332A] text-white border-l-4 border-[#F5B942]' : 'bg-[#141414] text-gray-400 hover:text-white hover:bg-[#1C1C1C]'
              }`}
            ><span>{label}</span>{icon}</button>
          ))}
          <div className="p-4 bg-[#141414]/50 border border-[#2D2D2D]/40 rounded mt-6 font-mono text-[10px] text-gray-500 leading-relaxed uppercase">
            <p className="text-[#F5B942] mb-1 font-semibold">SUPABASE LINK STATUS:</p>
            {hasSupabaseConfig ? <span className="text-green-400">● Live Cloud Database Linked</span> : <span className="text-amber-500">○ Local Mode active (No Env Keys)</span>}
            <p className="mt-2 text-[9px] text-gray-600">{isProduction ? 'Production mode: localStorage fallback disabled' : 'Dev mode: localStorage fallback allowed'}</p>
          </div>
        </aside>

        <section className="lg:col-span-3 bg-[#141414] border border-[#2D2D2D] rounded-lg p-6 min-h-[500px]">

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">{editingProject ? 'Modify Showcase Project' : 'Register Showcase Project'}</h3>
                <p className="font-mono text-xs text-gray-500 uppercase">These cards populate Lokesh's main scrolling straightline billboards.</p>
              </div>
              <form onSubmit={handleProjectSubmit} className="space-y-4 bg-[#0A0A0A] p-5 rounded border border-[#232323]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Project Title</label>
                    <input type="text" placeholder="e.g. Lumora AI" value={projTitle} onChange={e => setProjTitle(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942]" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Category</label>
                    <input type="text" placeholder="AI, Enterprise, Fintech..." value={projCategory} onChange={e => setProjCategory(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div className="flex gap-3 items-end pb-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1"><GripVertical className="w-3 h-3" /> Display Order</label>
                      <input type="number" min={0} value={projOrder} onChange={e => setProjOrder(Number(e.target.value))} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Featured</span>
                      <button type="button" onClick={() => setProjFeatured(!projFeatured)} className={`w-10 h-5 rounded-full transition-colors relative ${projFeatured ? 'bg-[#F5B942]' : 'bg-[#2D2D2D]'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${projFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                      <Star className={`w-3.5 h-3.5 ${projFeatured ? 'text-[#F5B942]' : 'text-gray-600'}`} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Tech Tags (comma separated)</label>
                    <input type="text" placeholder="React, Next.js, Gemini API, Tailwind" value={projTags} onChange={e => setProjTags(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Description Details</label>
                    <textarea placeholder="Enter project metrics, engineering problems solved, and details..." value={projDesc} onChange={e => setProjDesc(e.target.value)} rows={3} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] resize-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Live App URL</label>
                    <input type="url" placeholder="https://lumora.ai" value={projLive} onChange={e => setProjLive(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">GitHub Repo URL</label>
                    <input type="url" placeholder="https://github.com/..." value={projGit} onChange={e => setProjGit(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                </div>
                <details className="border border-[#2D2D2D] rounded overflow-hidden">
                  <summary className="bg-[#141414] px-4 py-2 font-mono text-xs uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-[#1C1C1C] select-none flex items-center gap-2">
                    <Image className="w-4 h-4 text-[#F5B942]" /><span>Project Images & Assets</span>
                  </summary>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ImageUploadZone label="Project Logo" currentSrc={projLogo} onFileSelect={setProjLogo} onRemove={() => setProjLogo('')} />
                      <ImageUploadZone label="Project Thumbnail" currentSrc={projThumbnail} onFileSelect={setProjThumbnail} onRemove={() => setProjThumbnail('')} />
                    </div>
                    <ImageUploadZone label="Hero Banner (Optional)" currentSrc={projHero} onFileSelect={setProjHero} onRemove={() => setProjHero('')} maxSizeMB={10} />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Gallery Images ({projGallery.length})</label>
                        <button type="button" onClick={() => setProjGallery([...projGallery, ''])} className="text-[10px] font-mono text-[#F5B942] hover:text-white transition flex items-center gap-1 cursor-pointer bg-transparent border-0"><Plus className="w-3 h-3" /> Add Image</button>
                      </div>
                      {projGallery.map((img, i) => (
                        <ImageUploadZone key={i} label={`Gallery Image ${i + 1}`} currentSrc={img}
                          onFileSelect={(val) => { const next = [...projGallery]; next[i] = val; setProjGallery(next); }}
                          onRemove={() => { setProjGallery(projGallery.filter((_, idx) => idx !== i)); }} />
                      ))}
                    </div>
                  </div>
                </details>
                <div className="flex justify-end gap-3 pt-2">
                  {editingProject && <button type="button" onClick={cancelEditProject} className="bg-[#2D2D2D] hover:bg-gray-700 text-white font-mono text-xs uppercase px-4 py-2 rounded transition cursor-pointer">Cancel Edit</button>}
                  <button type="submit" className="bg-[#E8332A] hover:bg-[#f3453c] text-white font-display text-lg uppercase tracking-wider px-6 py-2 rounded flex items-center gap-2 cursor-pointer"><Save className="w-4 h-4" /><span>{editingProject ? 'Update Entry' : 'Record Entry'}</span></button>
                </div>
              </form>
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-gray-400 border-b border-[#2D2D2D] pb-2">Active Projects Directory ({projects.length})</h4>
                <div className="grid grid-cols-1 gap-4">
                  {projects.map((proj, idx) => (
                    <div key={proj.id} draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === idx) return;
                        const reordered = moveItem(projects, dragIndex, idx);
                        setProjects(reordered);
                        setDragIndex(null);
                        reordered.forEach((p, i) => { if (p.display_order !== i) saveProject({ ...p, display_order: i }); });
                        bumpCacheVersion(); setLastSync();
                        triggerNotification('Project order updated.');
                      }}
                      className={`bg-[#0A0A0A] p-4 rounded border border-[#2D2D2D]/60 flex items-center justify-between gap-4 group hover:border-[#E8332A] transition duration-200 ${dragIndex === idx ? 'opacity-50 border-[#F5B942]' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4" /></span>
                        {proj.thumbnail_url && <img src={proj.thumbnail_url} alt={proj.title} className="w-14 h-14 rounded object-cover shrink-0 border border-[#2D2D2D]" />}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-display text-2xl text-[#F5B942] tracking-wide">{proj.title}</h5>
                            {proj.featured && <Star className="w-3.5 h-3.5 text-[#F5B942]" />}
                            {proj.live_url && <LinkIcon className="w-3 h-3 text-gray-500" />}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 max-w-2xl">{proj.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">{proj.tech_tags.map(tag => (<span key={tag} className="font-mono text-[9px] bg-[#141414] text-gray-400 border border-[#222] px-1.5 py-0.5 rounded">{tag}</span>))}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => startEditProject(proj)} className="p-2 bg-[#141414] border border-[#2D2D2D] rounded hover:border-[#F5B942] text-gray-400 hover:text-[#F5B942] transition cursor-pointer" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProject(proj.id, proj)} className="p-2 bg-[#141414] border border-[#2D2D2D] rounded hover:border-[#E8332A] text-gray-400 hover:text-[#E8332A] transition cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-center text-sm font-mono text-gray-600 uppercase py-6">No Projects Listed in Database.</p>}
                </div>
              </div>
            </div>
          )}

          {/* TECH STACK TAB */}
          {activeTab === 'tech' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Garage Tech Stack (Logos)</h3>
                <p className="font-mono text-xs text-gray-500 uppercase">Register technologies which render as high-fidelity icons in Lokesh's Garage.</p>
              </div>
              <form onSubmit={handleTechSubmit} className="bg-[#0A0A0A] p-5 rounded border border-[#232323] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Technology Name</label>
                    <input type="text" placeholder="React, GSAP, Supabase..." value={newTechName} onChange={e => setNewTechName(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942]" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">System Category</label>
                    <select value={newTechCategory} onChange={e => setNewTechCategory(e.target.value as any)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono">
                      <option value="languages">Languages</option>
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="database">Database</option>
                      <option value="tools">Tools & APIs</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Custom Icon (optional)</label>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Paste URL or upload below" value={newTechIconUrl} onChange={e => setNewTechIconUrl(e.target.value)} className="flex-1 bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                      {newTechIconUrl && <img src={newTechIconUrl} alt="" className="w-8 h-8 rounded object-contain border border-[#2D2D2D]" />}
                    </div>
                    <ImageUploadZone label="" currentSrc="" onFileSelect={setNewTechIconUrl} onRemove={() => setNewTechIconUrl('')} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editTechId && <button type="button" onClick={cancelEditTech} className="bg-[#2D2D2D] hover:bg-gray-700 text-white font-mono text-xs uppercase px-4 py-2 rounded transition cursor-pointer">Cancel</button>}
                  <button type="submit" className="bg-[#E8332A] hover:bg-[#f3453c] text-white font-display text-lg uppercase tracking-wider px-6 py-2 rounded flex items-center gap-2 cursor-pointer">
                    <Save className="w-4 h-4" /><span>{editTechId ? 'Update Tech' : 'Mount Gear'}</span>
                  </button>
                </div>
              </form>
              <div className="space-y-4">
                <h4 className="font-mono text-xs uppercase tracking-wider text-gray-400 border-b border-[#2D2D2D] pb-2">Mounted Tech Stack Items ({techStack.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {techStack.map((tech, idx) => (
                    <div key={tech.id} draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === idx) return;
                        const reordered = moveItem(techStack, dragIndex, idx);
                        setTechStack(reordered);
                        setDragIndex(null);
                        reordered.forEach((t, i) => { if (t.display_order !== i) saveTechStack({ ...t, display_order: i }); });
                        bumpCacheVersion(); setLastSync();
                      }}
                      className={`bg-[#0A0A0A] p-3 rounded border border-[#2D2D2D]/60 flex items-center justify-between gap-3 group hover:border-[#F5B942] transition duration-200 ${dragIndex === idx ? 'opacity-50 border-[#F5B942]' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 cursor-grab active:cursor-grabbing"><GripVertical className="w-3.5 h-3.5 shrink-0" /></span>
                        <div className="p-1.5 bg-[#141414] rounded">
                          {tech.icon_url ? <img src={tech.icon_url} alt={tech.name} className="w-5 h-5 object-contain" /> : <TechIcon name={tech.name} size={18} />}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold truncate max-w-[100px]">{tech.name}</p>
                          <p className="text-[8px] font-mono uppercase text-gray-500">{tech.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEditTech(tech)} className="p-1 bg-[#141414] border border-[#2D2D2D] rounded hover:border-[#F5B942] text-gray-500 hover:text-[#F5B942] opacity-0 group-hover:opacity-100 transition cursor-pointer" title="Edit"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => handleDeleteTech(tech.id, tech)} className="p-1 bg-[#141414] border border-[#2D2D2D] rounded hover:border-red-500 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EXPERIENCES TAB */}
          {activeTab === 'experiences' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Experience Database</h3>
                <p className="font-mono text-xs text-gray-500 uppercase">Add, remove, and manage professional experience cards.</p>
              </div>
              <form onSubmit={handleExperienceSubmit} className="space-y-4 bg-[#0A0A0A] p-5 rounded border border-[#232323]">
                <h4 className="font-mono text-xs uppercase text-[#F5B942] tracking-wider mb-2 font-semibold">{editingExperience ? 'Edit Experience Role' : 'Record New Experience'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Role Title</label>
                    <input type="text" placeholder="e.g., Web Developer Intern" value={expRole} onChange={e => setExpRole(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Company Name</label>
                    <input type="text" placeholder="e.g., Belvo" value={expCompany} onChange={e => setExpCompany(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Duration / Dates</label>
                    <input type="text" placeholder="e.g., Nov 2024 - Present" value={expDuration} onChange={e => setExpDuration(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Location Basis</label>
                    <input type="text" placeholder="e.g., Remote / Hyderabad, India" value={expLocation} onChange={e => setExpLocation(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                </div>
                <ImageUploadZone label="Company Logo" currentSrc={expLogo} onFileSelect={setExpLogo} onRemove={() => setExpLogo('')} />
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Role Highlights & Achievements (One per line)</label>
                  <textarea rows={4} placeholder="Enter details, one line per achievement..." value={expDetails} onChange={e => setExpDetails(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-[#E8332A] hover:bg-[#f3453c] text-white font-display text-base uppercase tracking-wider px-5 py-2 rounded flex items-center gap-1.5 cursor-pointer border-0"><Save className="w-4 h-4" /><span>{editingExperience ? 'Update' : 'Register Experience'}</span></button>
                  {editingExperience && <button type="button" onClick={cancelEditExperience} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display text-base uppercase tracking-wider px-5 py-2 rounded cursor-pointer border-0">Cancel</button>}
                </div>
              </form>
              <div className="space-y-4">
                <h4 className="font-mono text-xs uppercase text-gray-400 tracking-wider">Active Experience Entries</h4>
                {experiences.length === 0 ? <p className="font-mono text-xs text-gray-600 uppercase">No experiences documented in database.</p> : (
                  <div className="space-y-3">
                    {experiences.map((exp, idx) => (
                      <div key={exp.id} draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => {
                          if (dragIndex === null || dragIndex === idx) return;
                          const reordered = moveItem(experiences, dragIndex, idx);
                          setExperiences(reordered);
                          setDragIndex(null);
                          reordered.forEach((e, i) => { if (e.display_order !== i) saveExperience({ ...e, display_order: i }); });
                          bumpCacheVersion(); setLastSync();
                        }}
                        className={`bg-[#0A0A0A] p-4 rounded border border-[#2D2D2D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${dragIndex === idx ? 'opacity-50 border-[#F5B942]' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4 shrink-0" /></span>
                          {exp.logo_url && <img src={exp.logo_url} alt={exp.company} className="w-10 h-10 rounded object-contain border border-[#2D2D2D]" />}
                          <div className="space-y-1">
                            <p className="text-white font-semibold font-mono text-sm">{exp.role}</p>
                            <p className="text-[#F5B942] text-xs font-mono">{exp.company} • {exp.duration} • {exp.location}</p>
                            <ul className="list-disc pl-4 mt-2 text-gray-400 text-xs space-y-1 font-mono">{exp.details.map((det, i) => (<li key={i}>{det}</li>))}</ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => startEditExperience(exp)} className="p-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#141414] rounded transition border-0 cursor-pointer bg-transparent"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteExperience(exp.id, exp)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#141414] rounded transition border-0 cursor-pointer bg-transparent"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Education Database</h3>
                <p className="font-mono text-xs text-gray-500 uppercase">Manage academic credentials and school logos.</p>
              </div>
              <form onSubmit={handleEducationSubmit} className="space-y-4 bg-[#0A0A0A] p-5 rounded border border-[#232323]">
                <h4 className="font-mono text-xs uppercase text-[#F5B942] tracking-wider mb-2 font-semibold">{editingEducation ? 'Edit Education' : 'Record New Education'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Degree / Diploma</label>
                    <input type="text" placeholder="e.g., Bachelor of Science (B.Sc)" value={eduDegree} onChange={e => setEduDegree(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">School / Institution</label>
                    <input type="text" placeholder="e.g., Wesley Degree College" value={eduSchool} onChange={e => setEduSchool(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Field of Study</label>
                    <input type="text" placeholder="e.g., Mathematics, Statistics & Computer Science" value={eduField} onChange={e => setEduField(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">University</label>
                    <input type="text" placeholder="e.g., Osmania University" value={eduUniversity} onChange={e => setEduUniversity(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Location</label>
                  <input type="text" placeholder="e.g., Hyderabad, Telangana, India" value={eduLocation} onChange={e => setEduLocation(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Start Year</label>
                    <input type="text" placeholder="e.g., 2023" value={eduStart} onChange={e => setEduStart(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">End Year</label>
                    <input type="text" placeholder="e.g., 2027" value={eduEnd} onChange={e => setEduEnd(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Grade / GPA</label>
                    <input type="text" placeholder="e.g., 8.5 CGPA" value={eduGrade} onChange={e => setEduGrade(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Description</label>
                  <textarea placeholder="Describe your academic focus, achievements, and relevant coursework..." value={eduDescription} onChange={e => setEduDescription(e.target.value)} rows={3} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono resize-none" />
                </div>
                <ImageUploadZone label="Institution Logo" currentSrc={eduLogo} onFileSelect={setEduLogo} onRemove={() => setEduLogo('')} />
                <div className="flex gap-2">
                  <button type="submit" className="bg-[#E8332A] hover:bg-[#f3453c] text-white font-display text-base uppercase tracking-wider px-5 py-2 rounded flex items-center gap-1.5 cursor-pointer border-0"><Save className="w-4 h-4" /><span>{editingEducation ? 'Update' : 'Register Education'}</span></button>
                  {editingEducation && <button type="button" onClick={cancelEditEducation} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display text-base uppercase tracking-wider px-5 py-2 rounded cursor-pointer border-0">Cancel</button>}
                </div>
              </form>
              <div className="space-y-4">
                <h4 className="font-mono text-xs uppercase text-gray-400 tracking-wider">Education Records</h4>
                {educationList.length === 0 ? <p className="font-mono text-xs text-gray-600 uppercase">No education records.</p> : (
                  <div className="space-y-3">
                    {educationList.map((edu, idx) => (
                      <div key={edu.id} draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => {
                          if (dragIndex === null || dragIndex === idx) return;
                          const reordered = moveItem(educationList, dragIndex, idx);
                          setEducationList(reordered);
                          setDragIndex(null);
                          reordered.forEach((e, i) => { if (e.display_order !== i) saveEducation({ ...e, display_order: i }); });
                          bumpCacheVersion(); setLastSync();
                        }}
                        className={`bg-[#0A0A0A] p-4 rounded border border-[#2D2D2D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${dragIndex === idx ? 'opacity-50 border-[#F5B942]' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4 shrink-0" /></span>
                          {edu.logo_url && <img src={edu.logo_url} alt={edu.school} className="w-10 h-10 rounded object-contain border border-[#2D2D2D]" />}
                          <div className="space-y-1">
                            <p className="text-white font-semibold font-mono text-sm">{edu.degree}</p>
                            <p className="text-[#F5B942] text-xs font-mono">{edu.school}{edu.field ? ` • ${edu.field}` : ''}</p>
                            <p className="text-gray-500 text-xs font-mono">{edu.start_year}{edu.end_year ? ` – ${edu.end_year}` : ''}{edu.grade ? ` • ${edu.grade}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => startEditEducation(edu)} className="p-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#141414] rounded transition border-0 cursor-pointer bg-transparent"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteEducation(edu.id, edu)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#141414] rounded transition border-0 cursor-pointer bg-transparent"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CERTIFICATIONS TAB */}
          {activeTab === 'certifications' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Certifications</h3>
              </div>
              <form onSubmit={handleCertSave} className="space-y-4 bg-[#0A0A0A] p-5 rounded border border-[#232323]">
                <h4 className="font-mono text-xs uppercase text-[#F5B942] tracking-wider mb-2 font-semibold">{editingCert ? 'Edit Certification' : 'Record New Certification'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Title</label>
                    <input type="text" placeholder="e.g., Google Cloud Digital Leader" value={certTitle} onChange={e => setCertTitle(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Issuer</label>
                    <input type="text" placeholder="e.g., Google Cloud" value={certIssuer} onChange={e => setCertIssuer(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Issue Date</label>
                    <input type="text" placeholder="e.g., 2025" value={certDate} onChange={e => setCertDate(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Credential URL</label>
                    <input type="text" placeholder="https://..." value={certUrl} onChange={e => setCertUrl(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                  </div>
                </div>
                <ImageUploadZone label="Certification Logo" currentSrc={certLogo} onFileSelect={setCertLogo} onRemove={() => setCertLogo('')} />
                <div className="flex gap-2">
                  <button type="submit" className="bg-[#E8332A] hover:bg-[#f3453c] text-white font-display text-base uppercase tracking-wider px-5 py-2 rounded flex items-center gap-1.5 cursor-pointer border-0"><Save className="w-4 h-4" /><span>{editingCert ? 'Update' : 'Register Certification'}</span></button>
                  {editingCert && <button type="button" onClick={cancelEditCert} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display text-base uppercase tracking-wider px-5 py-2 rounded cursor-pointer border-0">Cancel</button>}
                </div>
              </form>
              <div className="space-y-4">
                <h4 className="font-mono text-xs uppercase text-gray-400 tracking-wider">Certification Records</h4>
                {certifications.length === 0 ? <p className="font-mono text-xs text-gray-600 uppercase">No certifications recorded.</p> : (
                  <div className="space-y-3">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id} className="bg-[#0A0A0A] p-4 rounded border border-[#2D2D2D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                          {cert.logo_url && <img src={cert.logo_url} alt={cert.title} className="w-10 h-10 rounded object-contain" />}
                          <div>
                            <p className="font-display text-xl text-white tracking-wide">{cert.title}</p>
                            <p className="text-[#F5B942] text-xs font-mono">{cert.issuer}{cert.issue_date ? ` • ${cert.issue_date}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {cert.credential_url && (
                            <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#141414] rounded transition border-0 cursor-pointer bg-transparent"><LinkIcon className="w-4 h-4" /></a>
                          )}
                          <button onClick={() => startEditCert(cert)} className="p-2 text-gray-400 hover:text-[#F5B942] hover:bg-[#141414] rounded transition border-0 cursor-pointer bg-transparent"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteCert(cert.id, cert)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#141414] rounded transition border-0 cursor-pointer bg-transparent"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ASSETS TAB */}
          {activeTab === 'assets' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Identity, Logos & SEO Metadata</h3>
                <p className="font-mono text-xs text-gray-500 uppercase">Update your personalized logo, browser tab favicon, and social share images.</p>
              </div>
              <form onSubmit={handleMetadataSubmit} className="space-y-6 bg-[#0A0A0A] p-6 rounded border border-[#232323]">
                <div className="space-y-3 border-b border-[#1C1C1C] pb-6">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 font-bold">Brand Logo Image (Navbar / Header)</label>
                    <span className="font-mono text-[9px] text-[#F5B942]">URL or Local Upload</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                      <input type="text" placeholder="Paste image URL (e.g., https://...)" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono">OR</span>
                        <label className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#2D2D2D] text-gray-400 hover:text-white px-3 py-1.5 rounded text-xs font-mono cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" /><span>Upload File</span>
                          <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-center items-center bg-[#141414] rounded border border-[#2D2D2D]/60 p-4 h-24 relative overflow-hidden">
                      {logoUrl ? <img src={logoUrl} alt="Logo Preview" className="max-h-full object-contain" referrerPolicy="no-referrer" /> : <div className="text-center font-mono text-[10px] text-gray-600 uppercase">No Logo Active<br />(Defaults to Text Name)</div>}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 border-b border-[#1C1C1C] pb-6">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 font-bold">Browser Tab Favicon</label>
                    <span className="font-mono text-[9px] text-[#F5B942]">Tab Icon</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                      <input type="text" placeholder="Paste image URL (e.g., https://...)" value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono">OR</span>
                        <label className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#2D2D2D] text-gray-400 hover:text-white px-3 py-1.5 rounded text-xs font-mono cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" /><span>Upload File</span>
                          <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'favicon')} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-center items-center bg-[#141414] rounded border border-[#2D2D2D]/60 p-4 h-24 relative overflow-hidden">
                      {faviconUrl ? <img src={faviconUrl} alt="Favicon Preview" className="h-10 w-10 object-contain" referrerPolicy="no-referrer" /> : <div className="text-center font-mono text-[10px] text-gray-600 uppercase">No Favicon Active</div>}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 font-bold">Social Preview Image (OpenGraph Image)</label>
                    <span className="font-mono text-[9px] text-[#F5B942]">Used on WhatsApp, X, LinkedIn shares</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                      <input type="text" placeholder="Paste image URL (e.g., https://...)" value={ogUrl} onChange={e => setOgUrl(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono">OR</span>
                        <label className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#2D2D2D] text-gray-400 hover:text-white px-3 py-1.5 rounded text-xs font-mono cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" /><span>Upload File</span>
                          <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'opengraph')} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-center items-center bg-[#141414] rounded border border-[#2D2D2D]/60 p-4 h-24 relative overflow-hidden">
                      {ogUrl ? <img src={ogUrl} alt="OpenGraph Preview" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" /> : <div className="text-center font-mono text-[10px] text-gray-600 uppercase">No OpenGraph Active</div>}
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSyncing} className="bg-[#E8332A] hover:bg-[#f3453c] text-white font-display text-base uppercase tracking-wider px-6 py-2.5 rounded shrink-0 flex items-center gap-2 cursor-pointer font-semibold border-0 shadow-[0_4px_12px_rgba(232,51,42,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">{isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span>{isSyncing ? 'Syncing...' : 'Sync Branding Assets'}</span></button>
                </div>
              </form>
            </div>
          )}

          {/* PROFILE / RESUME TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Personal Profile & Photo</h3>
                <p className="font-mono text-xs text-gray-500 uppercase font-semibold">Configure your personal headshot photo and resume link to elevate your visual identity on the website.</p>
              </div>
              <form onSubmit={handleProfileSubmit} className="space-y-6 bg-[#0A0A0A] p-6 rounded border border-[#232323]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1 font-bold">Personal Photo URL (Headshot / Portrait)</label>
                      <input type="url" placeholder="Paste image URL (e.g., https://...)" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-500 font-mono">OR</span>
                        <label className="bg-[#141414] hover:bg-[#1C1C1C] border border-[#2D2D2D] text-gray-400 hover:text-white px-3 py-1.5 rounded text-xs font-mono cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" /><span>Upload Headshot</span>
                          <input type="file" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAvatarUrl(reader.result as string);
                                triggerNotification('Headshot uploaded successfully. Remember to click Save Profile Details.');
                              };
                              reader.readAsDataURL(file);
                            }
                          }} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1 font-bold">Resume URL (Public Link to PDF)</label>
                      <input type="url" placeholder="https://drive.google.com/..." value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} className="w-full bg-[#141414] border border-[#2D2D2D] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5B942] font-mono" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-[#141414] rounded border border-[#2D2D2D]/60 p-6 h-48 relative overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Lokesh Profile Photo Preview" className="h-32 w-32 object-cover rounded-full border-2 border-[#F5B942] shadow-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center font-mono text-[10px] text-gray-600 uppercase leading-relaxed">
                        No Custom Photo Active<br />(Defaults to Premium Developer Silhouette)
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="bg-[#E8332A] hover:bg-[#f3453c] text-white font-display text-base uppercase tracking-wider px-6 py-2.5 rounded shrink-0 flex items-center gap-1.5 cursor-pointer border-0 shadow-lg font-semibold"><Save className="w-4 h-4" /><span>Save Profile Details</span></button>
              </form>
            </div>
          )}

          {/* HEALTH CHECK TAB */}
          {activeTab === 'health' && <StudioHealthCheck />}
          {activeTab === 'analytics' && <StudioAnalytics projects={projects} techStack={techStack} experiences={experiences} educationList={educationList} certifications={certifications} />}

        </section>

        <StudioPreview open={previewOpen} onClose={() => setPreviewOpen(false)} data={previewData} type={previewType} />
      </main>

      <ConfirmationDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(o => ({ ...o, open: false })); }}
        onCancel={() => setConfirmState(o => ({ ...o, open: false }))}
      />
    </div>
  );
}
