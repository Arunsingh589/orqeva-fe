import { Source } from "@/app/types/chat";

interface SourceListProps {
    sources: Source[];
}

function SouceList({ sources, }: SourceListProps) {
    if (sources.length === 0) {
        return null;
    }
    return (
        <div className="mt-4 border-t pt-3">
            <h4 className="mb-2 text-sm font-semibold text-gray-600">Sources</h4>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index} className="rounded-md bg-gray-50 px-3 py-2 text-sm">
                        📄 {source.document} (Page {source.page})
                    </li>
                ))}
            </ul>
        </div>
    );
} 

export default SouceList;