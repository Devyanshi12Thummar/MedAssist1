<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Availability;
use App\Jobs\ProcessProfileImage; // Add this import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon; // Add this import

class DoctorController extends Controller
{
    public function index()
    {
        try {
            $doctors = Doctor::with('user')->latest()->paginate(10);
            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $doctor = Doctor::with('user')->findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $doctor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            DB::beginTransaction();
            
            $doctor = Doctor::findOrFail($id);
            $updateData = $request->except(['profile_photo', 'medical_license', 'degree_certificate', 'id_proof']);
    
            // Handle clinic hours and working days
            if ($request->has('clinic_opening_time')) {
                $updateData['clinic_opening_time'] = $request->clinic_opening_time;
            }
            if ($request->has('clinic_closing_time')) {
                $updateData['clinic_closing_time'] = $request->clinic_closing_time;
            }
            if ($request->has('working_days')) {
                $updateData['working_days'] = json_decode($request->working_days, true);
            }
    
            // Handle file uploads
            if ($request->hasFile('profile_photo')) {
                $file = $request->file('profile_photo');
                
                // Generate unique filename
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                // Store the original file first
                $path = $file->storeAs('doctors/profile-photos', $filename, 'public');
                
                // Dispatch the job to process the image
                ProcessProfileImage::dispatch($path, $doctor->user_id);
                
                // Update the path in database
                $updateData['profile_photo'] = $path;
            }
    
            // Handle documents
            if ($request->hasFile('medical_license')) {
                if ($doctor->medical_license) {
                    Storage::delete('public/' . $doctor->medical_license);
                }
                $medicalLicense = $request->file('medical_license');
                $medicalLicensePath = $medicalLicense->store('documents/medical_licenses', 'public');
                $updateData['medical_license'] = $medicalLicensePath;
            }
    
            if ($request->hasFile('degree_certificate')) {
                if ($doctor->degree_certificate) {
                    Storage::delete('public/' . $doctor->degree_certificate);
                }
                $degreeCertificate = $request->file('degree_certificate');
                $degreeCertificatePath = $degreeCertificate->store('documents/degree_certificates', 'public');
                $updateData['degree_certificate'] = $degreeCertificatePath;
            }
    
            if ($request->hasFile('id_proof')) {
                if ($doctor->id_proof) {
                    Storage::delete('public/' . $doctor->id_proof);
                }
                $idProof = $request->file('id_proof');
                $idProofPath = $idProof->store('documents/id_proofs', 'public');
                $updateData['id_proof'] = $idProofPath;
            }
    
            // Update doctor data
            $doctor->update($updateData);
            
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'data' => $doctor
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();
            
            $doctor = Doctor::findOrFail($id);
            $doctor->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Doctor deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = Doctor::with('user');

            if ($request->has('name')) {
                $name = $request->name;
                $query->where(function($q) use ($name) {
                    $q->where('first_name', 'LIKE', "%{$name}%")
                      ->orWhere('last_name', 'LIKE', "%{$name}%");
                });
            }

            if ($request->has('specialization')) {
                $query->where('specialization', $request->specialization);
            }

            if ($request->has('city')) {
                $query->where('clinic_city', 'LIKE', "%{$request->city}%");
            }

            if ($request->has('fees_range')) {
                $query->whereBetween('consultation_fees', $request->fees_range);
            }

            $doctors = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $doctors
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to srch doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            $doctor = Doctor::with('user')
                          ->where('user_id', $request->user()->id)
                          ->firstOrFail();
            
            // Add full URL for profile photo
            if ($doctor->profile_photo) {
                $doctor->profile_photo_url = url('storage/' . $doctor->profile_photo);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $doctor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch doctor profile',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function setAvailability(Request $request)
    {
        try {
            DB::beginTransaction();
    
            // Get the doctor ID from the authenticated user
            $doctor = Doctor::where('user_id', $request->user()->id)->first();
            
            if (!$doctor) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Doctor not found'
                ], 404);
            }
    
            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after_or_equal:today',
                'time_slots' => 'required|array',
                'time_slots.*.start_time' => 'required',
                'time_slots.*.end_time' => 'required'
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            // Delete existing availability for this date
            Availability::where('doctor_id', $doctor->user_id)
                       ->where('date', $request->date)
                       ->delete();
    
            // Create new availability slots
            foreach ($request->time_slots as $slot) {
                Availability::create([
                    'doctor_id' => $doctor->user_id,
                    'date' => $request->date,
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'is_booked' => false
                ]);
            }
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Availability set successfully'
            ]);
    
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Availability Error: ' . $e->getMessage());
    
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to set availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAvailableDoctors(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after_or_equal:today',
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $availableDoctors = Doctor::with(['user', 'availabilities' => function($query) use ($request) {
                $query->where('date', $request->date)
                      ->where('is_booked', false);
            }])
            ->whereHas('availabilities', function($query) use ($request) {
                $query->where('date', $request->date)
                      ->where('is_booked', false);
            })
            ->get();
    
            return response()->json([
                'status' => 'success',
                'data' => $availableDoctors
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch available doctors',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}