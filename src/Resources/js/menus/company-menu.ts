import { Video } from 'lucide-react';

declare global {
    function route(name: string): string;
}

export const googlemeetCompanyMenu = (t: (key: string) => string) => [
    {
        title: t('Google Meetings'),
        icon: Video,
        permission: 'manage-google-meets',
        href: route('googlemeet.google-meets.index'),
        order: 950        
    },
];