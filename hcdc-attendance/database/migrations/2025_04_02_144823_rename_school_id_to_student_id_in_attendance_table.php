<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->renameColumn('school_id', 'student_ID');
        });
    }

    public function down()
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->renameColumn('student_ID', 'school_id');
        });
    }
};
