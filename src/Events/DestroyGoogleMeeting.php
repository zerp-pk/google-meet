<?php

namespace Zerp\GoogleMeet\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Zerp\GoogleMeet\Models\GoogleMeeting;

class DestroyGoogleMeeting
{
    use Dispatchable;

    public function __construct(
        public GoogleMeeting $meeting,
    ) {}
}