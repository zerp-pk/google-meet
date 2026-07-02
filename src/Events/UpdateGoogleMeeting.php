<?php

namespace Zerp\GoogleMeet\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Queue\SerializesModels;
use Zerp\GoogleMeet\Models\GoogleMeeting;

class UpdateGoogleMeeting
{
    use Dispatchable;

    public function __construct(
        public Request $request,
        public GoogleMeeting $meeting
    ) {}
}