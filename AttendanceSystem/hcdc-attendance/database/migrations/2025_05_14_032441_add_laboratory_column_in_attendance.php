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
    Schema::table('attendance', function (Blueprint $table) {
        // Make sure 'user_type' exists before adding 'laboratory'
        if (!Schema::hasColumn('attendance', 'user_type')) {
            $table->string('user_type');
        }
        $table->string('laboratory')->nullable()->after('user_type');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down()
{
    Schema::table('attendance', function (Blueprint $table) {
        $table->dropColumn('laboratory');
    });
}
};
