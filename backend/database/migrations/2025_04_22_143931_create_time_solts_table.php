<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->time('clinic_opening_time')->nullable();
            $table->time('clinic_closing_time')->nullable();
            $table->json('working_days')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn('clinic_opening_time');
            $table->dropColumn('clinic_closing_time');
            $table->dropColumn('working_days');
        });
    }
};
