<?php

namespace App\Http\Controllers;
use App\Models\Appointment;
use App\Models\Availability;
use App\Models\Doctor;
use App\Notifications\AppointmentConfirmed;
use App\Notifications\AppointmentReminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // Patient: View available doctors and their slots
    public function getAvailableDoctors(Request $request)
    {
        try {
            $query = Doctor::with(['user', 'availabilities' => function ($q) {
                $q->where('is_booked', false)
                  ->where('date', '>=', Carbon::today());
            }]);

            if ($request->has('specialization')) {
                $query->where('specialization', $request->specialization);
            }

            if ($request->has('city')) {
                $query->where('clinic_city', $request->city);
            }

            $doctors = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $doctors,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctors',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Patient: Request an appointment
    public function requestAppointment(Request $request)
    {
        try {
            if (auth()->user()->role !== 'patient') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'doctor_id' => 'required|exists:users,id',
                'availability_id' => 'required|exists:availabilities,id',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $availability = Availability::findOrFail($request->availability_id);
            if ($availability->is_booked || $availability->date < Carbon::today()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Selected time slot is unavailable',
                ], 400);
            }

            DB::beginTransaction();

            $appointment = Appointment::create([
                'doctor_id' => $request->doctor_id,
                'patient_id' => auth()->id(),
                'availability_id' => $request->availability_id,
                'appointment_date' => $availability->date,
                'start_time' => $availability->start_time,
                'end_time' => $availability->end_time,
                'request_status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Mark the slot as booked temporarily
            $availability->update(['is_booked' => true]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment request submitted successfully',
                'data' => $appointment,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to request appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Doctor: View pending appointment requests
    public function getPendingRequests(Request $request)
    {
        try {
            if (auth()->user()->role !== 'doctor') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $appointments = Appointment::with(['patient.user', 'availability'])
                ->where('doctor_id', auth()->id())
                ->where('request_status', 'pending')
                ->latest()
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $appointments,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pending requests',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Doctor: Accept or reject appointment request
    public function manageRequest(Request $request, $id)
    {
        try {
            if (auth()->user()->role !== 'doctor') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'action' => 'required|in:accept,reject',
                'start_time' => 'required_if:action,accept|date_format:H:i',
                'end_time' => 'required_if:action,accept|date_format:H:i|after:start_time',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $appointment = Appointment::where('doctor_id', auth()->id())->findOrFail($id);

            if ($appointment->request_status !== 'pending') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Request is no longer pending',
                ], 400);
            }

            DB::beginTransaction();

            if ($request->action === 'accept') {
                $appointment->update([
                    'request_status' => 'accepted',
                    'appointment_status' => 'scheduled',
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                ]);

                // Send email notification to patient
                $patient = $appointment->patient;
                Notification::send($patient, new AppointmentConfirmed($appointment));
            } else {
                $appointment->update(['request_status' => 'rejected']);
                $appointment->availability->update(['is_booked' => false]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Appointment request {$request->action}ed successfully",
                'data' => $appointment,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to manage request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Patient: View their appointment schedule
    public function getPatientAppointments(Request $request)
    {
        try {
            if (auth()->user()->role !== 'patient') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $appointments = Appointment::with(['doctor.user', 'availability'])
                ->where('patient_id', auth()->id())
                ->latest()
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $appointments,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch appointments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Cancel an appointment (for patients or doctors)
    public function cancelAppointment($id)
    {
        try {
            $appointment = Appointment::where(function ($query) {
                $query->where('patient_id', auth()->id())
                      ->orWhere('doctor_id', auth()->id());
            })->findOrFail($id);

            if ($appointment->appointment_status === 'cancelled') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Appointment is already cancelled',
                ], 400);
            }

            DB::beginTransaction();

            $appointment->update(['appointment_status' => 'cancelled']);
            if ($appointment->availability) {
                $appointment->availability->update(['is_booked' => false]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment cancelled successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
