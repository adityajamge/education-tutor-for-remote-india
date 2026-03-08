export interface Document {
    id: string;
    fileName: string;
    text: string;
    pageCount: number;
    uploadedAt: number;
}

export interface Session {
    documents: Document[];
    createdAt: number;
}

// In-memory store: sessionId → session data
const store = new Map<string, Session>();

export const sessionStore = {
    get(sessionId: string): Session | undefined {
        return store.get(sessionId);
    },

    set(sessionId: string, session: Session): void {
        store.set(sessionId, session);
    },

    delete(sessionId: string): boolean {
        return store.delete(sessionId);
    },

    /** Create a new session if one doesn't exist, return it either way */
    getOrCreate(sessionId: string): Session {
        let session = store.get(sessionId);
        if (!session) {
            session = { documents: [], createdAt: Date.now() };
            store.set(sessionId, session);
        }
        return session;
    },

    /** Debug: get count of active sessions */
    size(): number {
        return store.size;
    },
};

// Automatic cleanup timer: runs every 5 minutes
setInterval(() => {
    const now = Date.now();
    let deletedCount = 0;

    for (const [id, session] of store.entries()) {
        // If session is older than 30 minutes (30 * 60 * 1000 ms)
        if (now - session.createdAt > 30 * 60 * 1000) {
            store.delete(id);
            deletedCount++;
        }
    }

    if (deletedCount > 0) {
        console.log(`[SessionStore] Auto-cleaned ${deletedCount} expired session(s).`);
    }
}, 5 * 60 * 1000); // 5 minutes
