<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Patient extends Model
{
    use SoftDeletes,HasFactory;

    protected $table = 'patient';

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'contact_number',
        'email',
        'blood_group',
        'allergies',
        'current_medication',
        'previous_surgeries',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        'role',
        'profile_photo',
        'medical_conditions' => 'string',
        'date_of_birth' => 'date',
        'email_verified_at' => 'datetime'
    ];
    protected $appends = ['profile_photo_url'];  // Add this line


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'user_id');
    }

    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo) {
            return Storage::url($this->profile_photo);
        }
        return null;
    }
}