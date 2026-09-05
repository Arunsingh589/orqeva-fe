export interface Source {
    document: string;
    page: number;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    sources?: Source[];
}