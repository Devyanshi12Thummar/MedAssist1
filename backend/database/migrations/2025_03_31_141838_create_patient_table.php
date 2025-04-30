<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            // Basic Information
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->string('gender')->nullable();
            $table->string('contact_number', 10);
            $table->string('email')->unique();
            // $table->string('password');
            
            // Medical Information
            $table->string('blood_group')->nullable();
            $table->json('medical_conditions')->nullable(); // Stores diabetes, hypertension, asthma, heartDisease
            $table->text('allergies')->nullable();
            $table->text('current_medication')->nullable();
            $table->text('previous_surgeries')->nullable();
            
            // Address Information
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('country')->nullable();
            
            // Emergency Contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_phone', 15)->nullable();
            
            // Additional Fields
            $table->string('role')->default('patient');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes(); // For soft delete functionality

            // Indexes
            $table->index('email');
            $table->index('contact_number');
            $table->index(['first_name', 'last_name']);
            $table->index('blood_group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient');
    }
};
