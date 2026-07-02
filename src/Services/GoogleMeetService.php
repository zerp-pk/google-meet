<?php

namespace Zerp\GoogleMeet\Services;

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventDateTime;
use Google\Service\Calendar\ConferenceData;
use Google\Service\Calendar\CreateConferenceRequest;
use Google\Service\Calendar\ConferenceSolutionKey;

class GoogleMeetService
{
    private Client $client;

    public function __construct()
    {
        $clientId = company_setting('google_client_id');
        $clientSecret = company_setting('google_client_secret');
        $refreshToken = company_setting('google_refresh_token');

        if (!$clientId || !$clientSecret || !$refreshToken) {
            throw new \Exception('Google Meet credentials not configured');
        }

        $this->client = new Client();
        $this->client->setClientId($clientId);
        $this->client->setClientSecret($clientSecret);
        $this->client->refreshToken($refreshToken);
        $this->client->addScope(Calendar::CALENDAR_EVENTS);
    }

    private function calendarService(): Calendar
    {
        return new Calendar($this->client);
    }

    public function createMeeting(array $data): array
    {
        try {
            $service = $this->calendarService();

            $start = new EventDateTime();
            $start->setDateTime(date('c', strtotime($data['start_time'])));

            $end = new EventDateTime();
            $end->setDateTime(date('c', strtotime($data['start_time']) + ((int) $data['duration'] * 60)));

            $event = new Event([
                'summary' => $data['title'],
                'description' => $data['description'] ?? '',
                'start' => $start,
                'end' => $end,
            ]);

            $conferenceSolutionKey = new ConferenceSolutionKey(['type' => 'hangoutsMeet']);
            $createConferenceRequest = new CreateConferenceRequest([
                'requestId' => uniqid('meet-', true),
                'conferenceSolutionKey' => $conferenceSolutionKey,
            ]);
            $conferenceData = new ConferenceData();
            $conferenceData->setCreateRequest($createConferenceRequest);
            $event->setConferenceData($conferenceData);

            $created = $service->events->insert('primary', $event, ['conferenceDataVersion' => 1]);

            $meetLink = $created->getHangoutLink();

            return [
                'id' => $created->getId(),
                'start_url' => $meetLink,
                'join_url' => $meetLink,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to create Google Meet meeting: ' . $e->getMessage());
        }
    }

    public function updateMeeting(string $eventId, array $data): array
    {
        try {
            $service = $this->calendarService();
            $event = $service->events->get('primary', $eventId);

            $event->setSummary($data['title']);
            $event->setDescription($data['description'] ?? '');

            $start = new EventDateTime();
            $start->setDateTime(date('c', strtotime($data['start_time'])));
            $event->setStart($start);

            $end = new EventDateTime();
            $end->setDateTime(date('c', strtotime($data['start_time']) + ((int) $data['duration'] * 60)));
            $event->setEnd($end);

            $updated = $service->events->update('primary', $eventId, $event, ['conferenceDataVersion' => 1]);

            $meetLink = $updated->getHangoutLink();

            return [
                'start_url' => $meetLink,
                'join_url' => $meetLink,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to update Google Meet meeting: ' . $e->getMessage());
        }
    }

    public function deleteMeeting(string $eventId): bool
    {
        try {
            $this->calendarService()->events->delete('primary', $eventId);
            return true;
        } catch (\Exception $e) {
            throw new \Exception('Failed to delete Google Meet meeting: ' . $e->getMessage());
        }
    }

    public function getMeeting(string $eventId): array
    {
        try {
            $event = $this->calendarService()->events->get('primary', $eventId);
            $meetLink = $event->getHangoutLink();

            return [
                'id' => $event->getId(),
                'start_url' => $meetLink,
                'join_url' => $meetLink,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to get Google Meet meeting: ' . $e->getMessage());
        }
    }

    public function getStartUrl(string $eventId): string
    {
        try {
            $meeting = $this->getMeeting($eventId);
            return $meeting['start_url'] ?? '';
        } catch (\Exception $e) {
            return '';
        }
    }
}
