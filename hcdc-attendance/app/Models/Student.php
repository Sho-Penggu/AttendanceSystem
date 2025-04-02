<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students'; // Specify the table name

    protected $fillable = [
        'student_ID',
        'name',
        'gender',
        'department',
        'year'
    ];
}
