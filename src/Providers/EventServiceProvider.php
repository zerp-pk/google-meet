<?php

namespace Zerp\GoogleMeet\Providers;

use App\Events\GivePermissionToRole;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Zerp\GoogleMeet\Listeners\GiveRoleToPermission;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Add your event listeners here
        GivePermissionToRole::class => [
            GiveRoleToPermission::class,
        ],
    ];
}