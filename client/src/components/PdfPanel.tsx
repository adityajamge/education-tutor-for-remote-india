import { useRef } from 'react';
import { UploadCloud, FileText, X, Trash2, Loader2 } from 'lucide-react';
import type { Document } from '../hooks/useDocuments';

interface PdfPanelProps {
    documents: Document[];
    isUploading: boolean;
    error: string | null;
    onUpload: (files: FileList) => void;
    onRemove: (id: string) => void;
    onClearSession: () => void;
}

export default function PdfPanel({
    documents,
    isUploading,
    error,
    onUpload,
    onRemove,
    onClearSession,
}: PdfPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
        }
    };

    return (
        <div className="pdf-panel">
            <div className="pdf-panel__header">
                <h3 className="pdf-panel__title">
                    <FileText size={16} /> Attached Textbooks ({documents.length}/5)
                </h3>
                {documents.length > 0 && (
                    <button className="pdf-panel__clear-btn" onClick={onClearSession} title="Clear all and start new session">
                        <Trash2 size={14} /> New Session
                    </button>
                )}
            </div>

            {error && <div className="pdf-panel__error">{error}</div>}

            <div className="pdf-panel__list">
                {documents.map((doc) => (
                    <div key={doc.id} className="pdf-panel__item">
                        <div className="pdf-panel__item-info">
                            <FileText size={14} />
                            <span className="pdf-panel__item-name">{doc.fileName}</span>
                            <span className="pdf-panel__item-pages">{doc.pageCount} pages</span>
                        </div>
                        <button className="pdf-panel__item-remove" onClick={() => onRemove(doc.id)} title="Remove PDF">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {documents.length < 5 && (
                <div className="pdf-panel__upload" onClick={() => fileInputRef.current?.click()}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        multiple
                        className="pdf-panel__hidden-input"
                    />
                    {isUploading ? (
                        <div className="pdf-panel__upload-state">
                            <Loader2 size={16} className="pdf-panel__spinner" /> Uploading & Parsing...
                        </div>
                    ) : (
                        <div className="pdf-panel__upload-state">
                            <UploadCloud size={16} /> Click to upload PDFs (Max 5)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
