/**
 * Dashboard Page — Premium DARK "Platform Architecture" edition
 * Operational structure + JetBrains Mono technical labels from the Neuform
 * reference, rendered in a refined dark surface with rich hover effects,
 * glows, sheen, staggered entrance and scroll-triggered transitions.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Upload, Share2, Download, Trash2, FileText, Image, FileArchive,
    Lock, Search, Grid, List, RefreshCw, HardDrive, Shield, Eye,
    AlertCircle, Clock, ArrowUpRight, Activity as ActivityIcon
} from 'lucide-react';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '../components';
import { DashboardLayout } from '../layouts';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../services/api';

// Restrained dark data-viz palette (violet/indigo accents)
const DONUT = ['#A855F7', '#6366F1', '#8B5CF6', '#3F3F46'];

const PANEL = 'pa-panel';

const MONO_TICK = { fill: '#71717A', fontSize: 11, fontFamily: 'JetBrains Mono' };
const TOOLTIP_STYLE = {
    background: 'rgba(10,10,16,0.92)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    boxShadow: '0 16px 40px -16px rgba(0,0,0,0.7)',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    color: '#FAFAFA',
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
// Smooth spring used for card hover lift
const SPRING = { type: 'spring', stiffness: 300, damping: 24, mass: 0.6 };
// Staggered entrance for each card (smooth top-to-bottom load cascade)
const cardIn = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

const ACTIVITY_META = {
    upload: { icon: Upload, label: 'Uploaded' },
    download: { icon: Download, label: 'Downloaded' },
    share: { icon: Share2, label: 'Shared' },
    delete: { icon: Trash2, label: 'Removed' },
    view: { icon: Eye, label: 'Viewed' },
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const formatTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return Image;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return FileArchive;
    return FileText;
};

// Upload CTA — dark fill wrapped in a continuously flowing violet→indigo border
const UploadButton = ({ label = 'Upload' }) => (
    <Link
        to="/upload"
        className="pa-gradient-border group relative inline-flex rounded-lg p-[1.5px] shadow-[0_6px_22px_-10px_rgba(168,85,247,0.5)] transition-transform duration-200 hover:-translate-y-0.5"
    >
        <span className="inline-flex items-center gap-2 rounded-[6.5px] bg-[#0b0b14] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 group-hover:bg-[#15151f]">
            <Upload size={16} />
            {label}
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
    </Link>
);

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [viewMode, setViewMode] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [stats, setStats] = useState({ totalFiles: 0, totalStorage: 0, totalDownloads: 0, totalShares: 0 });
    const [uploadData, setUploadData] = useState([]);
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [storageData, setStorageData] = useState([
        { name: 'Documents', value: 0 }, { name: 'Images', value: 0 },
        { name: 'Archives', value: 0 }, { name: 'Others', value: 0 },
    ]);

    const [activities, setActivities] = useState([]);
    const [activityState, setActivityState] = useState('loading');

    // Charts animate ONCE when fresh data arrives, then lock off so that
    // hover/tooltip re-renders don't replay the draw animation (the annoyance).
    const [animateCharts, setAnimateCharts] = useState(true);

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await filesAPI.listFiles();
            setFiles(response.data?.files || []);
        } catch (err) {
            setError(err.message || 'Failed to load files');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await filesAPI.getStats();
            if (response.data) {
                setStats((prev) => ({
                    ...prev,
                    totalDownloads: response.data.totalDownloads || 0,
                    totalShares: response.data.totalShares || 0,
                }));
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err.message);
        }
    }, []);

    const fetchWeeklyActivity = useCallback(async () => {
        setIsLoadingChart(true);
        try {
            const response = await filesAPI.getWeeklyActivity();
            if (response.data) setUploadData(response.data);
        } catch {
            setUploadData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name) => ({ name, uploads: 0, downloads: 0 })));
        } finally {
            setIsLoadingChart(false);
        }
    }, []);

    const fetchActivity = useCallback(async () => {
        setActivityState('loading');
        try {
            const response = await filesAPI.getActivity(7);
            setActivities(response.data?.activities || []);
            setActivityState('ready');
        } catch {
            setActivityState('error');
        }
    }, []);

    const refreshAll = useCallback(() => {
        fetchFiles();
        fetchStats();
        fetchWeeklyActivity();
        fetchActivity();
    }, [fetchFiles, fetchStats, fetchWeeklyActivity, fetchActivity]);

    useEffect(() => { refreshAll(); }, [refreshAll]);

    useEffect(() => {
        const totalStorage = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
        setStats((prev) => ({ ...prev, totalFiles: files.length, totalStorage }));

        if (files.length > 0) {
            const b = { Documents: 0, Images: 0, Archives: 0, Others: 0 };
            files.forEach((file) => {
                const ext = file.originalFilename?.split('.').pop()?.toLowerCase() || '';
                const size = file.fileSize || 0;
                if (['doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) b.Documents += size;
                else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) b.Images += size;
                else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) b.Archives += size;
                else b.Others += size;
            });
            const total = Object.values(b).reduce((a, c) => a + c, 0) || 1;
            setStorageData([
                { name: 'Documents', value: Math.round((b.Documents / total) * 100) },
                { name: 'Images', value: Math.round((b.Images / total) * 100) },
                { name: 'Archives', value: Math.round((b.Archives / total) * 100) },
                { name: 'Others', value: Math.round((b.Others / total) * 100) },
            ]);
        }
    }, [files]);

    // Play chart animation once per data change, then disable it
    useEffect(() => {
        setAnimateCharts(true);
        const t = setTimeout(() => setAnimateCharts(false), 1600);
        return () => clearTimeout(t);
    }, [uploadData, storageData]);

    const handleDelete = async () => {
        if (!selectedFile) return;
        try {
            await filesAPI.deleteFile(selectedFile.id);
            setFiles((prev) => prev.filter((f) => f.id !== selectedFile.id));
            setShowDeleteModal(false);
            setSelectedFile(null);
        } catch (err) {
            setError(err.message || 'Failed to delete file');
        }
    };

    const filteredFiles = files.filter((f) =>
        f.originalFilename?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const firstName = user?.email ? user.email.split('@')[0] : 'operator';

    const metrics = [
        { label: 'Encrypted Objects', value: stats.totalFiles, meta: 'AES-256 · client-side', icon: FileText, accent: '#A855F7' },
        { label: 'Storage Allocated', value: formatFileSize(stats.totalStorage), meta: 'of unlimited', icon: HardDrive, accent: '#8B5CF6' },
        { label: 'Total Downloads', value: stats.totalDownloads, meta: 'all time', icon: Download, accent: '#6366F1' },
        { label: 'Active Shares', value: stats.totalShares, meta: 'link accesses', icon: Share2, accent: '#3B82F6' },
    ];

    return (
        <DashboardLayout user={user} onLogout={logout} variant="platform">
            {/* ── Command header ───────────────────────────── */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
                <div className="pa-reveal">
                    <div className="tech-label mb-3">Cipher Drop / Overview</div>
                    <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
                        Welcome back,{' '}
                        <span className="bg-gradient-to-r from-[#C084FC] via-[#A855F7] to-[#6366F1] bg-clip-text text-transparent">{firstName}</span>
                        <span className="text-zinc-600">.</span>
                    </h1>
                    <p className="mt-3 text-[15px] text-zinc-400">Your encrypted workspace at a glance.</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 tech-label">
                        <span className="flex items-center gap-2 text-zinc-300">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75 animate-ping" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                            </span>
                            Operational
                        </span>
                        <span className="text-zinc-700">/</span>
                        <span>Zero-Knowledge</span>
                        <span className="text-zinc-700">/</span>
                        <span>AES-256-GCM</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshAll}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <UploadButton />
                </div>
            </div>

            {/* ── Metric strip (nested hairline cells) ─────────── */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] mb-6 shadow-[0_20px_44px_-30px_rgba(0,0,0,0.75)]"
            >
                {metrics.map((m) => (
                    <motion.div
                        key={m.label}
                        variants={item}
                        className="group relative overflow-hidden bg-[#0a0a12] p-5 md:p-6 transition-colors duration-300 hover:bg-[#13131d]"
                    >
                        <div className="relative flex items-center justify-between">
                            <span className="tech-label">{m.label}</span>
                            <span
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-110"
                                style={{ color: m.accent }}
                            >
                                <m.icon size={15} strokeWidth={1.9} />
                            </span>
                        </div>
                        <div className="relative mt-5 bg-gradient-to-br from-white to-white/60 bg-clip-text text-[32px] md:text-[34px] leading-none font-semibold tracking-tight text-transparent tabular-nums">
                            {m.value}
                        </div>
                        <div className="relative mt-2 font-mono text-[11px] text-zinc-500">{m.meta}</div>
                        <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full" style={{ backgroundColor: m.accent }} />
                    </motion.div>
                ))}
            </motion.div>

            {/* ── Telemetry + Storage ──────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <motion.div {...cardIn(0.1)} whileHover={{ y: -6, transition: SPRING }} className={`${PANEL} lg:col-span-2 p-6`}>
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="tech-label mb-2">Telemetry Engine</div>
                            <h3 className="text-lg font-medium tracking-tight text-white">Weekly activity<span className="text-zinc-600">.</span></h3>
                        </div>
                        <div className="flex items-center gap-4 tech-label">
                            <span className="flex items-center gap-2 text-zinc-300"><span className="h-2 w-2 rounded-sm bg-[#A855F7]" />Uploads</span>
                            <span className="flex items-center gap-2 text-zinc-300"><span className="h-2 w-2 rounded-sm bg-[#6366F1]" />Downloads</span>
                        </div>
                    </div>
                    <div className="h-64">
                        {isLoadingChart ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#A855F7]" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={uploadData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="g-up" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#A855F7" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="g-down" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.28} />
                                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={MONO_TICK} dy={8} />
                                    <YAxis tickLine={false} axisLine={false} tick={MONO_TICK} width={34} allowDecimals={false} />
                                    <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }} contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#71717A' }} />
                                    <Area type="monotone" dataKey="uploads" stroke="#A855F7" strokeWidth={2} fill="url(#g-up)" dot={false} activeDot={{ r: 4, fill: '#A855F7', stroke: '#08080c', strokeWidth: 2 }} isAnimationActive={animateCharts} animationBegin={0} animationDuration={1200} animationEasing="ease-out" />
                                    <Area type="monotone" dataKey="downloads" stroke="#6366F1" strokeWidth={2} fill="url(#g-down)" dot={false} activeDot={{ r: 4, fill: '#6366F1', stroke: '#08080c', strokeWidth: 2 }} isAnimationActive={animateCharts} animationBegin={180} animationDuration={1200} animationEasing="ease-out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                <motion.div {...cardIn(0.18)} whileHover={{ y: -6, transition: SPRING }} className={`${PANEL} p-6`}>
                    <div className="tech-label mb-2">Storage Allocation</div>
                    <h3 className="text-lg font-medium tracking-tight text-white mb-4">By type<span className="text-zinc-600">.</span></h3>
                    <div className="relative h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={storageData} dataKey="value" cx="50%" cy="50%" innerRadius={52} outerRadius={74} paddingAngle={2} stroke="none" isAnimationActive={animateCharts} animationBegin={150} animationDuration={1000} animationEasing="ease-out">
                                    {storageData.map((e, i) => <Cell key={i} fill={DONUT[i % DONUT.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Share']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-xl font-semibold tracking-tight text-white tabular-nums">{formatFileSize(stats.totalStorage)}</div>
                            <div className="tech-label mt-1">Total</div>
                        </div>
                    </div>
                    <div className="mt-5 space-y-2.5">
                        {storageData.map((s, i) => (
                            <div key={s.name} className="flex items-center gap-2.5 text-sm">
                                <span className="h-2 w-2 rounded-full" style={{ background: DONUT[i % DONUT.length] }} />
                                <span className="text-zinc-400">{s.name}</span>
                                <span className="ml-auto font-mono text-xs text-zinc-500 tabular-nums">{s.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-300">{error}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Check your connection and ensure the backend is running.</p>
                    </div>
                    <button onClick={refreshAll} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white">Retry</button>
                </div>
            )}

            {/* ── Objects + Activity ───────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6">
                <motion.div {...cardIn(0.26)} whileHover={{ y: -6, transition: SPRING }} className={`${PANEL} lg:col-span-2 overflow-hidden`}>
                    <div className="flex flex-col gap-4 border-b border-white/[0.08] p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="tech-label mb-2">Encrypted Objects</div>
                            <h3 className="text-lg font-medium tracking-tight text-white">
                                Your files<span className="text-zinc-600">.</span>
                                <span className="ml-2 font-mono text-xs text-zinc-500">{filteredFiles.length} of {files.length}</span>
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search objects…"
                                    className="w-44 rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-[#A855F7]/60 focus:ring-2 focus:ring-[#A855F7]/20"
                                />
                            </div>
                            <div className="flex overflow-hidden rounded-lg border border-white/10">
                                {[{ m: 'list', I: List }, { m: 'grid', I: Grid }].map(({ m, I }) => (
                                    <button
                                        key={m}
                                        onClick={() => setViewMode(m)}
                                        className={`p-2 transition-colors ${viewMode === m ? 'bg-white/15 text-white' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                                    >
                                        <I size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#A855F7]" />
                            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-zinc-500">Loading objects…</p>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                <FileText size={24} className="text-zinc-500" />
                            </div>
                            <h4 className="text-base font-medium text-white">No objects found</h4>
                            <p className="mt-1 mb-6 text-sm text-zinc-500">
                                {searchQuery ? 'Try a different search term' : 'Encrypt and upload your first file to get started'}
                            </p>
                            <UploadButton label="Upload file" />
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.08]">
                                        {['Name', 'Size', 'Created', 'Status', ''].map((h, i) => (
                                            <th key={i} className={`px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 ${i === 4 ? 'text-right' : 'text-left'} ${i === 1 ? 'hidden md:table-cell' : ''} ${i === 2 ? 'hidden lg:table-cell' : ''} ${i === 3 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.map((file) => {
                                        const FileIco = getFileIcon(file.originalFilename);
                                        return (
                                            <tr key={file.id} className="group relative border-b border-white/[0.05] last:border-0 transition-colors hover:bg-white/[0.04]">
                                                <td className="relative px-6 py-3.5">
                                                    <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-gradient-to-b from-[#A855F7] to-[#6366F1] transition-transform duration-300 group-hover:scale-y-100" />
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all group-hover:border-[#A855F7]/40 group-hover:text-[#C084FC]">
                                                            <FileIco size={16} />
                                                        </div>
                                                        <span className="max-w-[220px] truncate text-sm font-medium text-white" title={file.originalFilename}>{file.originalFilename}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden px-6 py-3.5 font-mono text-xs text-zinc-400 md:table-cell">{formatFileSize(file.fileSize)}</td>
                                                <td className="hidden px-6 py-3.5 font-mono text-xs text-zinc-400 lg:table-cell">{formatDate(file.createdAt)}</td>
                                                <td className="hidden px-6 py-3.5 sm:table-cell">
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                                                        <Lock size={10} className="text-[#10B981]" /> Encrypted
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center justify-end gap-1 opacity-50 transition-opacity group-hover:opacity-100">
                                                        <Link to={`/share/${file.id}`} className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white" title="Share">
                                                            <Share2 size={15} />
                                                        </Link>
                                                        <button onClick={() => { setSelectedFile(file); setShowDeleteModal(true); }} className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/15 hover:text-red-400" title="Delete">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2 xl:grid-cols-3">
                            {filteredFiles.map((file) => {
                                const FileIco = getFileIcon(file.originalFilename);
                                return (
                                    <div key={file.id} className="group bg-[#0a0a12] p-5 transition-colors hover:bg-[#13131d]">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all group-hover:border-[#A855F7]/40 group-hover:text-[#C084FC]">
                                                <FileIco size={18} />
                                            </div>
                                            <button onClick={() => { setSelectedFile(file); setShowDeleteModal(true); }} className="rounded-lg p-1.5 text-zinc-500 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                        <h4 className="truncate text-sm font-medium text-white" title={file.originalFilename}>{file.originalFilename}</h4>
                                        <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                                            <span>{formatFileSize(file.fileSize)}</span><span>·</span><span>{formatDate(file.createdAt)}</span>
                                        </div>
                                        <Link to={`/share/${file.id}`} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#C084FC] hover:text-white">
                                            Share link <ArrowUpRight size={13} />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Activity stream */}
                <motion.div {...cardIn(0.34)} whileHover={{ y: -6, transition: SPRING }} className={`${PANEL} p-6`}>
                    <div className="mb-5 flex items-center gap-2">
                        <ActivityIcon size={16} className="text-[#C084FC]" />
                        <div className="tech-label">Activity Stream</div>
                    </div>

                    {activityState === 'loading' ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 animate-pulse rounded-lg bg-white/[0.06]" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
                                        <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/[0.06]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activityState === 'error' ? (
                        <div className="py-10 text-center">
                            <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
                            <p className="text-sm text-zinc-400">Couldn’t load activity</p>
                            <button onClick={fetchActivity} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white">
                                <RefreshCw size={13} /> Retry
                            </button>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                <ActivityIcon size={20} className="text-zinc-500" />
                            </div>
                            <p className="text-sm font-medium text-white">No activity yet</p>
                            <p className="mt-1 text-xs text-zinc-500">Events will appear here</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <span className="absolute bottom-2 left-[15px] top-2 w-px bg-white/[0.08]" />
                            <div className="space-y-1">
                                {activities.map((a, idx) => {
                                    const meta = ACTIVITY_META[a.type] || ACTIVITY_META.view;
                                    const Ico = meta.icon;
                                    return (
                                        <div key={a.id || idx} className="group relative flex items-start gap-3 rounded-lg py-2 pl-0 pr-2 transition-colors hover:bg-white/[0.03]">
                                            <div className="z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a12] text-zinc-400 transition-colors group-hover:border-[#A855F7]/40 group-hover:text-[#C084FC]">
                                                <Ico size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1 pt-0.5">
                                                <p className="truncate text-sm text-white">
                                                    <span className="font-medium">{meta.label}</span>{' '}
                                                    <span className="text-zinc-500">{a.fileName || 'a file'}</span>
                                                </p>
                                                <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                                                    <Clock size={10} /> {formatTimeAgo(a.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Security footer strip ────────────────────────── */}
            <motion.div {...cardIn(0.42)} className="pa-panel mt-6 flex flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#A855F7] to-[#6366F1]">
                        <Shield size={17} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Zero-knowledge encryption active</p>
                        <p className="text-xs text-zinc-500">Files are encrypted client-side — the server only stores ciphertext.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 tech-label">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300"><Lock size={12} /> AES-256</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300"><Eye size={12} /> Zero-Knowledge</span>
                </div>
            </motion.div>

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                type="delete"
                title="Delete object?"
                message="This action cannot be undone. The encrypted file will be permanently removed."
                confirmText="Delete"
                cancelText="Cancel"
                itemName={selectedFile?.originalFilename}
            />
        </DashboardLayout>
    );
};

export default DashboardPage;
