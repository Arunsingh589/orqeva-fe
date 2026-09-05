import { error } from "console";
import { ChatMessage } from "@/app/types/chat";

const BASE_URL = "http://localhost:8000";


export async function uploadPDF(file: File, agentId?: string) {
    const formData = new FormData();

    formData.append("file", file);
    if (agentId) {
        formData.append("agent_id", agentId);
    }

    const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData
    });
    if (!response.ok) {
        throw new Error("Failed to upload PDF")
    }

    return response.json();
}


export async function askQuestion(question: string, history: ChatMessage[], document?: string | null, agentId?: string, sessionId?: string) {
    const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question,
            history,
            document: document || null,
            agent_id: agentId || null, session_id: sessionId || null,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to get answer")
    }
    return response.json();
}


export interface DocumentsResponse {
    documents: string[];
}

export async function getDocuments(): Promise<string[]> {
    const response = await fetch(`${BASE_URL}/documents`);

    if (!response.ok) {
        throw new Error("failed to fetch documents")
    }

    const data: DocumentsResponse = await response.json();

    return data.documents;
}

export async function deleteDocument(
    filename: string
): Promise<void> {
    const response = await fetch(`${BASE_URL}/documents/${encodeURIComponent(filename)}`,
        {
            method: "DELETE",

        }
    );

    if (!response.ok) {
        throw new Error("failed to delete document")
    }

}

export async function* askQuestionStream(question: string, history: ChatMessage[], document?: string | null, agentId?: string, sessionId?: string) {
    const response = await fetch(`${BASE_URL}/chat_stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question,
            history,
            document: document || null,
            agent_id: agentId || null, session_id: sessionId || null,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to get answer");
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
    }
}

export async function completeOnboarding(token: string) {
    const response = await fetch(`${BASE_URL}/api/user/complete_onboarding`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to complete onboarding");
    }

    return response.json();
}
