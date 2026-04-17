import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';
import api from '../lib/api';
import type {
    User,
    AuthResponse,
    PastorProfile,
    MemberProfile,
    PartnerProfile,
    ZoneSummary,
    Event,
    EventRegistration,
    Payment,
    PaymentSummary,
    GivingSummary,
    PaginatedResponse,
    ApiResponse,
} from '../types';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
    me:           ['me']              as const,
    pastor:       ['pastor', 'me']    as const,
    zoneSummary:  ['pastor', 'zone-summary'] as const,
    member:       ['member', 'me']    as const,
    partner:      ['partner', 'me']   as const,
    partnerSummary: ['partner', 'summary'] as const,

    events:       (filters?: object) => ['events', filters ?? {}] as const,
    event:        (id: number)       => ['events', id]            as const,

    payments:     (filters?: object) => ['payments', filters ?? {}] as const,
    myPayments:   ['payments', 'my'] as const,
    paymentSummary: ['payments', 'summary'] as const,

    members:      (filters?: object) => ['members', filters ?? {}] as const,
    memberById:   (id: number)       => ['members', id]            as const,
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Current authenticated user */
export function useMe() {
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: async (): Promise<User> => {
            const { data } = await api.get<ApiResponse<User>>('/me');
            return data.data ?? data.user; // handle both shapes
        },
        staleTime: 5 * 60 * 1000,
    });
}

/** Login with unique code (Pastor) */
export function useCodeLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (unique_code: string): Promise<AuthResponse> => {
            const { data } = await api.post<AuthResponse>('/login/code', { unique_code });
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('him_token', data.token);
            localStorage.setItem('him_user', JSON.stringify(data.user));
            queryClient.setQueryData(queryKeys.me, data.user);
        },
    });
}

/** Login with email + password (Member / Partner) */
export function useEmailLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (credentials: {
            email: string;
            password: string;
        }): Promise<AuthResponse> => {
            const { data } = await api.post<AuthResponse>('/login', credentials);
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('him_token', data.token);
            localStorage.setItem('him_user', JSON.stringify(data.user));
            queryClient.setQueryData(queryKeys.me, data.user);
        },
    });
}

/** Logout */
export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post('/logout');
        },
        onSuccess: () => {
            localStorage.removeItem('him_token');
            localStorage.removeItem('him_user');
            queryClient.clear();
        },
    });
}

/** Accept terms */
export function useAcceptTerms() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/terms/accept');
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    });
}

/** Complete tour */
export function useCompleteTour() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/tour/complete');
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    });
}

// ─── Pastor portal ────────────────────────────────────────────────────────────

export function usePastorProfile() {
    return useQuery({
        queryKey: queryKeys.pastor,
        queryFn: async (): Promise<PastorProfile> => {
            const { data } = await api.get<ApiResponse<PastorProfile>>('/pastors/me');
            return data.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useZoneSummary() {
    return useQuery({
        queryKey: queryKeys.zoneSummary,
        queryFn: async (): Promise<ZoneSummary> => {
            const { data } = await api.get<ApiResponse<ZoneSummary>>('/pastors/zone-summary');
            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });
}

// ─── Member portal ────────────────────────────────────────────────────────────

export function useMemberProfile() {
    return useQuery({
        queryKey: queryKeys.member,
        queryFn: async (): Promise<MemberProfile> => {
            const { data } = await api.get<ApiResponse<MemberProfile>>('/members/me');
            return data.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useUpdateMemberProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<MemberProfile>) => {
            const { data } = await api.put('/members/me', payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.member }),
    });
}

// ─── Partner portal ───────────────────────────────────────────────────────────

export function usePartnerProfile() {
    return useQuery({
        queryKey: queryKeys.partner,
        queryFn: async (): Promise<PartnerProfile> => {
            const { data } = await api.get<ApiResponse<PartnerProfile>>('/partners/me');
            return data.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function usePartnerGivingSummary() {
    return useQuery({
        queryKey: queryKeys.partnerSummary,
        queryFn: async (): Promise<GivingSummary> => {
            const { data } = await api.get<ApiResponse<GivingSummary>>('/partners/me/summary');
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function usePartnerPayments() {
    return useQuery({
        queryKey: queryKeys.myPayments,
        queryFn: async (): Promise<Payment[]> => {
            const { data } = await api.get<PaginatedResponse<Payment>>('/partners/me/payments');
            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useEvents(filters?: {
    type?: string;
    upcoming?: boolean;
    open?: boolean;
}) {
    return useQuery({
        queryKey: queryKeys.events(filters),
        queryFn: async (): Promise<PaginatedResponse<Event>> => {
            const { data } = await api.get<PaginatedResponse<Event>>('/events', {
                params: filters,
            });
            return data;
        },
        staleTime: 2 * 60 * 1000,
    });
}

export function useEvent(id: number) {
    return useQuery({
        queryKey: queryKeys.event(id),
        queryFn: async (): Promise<Event> => {
            const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
}

export function useRegisterForEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventId: number): Promise<EventRegistration> => {
            const { data } = await api.post<ApiResponse<EventRegistration>>(
                `/events/${eventId}/register`
            );
            return data.data;
        },
        onSuccess: (_data, eventId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.events() });
        },
    });
}

export function useCancelEventRegistration() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventId: number) => {
            await api.delete(`/events/${eventId}/register`);
        },
        onSuccess: (_data, eventId) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId) });
        },
    });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function useMyPayments() {
    return useQuery({
        queryKey: queryKeys.myPayments,
        queryFn: async (): Promise<Payment[]> => {
            const { data } = await api.get<PaginatedResponse<Payment>>('/payments/my');
            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });
}

export function usePaymentSummary() {
    return useQuery({
        queryKey: queryKeys.paymentSummary,
        queryFn: async (): Promise<PaymentSummary> => {
            const { data } = await api.get<ApiResponse<PaymentSummary>>('/payments/summary');
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

// ─── Members list (Pastor / HOD view) ────────────────────────────────────────

export function useMembers(filters?: { search?: string; status?: string }) {
    return useQuery({
        queryKey: queryKeys.members(filters),
        queryFn: async () => {
            const { data } = await api.get('/members', { params: filters });
            return data as PaginatedResponse<MemberProfile>;
        },
        staleTime: 3 * 60 * 1000,
    });
}
