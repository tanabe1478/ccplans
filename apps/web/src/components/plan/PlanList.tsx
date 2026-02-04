import type { PlanMeta } from '@ccplans/shared';
import { PlanCard } from './PlanCard';
import { usePlanStore } from '@/stores/planStore';
import { useMemo } from 'react';

interface PlanListProps {
  plans: PlanMeta[];
  showCheckbox?: boolean;
}

export function PlanList({ plans, showCheckbox = false }: PlanListProps) {
  const { sortBy, sortOrder, searchQuery } = usePlanStore();

  const filteredAndSortedPlans = useMemo(() => {
    let result = [...plans];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (plan) =>
          plan.title.toLowerCase().includes(query) ||
          plan.filename.toLowerCase().includes(query) ||
          plan.preview.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
          break;
        case 'size':
          comparison = b.size - a.size;
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [plans, sortBy, sortOrder, searchQuery]);

  if (filteredAndSortedPlans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery ? 'プランが見つかりませんでした' : 'プランがありません'}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredAndSortedPlans.map((plan) => (
        <PlanCard key={plan.filename} plan={plan} showCheckbox={showCheckbox} />
      ))}
    </div>
  );
}
