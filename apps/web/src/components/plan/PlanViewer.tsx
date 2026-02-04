import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import type { PlanDetail } from '@ccplans/shared';

interface PlanViewerProps {
  plan: PlanDetail;
}

export function PlanViewer({ plan }: PlanViewerProps) {
  return (
    <article className="markdown-content">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {plan.content}
      </ReactMarkdown>
    </article>
  );
}
