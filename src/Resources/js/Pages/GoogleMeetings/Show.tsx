import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Users, Play, X } from 'lucide-react';
import { formatDateTime, getImagePath } from '@/utils/helpers';
import { GoogleMeeting } from './types';
import { toast } from 'sonner';

interface ShowModalProps {
    isOpen: boolean;
    onClose: () => void;
    googlemeeting: GoogleMeeting;
    users: Array<{id: number; name: string}>;
}

export default function Show({ isOpen, onClose, googlemeeting, users }: ShowModalProps) {
    const { t } = useTranslation();
    const { auth } = usePage().props as any;

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t('Meeting URL copied to clipboard'));
    };

    const getParticipantNames = () => {
        if (!googlemeeting.participants) return [];
        let items = [];
        if (typeof googlemeeting.participants === 'string') {
            try {
                items = JSON.parse(googlemeeting.participants);
            } catch {
                items = [googlemeeting.participants];
            }
        } else if (Array.isArray(googlemeeting.participants)) {
            items = googlemeeting.participants;
        }
        return items.map((item: any) => {
            const user = users.find((u: any) => u.id.toString() === item?.toString());
            return user?.name || item;
        });
    };

    const statusColors = {
        "Scheduled": "bg-blue-100 text-blue-800",
        "Started": "bg-green-100 text-green-800",
        "Ended": "bg-gray-100 text-gray-800",
        "Cancelled": "bg-red-100 text-red-800"
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl transform-gpu">
                <DialogHeader>
                    <DialogTitle>{t('Meeting Details')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('Title')}</label>
                            <p className="mt-1 text-sm text-gray-900">{googlemeeting.title}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('Event ID')}</label>
                            <p className="mt-1 text-sm text-gray-900">{googlemeeting.event_id || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('Start Time')}</label>
                            <p className="mt-1 text-sm text-gray-900">{googlemeeting.start_time ? formatDateTime(googlemeeting.start_time) : '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('Duration')}</label>
                            <p className="mt-1 text-sm text-gray-900">{googlemeeting.duration ? `${googlemeeting.duration} minutes` : '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('Status')}</label>
                            <div className="mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[googlemeeting.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {googlemeeting.status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">{t('Host')}</label>
                            {googlemeeting.host?.name ? (
                                <div className="mt-1 flex items-center gap-2">
                                    <img
                                        src={getImagePath(googlemeeting.host?.avatar || '')}
                                        alt={googlemeeting.host.name}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                    />
                                    <span className="text-sm text-gray-900">{googlemeeting.host.name}</span>
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-gray-900">-</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">{t('Description')}</label>
                        <p className="mt-1 text-sm text-gray-900">{googlemeeting.description || '-'}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">{t('Participants')}</label>
                        <div className="mt-1">
                            {(() => {
                                if (!googlemeeting.participants) return <span className="text-sm text-gray-500">-</span>;
                                let items = [];
                                if (typeof googlemeeting.participants === 'string') {
                                    try {
                                        items = JSON.parse(googlemeeting.participants);
                                    } catch {
                                        items = [googlemeeting.participants];
                                    }
                                } else if (Array.isArray(googlemeeting.participants)) {
                                    items = googlemeeting.participants;
                                }
                                if (items.length === 0) return <span className="text-sm text-gray-500">-</span>;
                                return (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <TooltipProvider>
                                            {items.map((item: any, index: number) => {
                                                const modelItem = users.find((u: any) => u.id.toString() === item?.toString());
                                                const userName = modelItem?.name || item;
                                                return (
                                                    <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                                          <img
                                                                src={getImagePath(modelItem?.avatar || '')}
                                                                alt={userName}
                                                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                                            />
                                                        <span className="text-sm font-medium text-gray-700">{userName}</span>
                                                    </div>
                                                );
                                            })}
                                        </TooltipProvider>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {googlemeeting.event_id && ['Scheduled', 'Started'].includes(googlemeeting.status) && (
                        <div className="border-t pt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-4">{t('Meeting Links')}</h4>
                            <div className="space-y-3">
                                {auth.user?.permissions?.includes('join-google-meets') && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 w-20">{t('Join URL')}:</span>
                                        <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">
                                            {googlemeeting.join_url}
                                        </code>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(googlemeeting.join_url, 'join')}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('Copy Join URL')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                                {auth.user?.permissions?.includes('start-google-meets') && (googlemeeting.host_id === auth.user?.id || auth.user?.type === 'company') && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 w-20">{t('Start URL')}:</span>
                                        <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">
                                            {googlemeeting.start_url}
                                        </code>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(googlemeeting.start_url, 'start')}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('Copy Start URL')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <TooltipProvider>
                            {googlemeeting.event_id && ['Scheduled', 'Started'].includes(googlemeeting.status) && auth.user?.permissions?.includes('join-google-meets') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(googlemeeting.join_url, '_blank')}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            {t('Join Meeting')}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('Join Meeting')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {googlemeeting.event_id && ['Scheduled', 'Started'].includes(googlemeeting.status) && auth.user?.permissions?.includes('start-google-meets') && (googlemeeting.host_id === auth.user?.id || auth.user?.type === 'company') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => window.open(googlemeeting.start_url, '_blank')}
                                            className="text-white bg-green-600 hover:bg-green-700"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            {t('Start Meeting')}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('Start Meeting')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </TooltipProvider>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}