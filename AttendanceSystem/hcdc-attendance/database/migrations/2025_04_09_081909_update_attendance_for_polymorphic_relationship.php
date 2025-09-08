<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            // Drop old fields if they exist
            if (Schema::hasColumn('attendance', 'student_ID')) {
                $table->dropColumn('student_ID');
            }

            if (Schema::hasColumn('attendance', 'name')) {
                $table->dropColumn('name');
            }

            // Add new flat fields
            $table->string('user_type')->after('id'); // student, faculty, visitor
            $table->string('identifier')->nullable()->after('user_type'); // student_ID, faculty ID, etc.
            $table->string('name')->after('identifier'); // name of the person
        });
    }

    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            // Revert changes
            $table->dropColumn(['user_type', 'identifier', 'name']);
            $table->string('student_ID')->nullable(); // Optional if needed
            $table->string('name')->nullable(); // Re-add previous structure
        });
    }
};
