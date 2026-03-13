/**
 * useAppwrite — generic data-fetching hook for any Appwrite query function.
 * Shared hook used across all features.
 */
import { useCallback, useEffect, useState } from 'react';

interface UseAppwriteOptions<T, P> {
    fn: (params: P) => Promise<T>;
    params: P;
    skip?: boolean; // if true, don't auto-fetch on mount
}

interface UseAppwriteResult<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<void>;
}

export function useAppwrite<T, P>({
    fn,
    params,
    skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteResult<T, P> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        async (overrideParams?: P) => {
            setLoading(true);
            setError(null);
            try {
                const result = await fn(overrideParams ?? params);
                setData(result);
            } catch (err: any) {
                setError(err?.message ?? 'An error occurred');
            } finally {
                setLoading(false);
            }
        },
        [fn, params]
    );

    useEffect(() => {
        if (!skip) {
            fetchData();
        }
    }, [skip]);

    return { data, loading, error, refetch: fetchData };
}

