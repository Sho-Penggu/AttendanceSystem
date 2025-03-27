<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance'; // Define the table name

    protected $fillable = [
        'school_id',
        'name',
        'time_in',
        'time_out',
    ];

    public $timestamps = true;
}
