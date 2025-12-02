import { useInfiniteQuery } from '@tanstack/react-query';
import { beneficiosService } from '../services/beneficiosService';

export const useBeneficios = () => {
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = useInfiniteQuery({
        queryKey: ['beneficios'],
        queryFn: ({ pageParam = 1 }) => beneficiosService.getPromotions(pageParam),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const beneficios = data?.pages.flatMap((page) => page.items) || [];

    return {
        beneficios,
        loading: isLoading,
        error: isError ? (error as Error).message : null,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refresh: refetch,
        isRefreshing: isRefetching,
    };
};
