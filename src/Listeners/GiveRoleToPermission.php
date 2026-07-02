<?php

namespace Zerp\GoogleMeet\Listeners;

use App\Events\GivePermissionToRole;
use Zerp\GoogleMeet\Helpers\GoogleMeetUtility;

class GiveRoleToPermission
{
    public function __construct()
    {
        //
    }

    public function handle(GivePermissionToRole $event)
    {
        $role_id = $event->role_id;
        $rolename = $event->rolename;
        $user_module = $event->user_module ? explode(',', $event->user_module) : [];
        if (!empty($user_module)) {
            if (in_array("GoogleMeet", $user_module)) {
                GoogleMeetUtility::GivePermissionToRoles($role_id, $rolename);
            }
        }
    }
}