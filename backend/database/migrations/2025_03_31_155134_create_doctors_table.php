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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('contact_number', 15)->unique();
            $table->string('email')->unique();
            $table->string('role')->default('doctor');
            $table->string('registration_number')->nullable()->unique();
            $table->string('specialization')->nullable();
            $table->integer('experience')->nullable();
            $table->decimal('consultation_fees', 10, 2)->nullable();
            
            // Clinic/Hospital Details
            $table->string('clinic_name')->nullable();
            $table->string('clinic_address')->nullable();
            $table->string('clinic_city')->nullable();
            $table->string('clinic_state')->nullable();
            $table->string('clinic_postal_code')->nullable();
            $table->string('clinic_country')->nullable();
            
            // Documents
            $table->string('medical_license_path')->nullable();
            $table->string('degree_certificate_path')->nullable();
            $table->string('id_proof_path')->nullable();
            
            // Additional Features
            $table->boolean('telemedicine_support')->default(false);
            $table->json('availability')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};