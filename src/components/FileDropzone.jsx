/**
 * FileDropzone Component
 * Drag and drop file upload area with visual feedback
 */
import { useState, useRef } from 'react';
import { Upload, FileIcon, X, Shield } from 'lucide-react';

const FileDropzone = ({
    onFileSelect,
    accept = '*',
    maxSize = 100 * 1024 * 1024, // 100MB default
    multiple = false,
    disabled = false,
    className = '',
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Format file size for display
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handle file validation and selection
    const handleFiles = (files) => {
        setError(null);
        const validFiles = [];

        for (const file of files) {
            if (file.size > maxSize) {
                setError(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            const newFiles = multiple ? [...selectedFiles, ...validFiles] : [validFiles[0]];
            setSelectedFiles(newFiles);
            onFileSelect?.(newFiles);
        }
    };

    // Drag event handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!disabled) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Click to browse
    const handleClick = () => {
        if (!disabled) fileInputRef.current?.click();
    };

    // Remove selected file
    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFileSelect?.(newFiles);
    };

    return (
        <div className={className}>
            {/* Dropzone area */}
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDragging
                        ? 'border-primary bg-primary/10 scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-surface/50'
                    }
        `}
            >
                {/* Upload icon */}
                <div className={`
          p-4 rounded-full bg-surface-hover
          ${isDragging ? 'animate-bounce' : ''}
        `}>
                    <Upload
                        size={32}
                        className={isDragging ? 'text-primary' : 'text-text-muted'}
                    />
                </div>

                {/* Instructions */}
                <div className="text-center">
                    <p className="text-text font-medium">
                        {isDragging ? 'Drop your files here' : 'Drag & drop files here'}
                    </p>
                    <p className="text-text-muted text-sm mt-1">
                        or click to browse
                    </p>
                    <p className="text-text-dim text-xs mt-2">
                        Maximum file size: {formatFileSize(maxSize)}
                    </p>
                </div>

                {/* Security indicator */}
                <div className="flex items-center gap-2 text-success text-xs">
                    <Shield size={14} />
                    <span>Encryption happens in your browser</span>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    disabled={disabled}
                />
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-3 text-error text-sm">{error}</p>
            )}

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-3">
                                <FileIcon size={20} className="text-primary" />
                                <div>
                                    <p className="text-text text-sm font-medium truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-text-muted text-xs">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-error transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileDropzone;
