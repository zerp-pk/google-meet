import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateTimeRangePicker } from '@/components/ui/datetime-range-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelectEnhanced } from '@/components/ui/multi-select-enhanced';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateGoogleMeetingProps, CreateGoogleMeetingFormData } from './types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormFields } from '@/hooks/useFormFields';

export default function Create({ onSuccess }: CreateGoogleMeetingProps) {
    const { users } = usePage<any>().props;

    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm<CreateGoogleMeetingFormData>({
        title: '',
        description: '',
        start_time: '',
        duration: '',
        status: 'Scheduled',
        participants: [] as string[],
        host_id: '',
        sync_to_google_calendar: false,
    });
    
    const calendarFields = useFormFields('createCalendarSyncField', data, setData, errors, 'create', t, 'GoogleMeet');



    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('googlemeet.google-meets.store'), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="transform-gpu">
            <DialogHeader>
                <DialogTitle>{t('Create Google Meet')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="title">{t('Title')}</Label>
                    <Input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder={t('Enter Title')}
                        required
                    />
                    <InputError message={errors.title} />
                </div>
                
                <div>
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder={t('Enter Description')}
                        rows={3}
                    />
                    <InputError message={errors.description} />
                </div>
                

                <div>
                    <Label required>{t('Start Time')}</Label>
                    <DateTimeRangePicker
                        value={data.start_time}
                        onChange={(value) => setData('start_time', value)}
                        placeholder={t('Select Start Time')}
                        mode="single"
                    />
                    <InputError message={errors.start_time} />
                </div>
                
                <div>
                    <Label htmlFor="duration">{t('Duration')}</Label>
                    <Input
                        id="duration"
                        type="number"
                        step="1"
                        min="0"
                        value={data.duration}
                        onChange={(e) => setData('duration', e.target.value)}
                        placeholder="0"
                        required
                    />
                    <InputError message={errors.duration} />
                </div>
                
                <div>
                    <Label required>{t('Status')}</Label>
                    <RadioGroup value={data.status || 'Scheduled'} onValueChange={(value) => setData('status', value)} className="flex gap-6 mt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Scheduled" id="status_scheduled" />
                            <Label htmlFor="status_scheduled" className="cursor-pointer">{t('Scheduled')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Started" id="status_started" />
                            <Label htmlFor="status_started" className="cursor-pointer">{t('Started')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Ended" id="status_ended" />
                            <Label htmlFor="status_ended" className="cursor-pointer">{t('Ended')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Cancelled" id="status_cancelled" />
                            <Label htmlFor="status_cancelled" className="cursor-pointer">{t('Cancelled')}</Label>
                        </div>
                    </RadioGroup>
                    <InputError message={errors.status} />
                </div>
                
                <div>
                    <Label>{t('Participants')}</Label>
                    <MultiSelectEnhanced
                        options={users?.map((item: any) => ({ value: item.id.toString(), label: item.name })) || []}
                        value={data.participants}
                        onValueChange={(value) => setData('participants', value)}
                        placeholder={t('Select Participants...')}
                        searchable={true}
                    />
                    <InputError message={errors.participants} />
                </div>
                
                <div>
                    <Label htmlFor="host_id">{t('Host')}</Label>
                    <Select value={data.host_id?.toString() || ''} onValueChange={(value) => setData('host_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('Select Host')} />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((item: any) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.host_id} />
                </div>
                
                {/* Calendar Sync Field */}
                {calendarFields.map((field) => (
                    <div key={field.id}>
                        {field.component}
                    </div>
                ))}
                
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                        {t('Cancel')}
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? t('Creating...') : t('Create')}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}