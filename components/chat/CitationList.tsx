interface CitationListProps {
  citations: { documentTitle: string; citationLabel: string }[];
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <ul className="mt-2 space-y-0.5 border-t border-gray-100 pt-2 text-xs text-gray-500">
      {citations.map((citation, index) => (
        <li key={index}>
          📄 {citation.citationLabel}
          {citation.documentTitle !== citation.citationLabel
            ? ` — ${citation.documentTitle}`
            : ""}
        </li>
      ))}
    </ul>
  );
}
