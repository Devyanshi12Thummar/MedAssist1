<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PatientController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!in_array(auth()->user()->role, ['patient', 'doctor', 'admin'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }
            return $next($request);
        });
    }

    public function index()
    {
        try {
            $patients = Patient::with('user')->latest()->paginate(10);  
            return response()->json([
                'status' => 'success',
                'data' => $patients
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $patient = Patient::with('user')->findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $patient
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Patient not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

   

    public function update(Request $request, string $id)
    {
        try {
            DB::beginTransaction();
    
            $patient = Patient::findOrFail($id);
    
            // Only validate fields that are present in the request
            $validationRules = [];
            $updateData = [];
    
            // Define validation rules only for fields that are present
            if ($request->has('blood_group')) {
                $validationRules['blood_group'] = 'string|in:A+,A-,B+,B-,AB+,AB-,O+,O-';
            }
            if ($request->has('medical_conditions')) {
                $validationRules['medical_conditions'] = 'string';
            }
            if ($request->has('allergies')) {
                $validationRules['allergies'] = 'string';
            }
            if ($request->has('current_medication')) {
                $validationRules['current_medication'] = 'string';
            }
            if ($request->has('previous_surgeries')) {
                $validationRules['previous_surgeries'] = 'string';
            }
            if ($request->has('address')) {
                $validationRules['address'] = 'string';
            }
            if ($request->has('city')) {
                $validationRules['city'] = 'string';
            }
            if ($request->has('state')) {
                $validationRules['state'] = 'string';
            }
            if ($request->has('postal_code')) {
                $validationRules['postal_code'] = 'string|max:10';
            }
            if ($request->has('country')) {
                $validationRules['country'] = 'string';
            }
            if ($request->has('emergency_contact_name')) {
                $validationRules['emergency_contact_name'] = 'string|max:255';
            }
            if ($request->has('emergency_contact_relationship')) {
                $validationRules['emergency_contact_relationship'] = 'string|max:255';
            }
            if ($request->has('emergency_contact_phone')) {
                $validationRules['emergency_contact_phone'] = 'string|max:15';
            }
            if ($request->has('first_name')) {
                $validationRules['first_name'] = 'required|string|max:255';
            }
            if ($request->has('last_name')) {
                $validationRules['last_name'] = 'required|string|max:255';
            }
            if ($request->has('date_of_birth')) {
                $validationRules['date_of_birth'] = 'required|date';
            }
            if ($request->has('gender')) {
                $validationRules['gender'] = 'required|string|in:male,female,other';
            }
            if ($request->has('contact_number')) {
                $validationRules['contact_number'] = ['required', 'string', 'max:15', Rule::unique('patient')->ignore($id)];
            }
            if ($request->hasFile('profile_photo')) {
                $validationRules['profile_photo'] = 'image|mimes:jpeg,png,jpg,gif,svg|max:2048';
            }
    
            $validator = Validator::make($request->all(), $validationRules);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            // Handle photo upload if present
            if ($request->hasFile('profile_photo')) {
                if ($patient->profile_photo) {
                    Storage::disk('public')->delete($patient->profile_photo);
                }
                $path = $request->file('profile_photo')->store('patients/profile-photos', 'public');
                $updateData['profile_photo'] = $path;
            }
    
            // Only update fields that are present in the request
            foreach ($validationRules as $field => $rule) {
                if ($field !== 'profile_photo' && $request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }
    
            $patient->update($updateData);
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Patient profile updated successfully',
                'data' => $patient->fresh()
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            if ($request->hasFile('profile_photo') && isset($path)) {
                Storage::disk('public')->delete($path);
            }
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update patient profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();
            
            $patient = Patient::findOrFail($id);
            $patient->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Patient deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = Patient::with('user');

            if ($request->has('name')) {
                $name = $request->name;
                $query->where(function($q) use ($name) {
                    $q->where('first_name', 'LIKE', "%{$name}%")
                      ->orWhere('last_name', 'LIKE', "%{$name}%");
                });
            }

            if ($request->has('email')) {
                $query->where('email', 'LIKE', "%{$request->email}%");
            }

            if ($request->has('contact')) {
                $query->where('contact_number', 'LIKE', "%{$request->contact}%");
            }

            if ($request->has('blood_group')) {
                $query->where('blood_group', $request->blood_group);
            }

            $patients = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data' => $patients
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to search patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            if (auth()->user()->role === 'patient') {
                // If patient, get their own profile
                $patient = Patient::where('user_id', auth()->id())->firstOrFail();
            } elseif (auth()->user()->role === 'doctor') {
                // If doctor, they can view all patients
                $patient = Patient::findOrFail($request->patient_id);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }
    
            return response()->json([
                'status' => 'success',
                'data' => $patient
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch patient profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // Add a method to get all patients (for doctors)
    public function getAllPatients()
    {
        try {
            // Check if the authenticated user is a doctor
            if (auth()->user()->role === 'doctor' || auth()->user()->role === 'admin') {
                $patients = Patient::with('user')
                    ->select('id', 'user_id', 'first_name', 'last_name', 'gender', 'contact_number', 'email', 'date_of_birth')
                    ->latest()
                    ->paginate(10);
    
                return response()->json([
                    'status' => 'success',
                    'data' => $patients
                ]);
            }
    
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}