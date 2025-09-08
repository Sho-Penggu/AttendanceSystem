<?php

namespace Tests\Feature;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_generate_statistics()
    {
        // Prepare some dummy attendance data
        Attendance::factory()->create([
            'time_in' => Carbon::parse('2025-01-01 08:00:00'),
            'laboratory' => 'Lab A',
            'user_type' => 'Student',
        ]);

        Attendance::factory()->create([
            'time_in' => Carbon::parse('2025-01-02 08:00:00'),
            'laboratory' => 'Lab B',
            'user_type' => 'Faculty',
        ]);

        // Send a request to the statistics endpoint with date filters
        $response = $this->get('/statistics?start_date=2025-01-01&end_date=2025-01-10');

        // Assert that the response contains the expected data
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'date' => '2025-01-01',
            'count' => 1,
        ]);
        $response->assertJsonFragment([
            'date' => '2025-01-02',
            'count' => 1,
        ]);
    }

    /** @test */
    public function it_can_export_csv()
    {
        // Prepare some dummy attendance data
        Attendance::factory()->create([
            'time_in' => Carbon::parse('2025-01-01 08:00:00'),
            'laboratory' => 'Lab A',
            'user_type' => 'Student',
        ]);

        // Send a request to the CSV export endpoint with date filters
        $response = $this->get('/export-csv?start_date=2025-01-01&end_date=2025-01-10');

        // Assert that the response is a CSV file
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $response->assertHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
    }

    /** @test */
    public function it_can_export_pdf()
    {
        // Prepare some dummy attendance data
        Attendance::factory()->create([
            'time_in' => Carbon::parse('2025-01-01 08:00:00'),
            'laboratory' => 'Lab A',
            'user_type' => 'Student',
        ]);

        // Send a request to the PDF export endpoint with date filters
        $response = $this->get('/export-pdf?start_date=2025-01-01&end_date=2025-01-10');

        // Assert that the response is a PDF file
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'attachment; filename="attendance.pdf"');
    }
}
