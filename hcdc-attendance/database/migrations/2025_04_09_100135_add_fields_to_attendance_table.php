<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToAttendanceTable extends Migration
{
    public function up()
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->string('name')->nullable(); // Add name column
            $table->string('identifier')->nullable(); // If you want to store any unique identifier
            $table->string('user_type')->nullable(); // If you want to store user type
        });
    }

    public function down()
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropColumn(['name', 'identifier', 'user_type']);
        });
    }
}
