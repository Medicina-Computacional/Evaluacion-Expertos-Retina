// Types for the application

export interface User {
    id: string;
    email: string;
    role: 'admin' | 'evaluator';
    name?: string;
}

export interface Case {
    id: string;
    imageUrl: string;
    maskUrl: string;
    metadata?: Record<string, unknown>;
}

export interface Evaluation {
    id?: string;
    userId: string;
    caseId: string;
    q1Acceptability: number; // 1-4
    q2Confidence: number;    // 1-5
    comments?: string;
    submittedAt?: string;
    durationMs?: number;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user: User;
}

export interface EvaluationProgress {
    completed: number;
    total: number;
}
