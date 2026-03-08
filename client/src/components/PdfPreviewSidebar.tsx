import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfPreviewSidebar.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const CloseIcon = ({ size = 20 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
);

const ChevronLeftIcon = ({ size = 20 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
);

const ChevronRightIcon = ({ size = 20 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
);

const OpenInNewIcon = ({ size = 20 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
);

interface PdfPreviewSidebarProps {
    pdfUrl: string;
    fileName: string;
    onClose: () => void;
    show: boolean;
}

export default function PdfPreviewSidebar({ pdfUrl, fileName, onClose, show }: PdfPreviewSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pdfUrl || !show) return;

        const fetchPdf = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(pdfUrl, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Failed to load PDF: ${response.status}`);
                }

                const blob = await response.blob();
                setPdfBlob(blob);
            } catch (err) {
                console.error('Error fetching PDF:', err);
                setError(err instanceof Error ? err.message : 'Failed to load PDF');
            } finally {
                setLoading(false);
            }
        };

        fetchPdf();
    }, [pdfUrl, show]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setPageNumber(prev => Math.min(numPages, prev + 1));
    };

    const openInNewTab = () => {
        window.open(pdfUrl, '_blank');
    };

    return (
        <aside className={`pdf-preview-sidebar ${collapsed ? 'pdf-preview-sidebar--collapsed' : ''} ${show ? 'pdf-preview-sidebar--show' : ''}`}>
            {show && (
                <>
                    {/* Header */}
                    <div className={`pdf-preview-header ${collapsed ? 'pdf-preview-header--collapsed' : ''}`}>
                        {!collapsed ? (
                            <>
                                <div className="pdf-preview-header__info">
                                    <h2 className="pdf-preview-header__title">{fileName}</h2>
                                    <p className="pdf-preview-header__subtitle">
                                        {numPages > 0 ? `Page ${pageNumber} of ${numPages}` : 'Loading...'}
                                    </p>
                                </div>
                                <div className="pdf-preview-header__actions">
                                    <button 
                                        className="pdf-preview-header__btn" 
                                        onClick={openInNewTab} 
                                        title="Open in new tab"
                                    >
                                        <OpenInNewIcon size={18} />
                                    </button>
                                    <button 
                                        className="pdf-preview-header__btn" 
                                        onClick={() => setCollapsed(true)} 
                                        title="Collapse"
                                    >
                                        <ChevronRightIcon size={20} />
                                    </button>
                                    <button className="pdf-preview-header__btn" onClick={onClose} title="Close">
                                        <CloseIcon size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button 
                                className="pdf-preview-header__expand" 
                                onClick={() => setCollapsed(false)} 
                                title="Expand PDF Preview"
                            >
                                <ChevronLeftIcon size={20} />
                            </button>
                        )}
                    </div>

                    {!collapsed && (
                        <>
                            {/* Controls */}
                            {!loading && !error && (
                                <div className="pdf-preview-controls">
                                    <button
                                        className="pdf-preview-controls__btn"
                                        onClick={goToPrevPage}
                                        disabled={pageNumber <= 1}
                                        title="Previous page"
                                    >
                                        <ChevronLeftIcon size={18} />
                                    </button>
                                    <span className="pdf-preview-controls__page">
                                        {pageNumber} / {numPages}
                                    </span>
                                    <button
                                        className="pdf-preview-controls__btn"
                                        onClick={goToNextPage}
                                        disabled={pageNumber >= numPages}
                                        title="Next page"
                                    >
                                        <ChevronRightIcon size={18} />
                                    </button>
                                </div>
                            )}

                            {/* PDF Viewer */}
                            <div className="pdf-preview-content">
                                {loading && (
                                    <div className="pdf-preview-loading">
                                        <div className="pdf-preview-spinner" />
                                        <p>Loading PDF...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="pdf-preview-error">
                                        <p>{error}</p>
                                    </div>
                                )}

                                {!loading && !error && pdfBlob && (
                                    <Document
                                        file={pdfBlob}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={null}
                                        error={
                                            <div className="pdf-preview-error">
                                                <p>Failed to render PDF</p>
                                            </div>
                                        }
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            width={380}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                        />
                                    </Document>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </aside>
    );
}
