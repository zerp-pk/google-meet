<?php

namespace Zerp\GoogleMeet\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoogleMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|max:100',
            'description' => 'nullable',
            'start_time' => 'required',
            'duration' => 'required|integer|min:15|max:480',
            'participants' => 'nullable|array',
            'host_id' => 'nullable|exists:users,id'
        ];
    }
}