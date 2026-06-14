/**
 * File Icon Component
 * Shows colored icons based on file type
 */
import {
    FileText,
    Image,
    FileVideo,
    FileAudio,
    FileArchive,
    FileCode,
    FileSpreadsheet,
    File,
    FileType
} from 'lucide-react';

const getFileInfo = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';

    const types = {
        // Documents
        pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10', label: 'PDF' },
        doc: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'DOC' },
        docx: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'DOCX' },
        txt: { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'TXT' },

        // Spreadsheets
        xls: { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-500/10', label: 'XLS' },
        xlsx: { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-500/10', label: 'XLSX' },
        csv: { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-500/10', label: 'CSV' },

        // Images
        jpg: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'JPG' },
        jpeg: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'JPEG' },
        png: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'PNG' },
        gif: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'GIF' },
        svg: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'SVG' },
        webp: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'WEBP' },

        // Video
        mp4: { icon: FileVideo, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'MP4' },
        mov: { icon: FileVideo, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'MOV' },
        avi: { icon: FileVideo, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'AVI' },
        mkv: { icon: FileVideo, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'MKV' },

        // Audio
        mp3: { icon: FileAudio, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'MP3' },
        wav: { icon: FileAudio, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'WAV' },
        flac: { icon: FileAudio, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'FLAC' },

        // Archives
        zip: { icon: FileArchive, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'ZIP' },
        rar: { icon: FileArchive, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'RAR' },
        '7z': { icon: FileArchive, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: '7Z' },
        tar: { icon: FileArchive, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'TAR' },
        gz: { icon: FileArchive, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'GZ' },

        // Code
        js: { icon: FileCode, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'JS' },
        jsx: { icon: FileCode, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'JSX' },
        ts: { icon: FileCode, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'TS' },
        tsx: { icon: FileCode, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'TSX' },
        py: { icon: FileCode, color: 'text-green-400', bg: 'bg-green-400/10', label: 'PY' },
        html: { icon: FileCode, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'HTML' },
        css: { icon: FileCode, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'CSS' },
        json: { icon: FileCode, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'JSON' },
    };

    return types[ext] || { icon: File, color: 'text-text-muted', bg: 'bg-surface-hover', label: ext.toUpperCase() || 'FILE' };
};

const FileIcon = ({ filename, size = 'md', showLabel = false, className = '' }) => {
    const { icon: Icon, color, bg, label } = getFileInfo(filename);

    const sizeClasses = {
        sm: { container: 'p-2', icon: 16 },
        md: { container: 'p-3', icon: 24 },
        lg: { container: 'p-4', icon: 32 }
    };

    const { container, icon: iconSize } = sizeClasses[size];

    return (
        <div className={`relative inline-flex flex-col items-center ${className}`}>
            <div className={`${container} rounded-xl ${bg} transition-transform hover:scale-105`}>
                <Icon size={iconSize} className={color} />
            </div>
            {showLabel && (
                <span className="text-xs font-medium text-text-muted mt-1">{label}</span>
            )}
        </div>
    );
};

export { getFileInfo };
export default FileIcon;
