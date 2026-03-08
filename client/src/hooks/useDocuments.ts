import { useState, useEffect, useCallback } from 'react';

export interface Document {
    id: string;
    fileName: string;
    pageCount: number;
}

const API_BASE = 'http://localhost:3000/api';

export function useDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/session-status`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.hasDocuments) {
                setDocuments(data.documents);
            } else {
                setDocuments([]);
            }
        } catch (err) {
            console.error('Failed to fetch session status', err);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const uploadFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('pdfs', file);
        });

        try {
            const res = await fetch(`${API_BASE}/upload-pdf`, {
                method: 'POST',
                body: formData,
                credentials: 'include', // essential for session cookies
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to upload files');
            }

            setDocuments(data.allDocuments);
        } catch (err: any) {
            setError(err.message || 'Error uploading files');
        } finally {
            setIsUploading(false);
        }
    };

    const removeDocument = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/document/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) {
                setDocuments(data.remainingDocuments);
            }
        } catch (err) {
            console.error('Failed to remove document', err);
        }
    };

    const endSession = async () => {
        try {
            await fetch(`${API_BASE}/end-session`, {
                method: 'POST',
                credentials: 'include',
            });
            setDocuments([]);
        } catch (err) {
            console.error('Failed to end session', err);
        }
    };

    return {
        documents,
        isUploading,
        error,
        uploadFiles,
        removeDocument,
        endSession,
    };
}
