<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('doctor_id');
            $table->date('date');
            $table->string('start_time');
            $table->string('end_time');
            $table->boolean('is_booked')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('doctor_id')->references('user_id')->on('doctors')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('availabilities');
    }
};