'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { 
  Plus, 
  Search, 
  Ship, 
  FileText,
  X,
  ShieldCheck,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Home,
  FileCheck,
  Camera,
  Image as ImageIcon,
  Lock,
  Mail
} from 'lucide-react';
import { vesselsApi } from '@/services/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Login Component ---
const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[#020617] opacity-100">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-slate-800/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
            <Ship className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-center">Sellamsoft Portal</h1>
          <p className="text-slate-400 mt-2 text-center">Sign in to your inspection dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none text-white placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none text-white placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/25"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            Need access? <span className="text-accent hover:underline cursor-pointer">Contact Administration</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Vessels Dashboard Component ---
const VesselsDashboard = () => {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const [vessels, setVessels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<Record<string, any[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});
  const [editData, setEditData] = useState<Record<number, any>>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedItemForImage, setSelectedItemForImage] = useState<number | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (user) {
      fetchVessels();
      fetchCategories();
    }
  }, [user]);

  useEffect(() => {
    if (selectedVessel && categories.length > 0) {
      fetchReportCounts();
    }
  }, [selectedVessel, categories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchReportCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('report_data->category_id, id')
        .eq('vessel_id', selectedVessel);
      
      if (error) throw error;

      const newCounts: Record<string, number> = {};
      data?.forEach(report => {
        const catId = report.category_id;
        if (catId) {
          newCounts[catId] = (newCounts[catId] || 0) + 1;
        }
      });
      setCounts(newCounts);
    } catch (error) {
      console.error('Failed to fetch report counts:', error);
    }
  };

  const fetchVessels = async () => {
    try {
      setIsLoading(true);
      const data = await vesselsApi.getAll();
      const filtered = user?.company_id 
        ? data.filter((v: any) => v.company_id === user.company_id) 
        : data;

      setVessels(filtered || []);
      
      const urlVesselId = searchParams.get('vesselId');
      if (urlVesselId) {
        setSelectedVessel(urlVesselId);
      } else if (filtered && filtered.length > 0 && !selectedVessel) {
        setSelectedVessel(filtered[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (id: number, field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSaveItem = async (item: any) => {
    const updates = editData[item.id];
    if (!updates) return;

    try {
      const { error } = await supabase
        .from('report_items')
        .update(updates)
        .eq('id', item.id);
      
      if (error) throw error;
      
      setCategoryItems(prev => ({
        ...prev,
        [expandedCategory!]: prev[expandedCategory!].map(r => 
          r.id === item.id ? { ...r, ...updates } : r
        )
      }));
      
      setEditData(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });

      showNotification(`Item ${item.s_no} updated successfully!`);
    } catch (err) {
      console.error('Failed to save item:', err);
      showNotification('Failed to update item', 'error');
    }
  };

  const handleToggleExpand = async (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    if (expandedCategory === catId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(catId);
    
    if (!categoryItems[catId]) {
      try {
        setItemsLoading(prev => ({ ...prev, [catId]: true }));
        const { data, error } = await supabase
          .from('report_items')
          .select('*')
          .eq('category_id', catId)
          .order('s_no');
        
        if (error) throw error;
        setCategoryItems(prev => ({ ...prev, [catId]: data || [] }));
      } catch (error) {
        console.error('Failed to fetch category items:', error);
      } finally {
        setItemsLoading(prev => ({ ...prev, [catId]: false }));
      }
    }
  };

  // Camera logic
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(videoRef.current, 0, 0);
      setTempImageUrl(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleApplyImage = async () => {
    if (!selectedItemForImage || !tempImageUrl) return;
    
    try {
      const { error } = await supabase
        .from('report_items')
        .update({ image: tempImageUrl })
        .eq('id', selectedItemForImage);
      
      if (error) throw error;
      
      setCategoryItems(prev => ({
        ...prev,
        [expandedCategory!]: prev[expandedCategory!].map(r => 
          r.id === selectedItemForImage ? { ...r, image: tempImageUrl } : r
        )
      }));
      setIsImageModalOpen(false);
      setTempImageUrl('');
      showNotification('Technical evidence applied successfully!');
    } catch (err) {
      console.error('Failed to apply image:', err);
      showNotification('Failed to apply evidence', 'error');
    }
  };

  const currentVessel = vessels.find(v => v.id === selectedVessel);
  const vesselIndex = vessels.findIndex(v => v.id === selectedVessel) + 1;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-[1000px] mx-auto space-y-12 pb-40">
        {/* Header with Logout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Sellamsoft Portal</h1>
          </div>
          <button 
            onClick={logout}
            className="px-6 py-2 bg-secondary hover:bg-rose-500 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-border"
          >
            Secure Logout
          </button>
        </div>

        {/* VESSEL SUMMARY SECTION */}
        <div className="bg-card border border-border rounded-[40px] p-12 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-105 transition-transform duration-700">
            <Ship className="w-64 h-64" />
          </div>

          <div className="space-y-8 relative z-10">
            <div className="text-4xl font-black text-accent italic opacity-50 tracking-tighter">
              {vesselIndex.toString().padStart(2, '0')}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="text-sm font-black text-foreground uppercase tracking-[0.2em]">IMO {currentVessel?.imo_number || '---'}</span>
              </div>
              
              <h1 className="text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                {currentVessel?.vessel_name || 'Select Vessel'}
              </h1>
              
              <div className="text-xl font-bold text-muted-foreground uppercase tracking-widest italic opacity-60">
                {currentVessel?.vessel_type || 'Asset Classification'}
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORIES SECTION */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tight">Technical Registry</h2>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Filter..." 
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-12 pr-6 py-4 bg-secondary border border-transparent focus:border-accent rounded-[20px] text-[10px] font-black uppercase tracking-widest outline-none transition-all w-60 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-3">
             {isLoading ? (
               Array(5).fill(0).map((_, i) => (
                 <div key={i} className="h-24 bg-secondary/50 rounded-[28px] animate-pulse" />
               ))
             ) : categories.filter(c => c.category_name.toLowerCase().includes(categorySearch.toLowerCase())).map((cat, i) => {
                const reportCount = counts[cat.id] || 0;
                const isExpanded = expandedCategory === cat.id;
                const items = categoryItems[cat.id] || [];
                const isLoadingItems = itemsLoading[cat.id];

                return (
                  <div key={cat.id} className="space-y-2">
                    <motion.div 
                      onClick={(e) => handleToggleExpand(e, cat.id)}
                      className={cn(
                        "flex items-center justify-between p-7 bg-card border border-border rounded-[28px] hover:border-accent transition-all cursor-pointer group hover:bg-accent/5",
                        isExpanded && "border-accent bg-accent/5 rounded-b-none"
                      )}
                    >
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center border border-border transition-all",
                             isExpanded ? "bg-accent text-white border-accent" : "bg-secondary group-hover:bg-accent group-hover:text-white"
                           )}>
                              <FileText className="w-4 h-4" />
                           </div>
                         </div>
                         <div className="flex flex-col">
                           <span className={cn(
                             "text-sm font-black text-foreground uppercase tracking-tight group-hover:text-accent transition-colors",
                             isExpanded && "text-accent"
                           )}>{cat.category_name}</span>
                           {reportCount > 0 && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{reportCount} ACTIVE REPORTS</span>}
                         </div>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180 text-accent")} />
                    </motion.div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-x border-b border-accent/30 bg-accent/[0.02] rounded-b-[28px] -mt-2"
                        >
                          <div className="p-0 overflow-hidden bg-card rounded-b-[28px]">
                            {isLoadingItems ? (
                              <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
                              </div>
                            ) : items.length > 0 ? (
                              <div className="flex flex-col">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-secondary/30 border-y border-border">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-16 text-center">ID</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">REQUIREMENTS</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">ANS</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-40">COMMENTS</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-20 text-center">IMAGE</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                      {items.map((item, idx) => {
                                        const isEditing = !!editData[item.id];
                                        const currentAns = editData[item.id]?.ans ?? item.ans ?? 'EMPTY';
                                        const currentComments = editData[item.id]?.comments ?? item.comments ?? '';

                                        return (
                                          <tr key={item.id} className="group hover:bg-secondary/10 transition-all">
                                            <td className="px-6 py-6 text-center font-bold text-[11px] text-muted-foreground/50 italic">{idx + 1}</td>
                                            <td className="px-6 py-6">
                                              <p className="text-[11px] font-black text-foreground uppercase leading-relaxed tracking-tight">
                                                {item.requirements}
                                              </p>
                                            </td>
                                            <td className="px-6 py-6">
                                              <select 
                                                value={currentAns}
                                                onChange={(e) => handleEditChange(item.id, 'ans', e.target.value)}
                                                className={cn(
                                                  "bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer appearance-none",
                                                  currentAns === 'EMPTY' ? "text-foreground/30 italic" : "text-accent"
                                                )}
                                              >
                                                <option value="EMPTY">EMPTY</option>
                                                <option value="YES">YES</option>
                                                <option value="NO">NO</option>
                                                <option value="N/A">N/A</option>
                                              </select>
                                            </td>
                                            <td className="px-6 py-6">
                                              <div className="flex items-center gap-2">
                                                <input 
                                                  type="text"
                                                  value={currentComments}
                                                  onChange={(e) => handleEditChange(item.id, 'comments', e.target.value)}
                                                  placeholder="EMPTY"
                                                  className="bg-transparent text-[10px] font-black text-foreground uppercase outline-none placeholder:text-foreground/20 italic w-full"
                                                />
                                                {isEditing && (
                                                  <button 
                                                    onClick={() => handleSaveItem(item)}
                                                    className="p-1.5 bg-accent text-white rounded-md hover:scale-110 active:scale-95 transition-all"
                                                  >
                                                    <FileCheck className="w-3 h-3" />
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                              <button 
                                                onClick={() => {
                                                  setSelectedItemForImage(item.id);
                                                  setTempImageUrl(item.image || '');
                                                  setIsImageModalOpen(true);
                                                }}
                                                className={cn(
                                                  "p-2 rounded-lg transition-all",
                                                  item.image ? "text-emerald-500 bg-emerald-500/10" : "text-foreground/50 hover:bg-secondary"
                                                )}
                                              >
                                                <Camera className="w-4 h-4" />
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="py-20 text-center text-[10px] font-black uppercase text-muted-foreground opacity-50 italic">
                                No technical specifications defined
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            }
          </div>
        </div>

        {/* MODAL & NOTIFICATIONS */}
        <AnimatePresence>
          {isImageModalOpen && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-[48px] p-10 w-full max-w-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-3 italic">
                    <Camera className="w-6 h-6 text-accent" />
                    Technical Evidence
                  </h2>
                  <button onClick={() => { stopCamera(); setIsImageModalOpen(false); }} className="p-2 hover:bg-secondary rounded-full">
                    <X className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-8">
                  <div className="aspect-video bg-secondary rounded-[32px] overflow-hidden relative border-2 border-dashed border-border">
                    {isCameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : tempImageUrl ? (
                      <img src={tempImageUrl} className="w-full h-full object-cover" alt="Captured" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <Camera className="w-16 h-16 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Awaiting input</p>
                      </div>
                    )}
                    {isCameraActive && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                        <button onClick={capturePhoto} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Capture</button>
                      </div>
                    )}
                  </div>
                  {!isCameraActive && (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={startCamera} className="flex flex-col items-center justify-center p-8 bg-secondary hover:bg-accent/10 rounded-[32px] transition-all">
                        <Camera className="w-8 h-8 mb-3" />
                        <span className="text-[10px] font-black uppercase">Start Camera</span>
                      </button>
                      <button onClick={() => document.getElementById('file-up')?.click()} className="flex flex-col items-center justify-center p-8 bg-secondary hover:bg-blue-500/10 rounded-[32px] transition-all">
                        <ImageIcon className="w-8 h-8 mb-3" />
                        <span className="text-[10px] font-black uppercase">Upload File</span>
                        <input id="file-up" type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setTempImageUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsImageModalOpen(false)} className="flex-1 py-5 bg-secondary text-muted-foreground rounded-2xl font-black uppercase tracking-widest">Cancel</button>
                    <button disabled={!tempImageUrl} onClick={handleApplyImage} className="flex-1 py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50">Apply</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300]">
              <div className={cn("px-8 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 backdrop-blur-xl border border-white/10", notification.type === 'success' ? "bg-emerald-500/90" : "bg-rose-500/90")}>
                <span className="text-[11px] font-black uppercase tracking-widest text-white italic">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main Page Entry ---
export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Initializing Secure Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {!user ? <LoginView /> : <VesselsDashboard />}
    </main>
  );
}
