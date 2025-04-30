<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Doctor extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [
        'working_days' => 'array'
    ];

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'contact_number',
        'email',
        'registration_number',
        'specialization',
        'experience',
        'consultation_fees',
        'clinic_name',
        'clinic_address',
        'clinic_city',
        'clinic_state',
        'clinic_postal_code',
        'clinic_country',
        'telemedicine_support',
        'availability',
        'profile_photo' , // Add this line
        'clinic_opening_time',
        'clinic_closing_time',
        'working_days'
    ];

    protected $appends = ['profile_photo_url'];  // Add this line

    // Relationship with User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with Appointments
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'doctor_id', 'user_id');
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class, 'doctor_id', 'user_id');
    }

    // Get full name attribute
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Get full clinic address attribute
    public function getFullClinicAddressAttribute()
    {
        return "{$this->clinic_address}, {$this->clinic_city}, {$this->clinic_state} {$this->clinic_postal_code}, {$this->clinic_country}";
    }

    // Add this method to get the photo URL
    // Uncomment and update the profile photo URL method
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo) {
            return Storage::url($this->profile_photo);
        }
        return null;
    }
}