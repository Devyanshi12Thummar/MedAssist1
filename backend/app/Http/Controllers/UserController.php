<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class UserController extends Controller
{
    public function register(Request $request)
    {
        try {
            DB::beginTransaction();
    
            // Prevent admin registration through API
            if ($request->role === 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Admin registration not allowed'
                ], 403);
            }
    
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users|max:255',
                'password' => [
                    'required',
                    'string',
                    'min:6',
                    'max:8',
                    'regex:/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,8}$/'
                ],
                'role' => ['required', 'string', Rule::in(['doctor', 'patient'])],
                'first_name' => 'required|string|max:255|regex:/^[A-Za-z\s]+$/',
                'last_name' => 'required|string|max:255|regex:/^[A-Za-z\s]+$/',
                'date_of_birth' => 'required|date|before:today',
                'gender' => 'required|string|in:male,female,other',
                'contact_number' => 'required|string|max:15|regex:/^[0-9]+$/',
            ], [
                'password.regex' => 'Password must contain at least one letter, one number, and one special character',
                'first_name.regex' => 'First name can only contain letters and spaces',
                'last_name.regex' => 'Last name can only contain letters and spaces',
                'contact_number.regex' => 'Contact number must contain only numbers',
                'date_of_birth.before' => 'Date of birth must be a date before today',
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'submitted_data' => $request->all() // This helps in debugging
                ], 422);
            }
    
            $user = User::create([
                'email' => strtolower($request->email), // Convert email to lowercase
                'password' => Hash::make($request->password),
                'role' => $request->role
            ]);
            event(new Registered($user));
    
            $profileData = [
                'user_id' => $user->id,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'contact_number' => $request->contact_number,
                'email' => $request->email
            ];

            if ($request->role === 'patient') {
                $profile = Patient::create($profileData);
            } elseif ($request->role === 'doctor') {
                $profile = Doctor::create($profileData);
            }
    
            $token = $user->createToken('auth_token')->plainTextToken;
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Registration successful',
                'data' => [
                    'user' => $user,
                    'profile' => $profile ?? null,
                    'token' => $token
                ]
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function login(Request $request){
    //     if (!$user->hasVerifiedEmail()) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Please verify your email before logging in.'
    //         ], 403);
    //     }
        
    //     try {
    //         \Log::info('Login attempt:', ['email' => $request->email]);

    //         $validator = Validator::make($request->all(), [
    //             'email' => 'required|email',
    //             'password' => 'required|string'
    //         ]);
    
    //         if ($validator->fails()) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Validation failed',
    //                 'errors' => $validator->errors()
    //             ], 422);
    //         }
    
    //         // Check if user exists first
    //         $user = User::where('email', $request->email)->first();
    //         if (!$user) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'User not found'
    //             ], 404);
    //         }
    
    //         // Verify password
    //         if (!Auth::attempt($request->only('email', 'password'))) {
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Invalid credentials'
    //             ], 401);
    //         }
    
    //         $token = $user->createToken('auth_token')->plainTextToken;
    
    //         // Specific handling for patient profile
    //         if ($user->role === 'patient') {
    //             $profile = Patient::where('user_id', $user->id)->first();
                
    //             if (!$profile) {
    //                 \Log::error('Patient profile missing:', [
    //                     'user_id' => $user->id,
    //                     'email' => $user->email
    //                 ]);
                    
    //                 return response()->json([
    //                     'status' => 'error',
    //                     'message' => 'Patient profile not found',
    //                     'debug_info' => [
    //                         'user_exists' => true,
    //                         'user_id' => $user->id,
    //                         'role' => $user->role
    //                     ]
    //                 ], 404);
    //             }
    
    //             return response()->json([
    //                 'status' => 'success',
    //                 'message' => 'Login successful',
    //                 'data' => [
    //                     'user' => $user,
    //                     'profile' => $profile,
    //                     'token' => $token,
    //                     'role' => $user->role
    //                 ]
    //             ]);
    //         }
    
    //         // Handle other roles (doctor, admin)
    //         if ($user->role === 'doctor') {
    //             $profile = Doctor::with('user')->where('user_id', $user->id)->first();
    //             \Log::info('Doctor profile lookup:', ['profile' => $profile ? 'found' : 'not found']);
    //         }
    
    //         if (!$profile) {
    //             \Log::error('Profile not found for user:', [
    //                 'user_id' => $user->id,
    //                 'role' => $user->role
    //             ]);
    //             return response()->json([
    //                 'status' => 'error',
    //                 'message' => 'Profile not found',
    //             ], 404);
    //         }
    
    //         return response()->json([
    //             'status' => 'success',
    //             'message' => 'Login successful',
    //             'data' => [
    //                 'user' => $user,
    //                 'profile' => $profile,
    //                 'token' => $token,
    //                 'role' => $user->role
    //             ]
    //         ]);
    //     } catch (\Exception $e) {
    //         \Log::error('Login failed:', [
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Login failed: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'role' => 'required|in:doctor,patient,admin'
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['status' => 'error', 'message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();

    // Check if the user role matches
    if ($user->role !== $request->role) {
        return response()->json(['status' => 'error', 'message' => 'Role mismatch'], 403);
    }

    // Create token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'status' => 'success',
        'data' => [
            'token' => $token,
            'user' => $user,  // ✅ Make sure $user is passed like this
        ]
    ]);
}



    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $users = User::with(['patient', 'doctor'])->latest()->paginate(10);
            return response()->json([
                'status' => 'success',
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function show(string $id)
    {
        try {
            $user = User::with(['patient', 'doctor'])->findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($id)],
                'password' => 'sometimes|required|string|min:6|max:8',
                'role' => ['sometimes', 'required', 'string', Rule::in(['admin', 'doctor', 'patient'])]
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only(['email', 'role']);
            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }
            
            $user->update($updateData);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $user->load(['patient', 'doctor'])
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();
            
            $user = User::findOrFail($id);
            $user->tokens()->delete();
            $user->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}