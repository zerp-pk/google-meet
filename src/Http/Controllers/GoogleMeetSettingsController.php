<?php

namespace Zerp\GoogleMeet\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class GoogleMeetSettingsController extends Controller
{
    public function update(Request $request)
    {
        if (Auth::user()->can('edit-google-meet-settings')) {

            $rules = [
                'settings.google_meet_enabled' => 'nullable|string|in:on,off',
            ];

            if ($request->input('settings.google_meet_enabled') === 'on') {
                $rules['settings.google_client_id'] = 'required|string|max:255';
                $rules['settings.google_client_secret'] = 'required|string|max:255';
                $rules['settings.google_refresh_token'] = 'required|string|max:1000';
            } else {
                $rules['settings.google_client_id'] = 'nullable|string|max:255';
                $rules['settings.google_client_secret'] = 'nullable|string|max:255';
                $rules['settings.google_refresh_token'] = 'nullable|string|max:1000';
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->with('error', __('Validation failed'));
            }

            $allowedSettings = [
                'google_client_id',
                'google_client_secret',
                'google_refresh_token',
                'google_meet_enabled',
            ];

            $settings = $request->input('settings', []);
            try {
                foreach ($settings as $key => $value) {
                    if (in_array($key, $allowedSettings)) {
                        setSetting($key, $value, creatorId(), false);
                    }
                }

                return redirect()->back()->with('success', __('Google Meet settings saved successfully.'));
            } catch (\Exception $e) {
                return redirect()->back()->with('error', __('Failed to update Google Meet settings: ') . $e->getMessage());
            }

        } else {
            return redirect()->back()->with('error', __('Permission denied'));
        }
    }
}
