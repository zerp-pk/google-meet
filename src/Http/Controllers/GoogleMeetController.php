<?php

namespace Zerp\GoogleMeet\Http\Controllers;

use Zerp\GoogleMeet\Models\GoogleMeeting;
use Zerp\GoogleMeet\Http\Requests\StoreGoogleMeetingRequest;
use Zerp\GoogleMeet\Http\Requests\UpdateGoogleMeetingRequest;
use Zerp\GoogleMeet\Services\GoogleMeetService;
use Zerp\GoogleMeet\Events\CreateGoogleMeeting;
use Zerp\GoogleMeet\Events\UpdateGoogleMeeting;
use Zerp\GoogleMeet\Events\DestroyGoogleMeeting;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;

class GoogleMeetController extends Controller
{
    public function index()
    {
        if(Auth::user()->can('manage-google-meets')){
            $googlemeetings = GoogleMeeting::query()
                ->with(['host'])
                ->where(function($q) {
                    if(Auth::user()->can('manage-any-google-meets')) {
                        $q->where('created_by', creatorId());
                    } elseif(Auth::user()->can('manage-own-google-meets')) {
                        $q->where(function($query) {
                            $query->where('creator_id', Auth::id())
                                  ->orWhere('host_id', Auth::id())
                                  ->orWhereJsonContains('participants', (string)Auth::id());
                        });
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when(request('title'), function($q) {
                    $q->where(function($query) {
                    $query->where('title', 'like', '%' . request('title') . '%');
                    $query->orWhere('event_id', 'like', '%' . request('title') . '%');
                    });
                })
                ->when(request('status') !== null && request('status') !== '', fn($q) => $q->where('status', request('status')))
                ->when(request('date_range'), function($q) {
                    $dateRange = request('date_range');
                    if (strpos($dateRange, ' - ') !== false) {
                        [$startDate, $endDate] = explode(' - ', $dateRange);
                        $q->whereDate('start_time', '>=', trim($startDate))
                          ->whereDate('start_time', '<=', trim($endDate));
                    } else {
                        $q->whereDate('start_time', $dateRange);
                    }
                })
                ->when(request('sort'), fn($q) => $q->orderBy(request('sort'), request('direction', 'asc')), fn($q) => $q->latest())
                ->paginate(request('per_page', 10))
                ->withQueryString();



            return Inertia::render('GoogleMeet/GoogleMeetings/Index', [
                'googlemeetings' => $googlemeetings,
                'users' => User::where('created_by', creatorId())->select('id', 'name', 'avatar')->get(),
            ]);
        }
        else{
            return back()->with('error', __('Permission denied'));
        }
    }

    public function store(StoreGoogleMeetingRequest $request)
    {
        if(Auth::user()->can('create-google-meets')){
            if (company_setting('google_meet_enabled') !== 'on') {
                return redirect()->back()->with('error', __('Google Meet integration is disabled'));
            }

            $validated = $request->validated();

            try {
                // Create meeting via Google Calendar API
                $googleMeetService = new GoogleMeetService();
                $googleResponse = $googleMeetService->createMeeting($validated);

                $googlemeeting = new GoogleMeeting();
                $googlemeeting->title = $validated['title'];
                $googlemeeting->description = $validated['description'];
                $googlemeeting->event_id = $googleResponse['id'];
                $googlemeeting->start_url = $googleResponse['start_url'] ?? null;
                $googlemeeting->join_url = $googleResponse['join_url'] ?? null;
                $googlemeeting->start_time = $validated['start_time'];
                $googlemeeting->duration = $validated['duration'];
                $googlemeeting->status = $validated['status'];
                $googlemeeting->participants = $validated['participants'];
                $googlemeeting->host_id = $validated['host_id'];
                $googlemeeting->creator_id = Auth::id();
                $googlemeeting->created_by = creatorId();
                $googlemeeting->save();

                // Dispatch event for packages to handle their fields
                CreateGoogleMeeting::dispatch($request, $googlemeeting);

                return redirect()->route('googlemeet.google-meets.index')->with('success', __('The Google Meet meeting has been created successfully.'));
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage());
            }
        }
        else{
            return redirect()->route('googlemeet.google-meets.index')->with('error', __('Permission denied'));
        }
    }

    public function update(UpdateGoogleMeetingRequest $request, GoogleMeeting $googlemeeting)
    {
        if(Auth::user()->can('edit-google-meets') && $googlemeeting->status === 'Scheduled'){
            if (company_setting('google_meet_enabled') !== 'on') {
                return redirect()->back()->with('error', __('Google Meet integration is disabled'));
            }

            $validated = $request->validated();

            try {
                // Update meeting via Google Calendar API if event_id exists
                if ($googlemeeting->event_id) {
                    $googleMeetService = new GoogleMeetService();
                    $googleResponse = $googleMeetService->updateMeeting($googlemeeting->event_id, $validated);

                    // Update URLs if returned from API
                    if (isset($googleResponse['start_url'])) {
                        $googlemeeting->start_url = $googleResponse['start_url'];
                    }
                    if (isset($googleResponse['join_url'])) {
                        $googlemeeting->join_url = $googleResponse['join_url'];
                    }
                }

                $googlemeeting->title = $validated['title'];
                $googlemeeting->description = $validated['description'];
                $googlemeeting->start_time = $validated['start_time'];
                $googlemeeting->duration = $validated['duration'];
                $googlemeeting->participants = $validated['participants'];
                $googlemeeting->host_id = $validated['host_id'];
                $googlemeeting->save();

                // Dispatch event for packages to handle their fields
                UpdateGoogleMeeting::dispatch($request, $googlemeeting);

                return redirect()->back()->with('success', __('The Google Meet meeting details are updated successfully.'));
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage());
            }
        }
        else{
            return redirect()->route('googlemeet.google-meets.index')->with('error', __('Permission denied'));
        }
    }

    public function destroy(GoogleMeeting $googlemeeting)
    {
        if(Auth::user()->can('delete-google-meets')){
            try {

                // Delete meeting via Google Calendar API if event_id exists and integration is enabled
                if ($googlemeeting->event_id && company_setting('google_meet_enabled') === 'on') {
                    $googleMeetService = new GoogleMeetService();
                    $googleMeetService->deleteMeeting($googlemeeting->event_id);
                }


                // Dispatch event for packages to handle their fields
                DestroyGoogleMeeting::dispatch($googlemeeting);

                $googlemeeting->delete();
                return redirect()->back()->with('success', __('The Google Meet meeting has been deleted.'));
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage());
            }
        }
        else{
            return redirect()->route('googlemeet.google-meets.index')->with('error', __('Permission denied'));
        }
    }



    public function updateStatus(GoogleMeeting $googlemeeting)
    {
        if(Auth::user()->can('update-google-meet-status')){
            $status = request('status');

            if (!in_array($status, ['Scheduled', 'Started', 'Ended', 'Cancelled'])) {
                return redirect()->back()->with('error', __('Invalid status'));
            }

            $googlemeeting->status = $status;
            $googlemeeting->save();

            return redirect()->back()->with('success', __('Status updated successfully'));
        }
        else{
            return redirect()->back()->with('error', __('Permission denied'));
        }
    }


}
