<?php

namespace Zerp\GoogleMeet\Tests;

use Orchestra\Testbench\TestCase as Orchestra;
use Zerp\GoogleMeet\Providers\GoogleMeetServiceProvider;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [GoogleMeetServiceProvider::class];
    }
}
