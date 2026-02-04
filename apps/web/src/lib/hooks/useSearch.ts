import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search.query(query),
    enabled: enabled && query.length > 0,
  });
}
