<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminder extends Notification
{
    use Queueable;

    protected $appointment;

    public function __construct($appointment)
    {
        $this->appointment = $appointment;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Appointment Reminder')
            ->greeting('Hello ' . $notifiable->first_name . ',')
            ->line('This is a reminder for your upcoming appointment with Dr. ' . $this->appointment->doctor->first_name . ' ' . $this->appointment->doctor->last_name . '.')
            ->line('Date: ' . $this->appointment->appointment_date)
            ->line('Time: ' . $this->appointment->start_time . ' - ' . $this->appointment->end_time)
            ->action('View Appointment', url('/patient/appointments'))
            ->line('Thank you for using MedAssist!');
    }
}
