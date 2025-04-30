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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('availability_id')->nullable()->constrained('availabilities')->onDelete('set null');
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('request_status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->enum('appointment_status', ['scheduled', 'completed', 'cancelled'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
