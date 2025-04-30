<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Availability extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'doctor_id',
        'date',
        'start_time',
        'end_time',
        'is_booked'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'string',  // Changed from datetime:H:i to string
        'end_time' => 'string',    // Changed from datetime:H:i to string
        'is_booked' => 'boolean'
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'user_id');  // Updated relationship
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
