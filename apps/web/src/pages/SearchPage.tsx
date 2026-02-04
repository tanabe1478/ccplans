import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '@/lib/hooks/useSearch';
import { Loader2, AlertCircle, Search, FileText } from 'lucide-react';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data, isLoading, error } = useSearch(query);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">検索結果</h1>
        <p className="text-muted-foreground">
          "{query}" の検索結果
          {data && ` (${data.total}件)`}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-12 text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>検索に失敗しました</p>
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mb-2" />
          <p>該当するプランが見つかりませんでした</p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <div className="space-y-4">
          {data.results.map((result) => (
            <div
              key={result.filename}
              className="rounded-lg border bg-card p-4"
            >
              <Link
                to={`/plan/${encodeURIComponent(result.filename)}`}
                className="group"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium group-hover:text-primary">
                      {result.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {result.filename}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.matches.length}件のマッチ
                  </span>
                </div>
              </Link>

              <div className="mt-3 space-y-2">
                {result.matches.slice(0, 3).map((match, index) => (
                  <div
                    key={index}
                    className="text-sm border-l-2 border-muted pl-3 py-1"
                  >
                    <span className="text-xs text-muted-foreground mr-2">
                      行 {match.line}
                    </span>
                    <span
                      className="text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(match.highlight, query),
                      }}
                    />
                  </div>
                ))}
                {result.matches.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-3">
                    + {result.matches.length - 3}件のマッチ
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string): string {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-0.5">$1</mark>');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
