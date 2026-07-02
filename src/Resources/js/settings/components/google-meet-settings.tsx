import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { Switch } from '@/components/ui/switch';

interface GoogleMeetingSettingsProps {
  userSettings?: Record<string, string>;
  auth?: any;
}

export default function GoogleMeetingSettings({ userSettings = {}, auth }: GoogleMeetingSettingsProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const canEdit = auth?.user?.permissions?.includes('edit-google-meet-settings');

  const [settings, setSettings] = useState({
    google_meet_enabled: userSettings?.google_meet_enabled === 'on',
    google_client_id: userSettings?.google_client_id || '',
    google_client_secret: userSettings?.google_client_secret || '',
    google_refresh_token: userSettings?.google_refresh_token || ''
  });

  useEffect(() => {
    setSettings({
      google_meet_enabled: userSettings?.google_meet_enabled === 'on',
      google_client_id: userSettings?.google_client_id || '',
      google_client_secret: userSettings?.google_client_secret || '',
      google_refresh_token: userSettings?.google_refresh_token || ''
    });
  }, [userSettings]);

  const handleSettingsChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = () => {
    setIsLoading(true);

    router.post(route('google-meet.settings.update'), {
      settings: {
        ...settings,
        google_meet_enabled: settings.google_meet_enabled ? 'on' : 'off'
      }
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="order-1 rtl:order-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="h-5 w-5" />
            {t('Google Meet Settings')}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t('Configure Google Meet integration and API settings')}
          </p>
        </div>
        {canEdit && (
          <Button className="order-2 rtl:order-1" onClick={saveSettings} disabled={isLoading} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? t('Saving...') : t('Save Changes')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Enable/Disable Google Meet */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="google_meet_enabled" className="text-base font-medium">
                {t('Enable Google Meet Integration')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('Allow meetings to be created via Google Calendar / Google Meet')}
              </p>
            </div>
            <Switch
              id="google_meet_enabled"
              checked={settings.google_meet_enabled}
              onCheckedChange={(checked) => handleSettingsChange('google_meet_enabled', checked)}
              disabled={!canEdit}
            />
          </div>

          {settings.google_meet_enabled && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="google_client_id">{t('Client ID')}</Label>
                    <Input
                      id="google_client_id"
                      value={settings.google_client_id}
                      onChange={(e) => handleSettingsChange('google_client_id', e.target.value)}
                      placeholder={t('Enter Google OAuth Client ID')}
                      disabled={!canEdit}
                      type="password"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="google_client_secret">{t('Client Secret')}</Label>
                    <Input
                      id="google_client_secret"
                      value={settings.google_client_secret}
                      onChange={(e) => handleSettingsChange('google_client_secret', e.target.value)}
                      placeholder={t('Enter Google OAuth Client Secret')}
                      disabled={!canEdit}
                      type="password"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="google_refresh_token">{t('Refresh Token')}</Label>
                    <Input
                      id="google_refresh_token"
                      value={settings.google_refresh_token}
                      onChange={(e) => handleSettingsChange('google_refresh_token', e.target.value)}
                      placeholder={t('Enter Google OAuth Refresh Token')}
                      disabled={!canEdit}
                      type="password"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50/50 border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-900">{t('Setup Instructions')}</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>{t('1. Go to')} <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{t('Google Cloud Console')}</a> {t('and create an OAuth 2.0 Client ID')}</p>
                    <p>{t('2. Enable the Google Calendar API for your project')}</p>
                    <p>{t('3. Complete the OAuth consent flow once to obtain a refresh token with the calendar.events scope')}</p>
                    <p>{t('4. Paste the Client ID, Client Secret, and Refresh Token above and enable the integration')}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
