// ─── Role types ───────────────────────────────────────────────────────────────

export type FilamentRole = 'master' | 'finance' | 'event';
export type PortalRole   = 'pastor' | 'partner' | 'member' | 'hod';
export type UserRole     = FilamentRole | PortalRole;

export const PORTAL_ROLES: PortalRole[] = ['pastor', 'partner', 'member', 'hod'];

// ─── Core entities ────────────────────────────────────────────────────────────

export interface Zone {
    id: number;
    name: string;
}

export interface Region {
    id: number;
    name: string;
    country_id: number;
}

export interface Country {
    id: number;
    name: string;
}

export interface HomeGroup {
    id: number;
    name: string;
    zone_id: number;
    location?: string;
    meeting_day?: string;
    meeting_time?: string;
    leader?: { id: number; name: string };
    members?: number;
}

export interface Department {
    id: number;
    name: string;
    zone_id?: number;
}

export interface Gender {
    id: number;
    name: string;
}

// ─── Profile sub-tables ───────────────────────────────────────────────────────

export interface PastorProfile {
    id: number;
    name: string;
    surname: string;
    full_name: string;
    title: string;
    code: string;
    is_zone_pastor: boolean;
    ordained_date?: string;
    zone?: Zone;
}

export interface MemberProfile {
    id: number;
    name: string;
    surname: string;
    full_name: string;
    member_number?: string;
    status: 'active' | 'inactive' | 'transferred' | 'deceased';
    is_baptised: boolean;
    membership_date?: string;
    date_of_birth?: string;
    zone?: Zone;
    home_group?: HomeGroup;
    department?: Department;
    gender?: Gender;
    is_partner?: boolean;
}

export interface PartnerProfile {
    id: number;
    name: string;
    surname: string;
    full_name: string;
    partner_number?: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'founder';
    status: 'active' | 'inactive' | 'lapsed';
    pledge_amount?: number;
    pledge_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    partnership_date?: string;
    total_giving?: number;
    zone?: Zone;
    is_member: boolean;
}

export interface ContactInfo {
    street_address?: string;
    suburb?: string;
    city?: string;
    postal_code?: string;
    country?: Country;
    phone_primary?: string;
    phone_secondary?: string;
    whatsapp?: string;
    email_secondary?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    unique_code?: string;
    profile_photo?: string;
    phone?: string;
    is_active: boolean;
    terms_accepted: boolean;
    completed_tour: boolean;
    is_first_time: boolean;

    zone_id?: number;
    zone?: Zone;
    home_group_id?: number;
    home_group?: HomeGroup;
    department_id?: number;
    department?: Department;

    pastor?: PastorProfile;
    member?: MemberProfile;
    partner?: PartnerProfile;
    contact?: ContactInfo;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export type EventType =
    | 'conference' | 'forum' | 'seminar' | 'youth_camp'
    | 'retreat' | 'special_service' | 'fundraiser' | 'other';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
    id: number;
    title: string;
    description?: string;
    type: EventType;
    status: EventStatus;
    starts_at: string;
    ends_at?: string;
    venue_name?: string;
    venue_address?: string;
    requires_registration: boolean;
    requires_payment: boolean;
    registration_fee: number;
    currency: string;
    capacity?: number;
    spots_remaining?: number;
    registration_open: boolean;
    registration_closes_at?: string;
    banner_image?: string;
    is_public: boolean;
    registration_count?: number;
    zone?: Zone;
    created_by?: { id: number; name: string };
    my_registration?: EventRegistration;
}

export interface EventRegistration {
    id: number;
    reference_number: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
    amount_due: number;
    amount_paid: number;
    balance_due: number;
    is_fully_paid: boolean;
    event?: { id: number; title: string };
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentType =
    | 'tithe' | 'offering' | 'family_altar'
    | 'partnership' | 'event_registration' | 'other';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'mobile_money' | 'online';

export interface Payment {
    id: number;
    reference: string;
    type: PaymentType;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method?: PaymentMethod;
    paid_at?: string;
    notes?: string;
    user?: { id: number; name: string };
    event_registration?: EventRegistration;
    recorded_by?: { id: number; name: string };
}

export interface PaymentSummary {
    total: number;
    tithes: number;
    offerings: number;
    family_altars: number;
    partnerships: number;
    event_payments: number;
    this_month: number;
    this_year: number;
}

export interface GivingSummary {
    total_giving: number;
    this_month: number;
    this_year: number;
    last_payment_at?: string;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        total_amount?: number;
    };
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    needs_terms_acceptance: boolean;
}

// ─── Zone summary for Pastor portal ──────────────────────────────────────────

export interface ZoneSummary {
    total_members: number;
    total_home_groups: number;
    total_departments: number;
    new_members_month: number;
}
