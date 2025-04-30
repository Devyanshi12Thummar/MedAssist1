<?php


namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
use App\Notifications\CustomResetPassword;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable,CanResetPassword;

    protected $fillable = [
        'email',
        'password',
        'role',
        'email_verified_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

//     public function sendPasswordResetNotification($token)
// {
//     $url = "http://localhost:3000/reset-password/{$token}?email={$this->email}";
//     $this->notify(new CustomResetPassword($url));
// }

// public function sendPasswordResetNotification($token, $url)
// {
//     $this->notify(new ResetPasswordNotification($token, $url));
// }

public function sendPasswordResetNotification($token)
{
    $url = 'http://localhost:5173/reset-password/' . $token . '?email=' . urlencode($this->email);
    $this->notify(new ResetPasswordNotification($token, $url));
}




    public function patient(): HasOne
    {
        return $this->hasOne(Patient::class);
    }

    public function doctor(): HasOne
    {
        return $this->hasOne(Doctor::class);
    }
}