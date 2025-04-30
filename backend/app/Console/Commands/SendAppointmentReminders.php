<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';
    protected $description = 'Send appointment reminders to patients';

    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->toDateString();
        $appointments = Appointment::with(['patient'])
            ->where('appointment_date', $tomorrow)
            ->where('appointment_status', 'scheduled')
            ->get();

        foreach ($appointments as $appointment) {
            Notification::send($appointment->patient, new AppointmentReminder($appointment));
            $this->info("Reminder sent for appointment ID: {$appointment->id}");
        }

        $this->info('Appointment reminders sent successfully.');
    }       
}
