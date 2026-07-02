<?php

namespace Zerp\GoogleMeet\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class GoogleMeeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'event_id',
        'start_url',
        'join_url',
        'start_time',
        'duration',
        'status',
        'participants',
        'host_id',
        'creator_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'participants' => 'array'
        ];
    }

    // Accessor for consistent relationship display
    public function getNameAttribute()
    {
        return $this->title;
    }

    public function host()
    {
        return $this->belongsTo(User::class);
    }
}
