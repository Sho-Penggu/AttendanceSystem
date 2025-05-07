<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentsTableSeeder extends Seeder
{
    public function run()
    {
        $csvFile = base_path('database/seeders/students.csv');

        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at $csvFile");
            return;
        }

        $file = fopen($csvFile, 'r');
        $header = fgetcsv($file); // Read header row (make sure your CSV has headers)

        while (($row = fgetcsv($file)) !== false) {
            DB::table('students')->insert([
                'student_ID'  => $row[0],
                'name'        => $row[1],
                'gender'      => $row[2],
                'department'  => $row[3],
                'year'        => $row[4],
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        fclose($file);
        $this->command->info('Student records seeded successfully.');
    }
}
