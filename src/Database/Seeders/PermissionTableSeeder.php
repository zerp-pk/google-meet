<?php

namespace Zerp\GoogleMeet\Database\Seeders;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Artisan;

class PermissionTableSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();
        Artisan::call('cache:clear');

        $permission = [                       
            // GoogleMeeting settings
            ['name' => 'manage-google-meet-settings', 'module' => 'google meet settings', 'label' => 'Manage Google Meet Settings'],
            ['name' => 'edit-google-meet-settings', 'module' => 'google meet settings', 'label' => 'Edit Google Meet Settings'],

            // GoogleMeeting management
            ['name' => 'manage-google-meets', 'module' => 'google-meets', 'label' => 'Manage Google Meetings'],
            ['name' => 'manage-any-google-meets', 'module' => 'google-meets', 'label' => 'Manage All Google Meetings'],
            ['name' => 'manage-own-google-meets', 'module' => 'google-meets', 'label' => 'Manage Own Google Meetings'],
            ['name' => 'view-google-meets', 'module' => 'google-meets', 'label' => 'View Google Meetings'],
            ['name' => 'create-google-meets', 'module' => 'google-meets', 'label' => 'Create Google Meetings'],
            ['name' => 'edit-google-meets', 'module' => 'google-meets', 'label' => 'Edit Google Meetings'],
            ['name' => 'delete-google-meets', 'module' => 'google-meets', 'label' => 'Delete Google Meetings'],
            ['name' => 'join-google-meets', 'module' => 'google-meets', 'label' => 'Join Google Meetings'],
            ['name' => 'start-google-meets', 'module' => 'google-meets', 'label' => 'Start Google Meetings'],
            ['name' => 'update-google-meet-status', 'module' => 'google-meets', 'label' => 'Update Google Meet Status'],
        ];

        $company_role = Role::where('name', 'company')->first();

        foreach ($permission as $perm) {
            $permission_obj = Permission::firstOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                [
                    'module' => $perm['module'],
                    'label' => $perm['label'],
                    'add_on' => 'GoogleMeet',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            if ($company_role && !$company_role->hasPermissionTo($permission_obj)) {
                $company_role->givePermissionTo($permission_obj);
            }
        }
    }
}