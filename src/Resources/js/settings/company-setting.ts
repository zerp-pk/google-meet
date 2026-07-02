import { Video } from 'lucide-react';

export interface SettingMenuItem {
  order: number;
  title: string;
  href: string;
  icon: any;
  permission: string;
  component: string;
}

export const getGoogleMeetingCompanySettings = (t: (key: string) => string): SettingMenuItem[] => [
  {
    order: 650,
    title: t('Google Meet Settings'),
    href: '#google-meet-settings',
    icon: Video,
    permission: 'manage-google-meet-settings',
    component: 'google-meet-settings'
  }
];