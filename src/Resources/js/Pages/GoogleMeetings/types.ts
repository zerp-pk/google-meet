import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface User {
    id: number;
    name: string;
}

export interface GoogleMeeting {
    id: number;
    title: string;
    description?: string;
    event_id?: string;
    start_url?: string;
    join_url?: string;
    start_time: any;
    duration: number;
    status: string;
    participants?: string[];
    host_id?: number;
    host?: User;
    created_at: string;
}

export interface CreateGoogleMeetingFormData {
    title: string;
    description: string;
    start_time: any;
    duration: string;
    status: string;
    participants: string[];
    host_id: string;
    sync_to_google_calendar: boolean;
}

export interface EditGoogleMeetingFormData {
    title: string;
    description: string;
    start_time: any;
    duration: string;
    status: string;
    participants: string[];
    host_id: string;
}

export interface GoogleMeetingFilters {
    title: string;
    description: string;
    status: string;
    date_range: string;
}

export type PaginatedGoogleMeetings = PaginatedData<GoogleMeeting>;
export type GoogleMeetingModalState = ModalState<GoogleMeeting>;

export interface GoogleMeetingsIndexProps {
    googlemeetings: PaginatedGoogleMeetings;
    auth: AuthContext;
    users: any[];
    [key: string]: unknown;
}

export interface CreateGoogleMeetingProps {
    onSuccess: () => void;
}

export interface EditGoogleMeetingProps {
    googlemeeting: GoogleMeeting;
    onSuccess: () => void;
}

export interface GoogleMeetingShowProps {
    googlemeeting: GoogleMeeting;
    [key: string]: unknown;
}
