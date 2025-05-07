import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const StudentRegister = () => {
  const [form, setForm] = useState({
    student_ID: '',
    name: '',
    gender: '',
    department: '',
    year: '',
    csv_file: null as File | null,
  });

  const [message, setMessage] = useState('');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'RegisterNew', href: '/student-register' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'csv_file') {
      setForm({ ...form, csv_file: files?.[0] || null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Manual student registration handler
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post('/api/students', {
        student_ID: form.student_ID,
        name: form.name,
        gender: form.gender,
        department: form.department,
        year: form.year,
      });

      setMessage(res.data.message || 'Student registered successfully.');
      setForm({ ...form, student_ID: '', name: '', gender: '', department: '', year: '' });
    } catch (err) {
      const error = err as AxiosError;
      const data = error.response?.data as { errors?: Record<string, string[]>; message?: string };
      setMessage(data?.message || 'Error registering student.');
    }
  };

  // ✅ CSV Upload handler
  const handleCSVUpload = async () => {
    if (!form.csv_file) {
      setMessage('Please select a CSV file.');
      return;
    }

    setMessage('');
    const formData = new FormData();
    formData.append('csv_file', form.csv_file);

    try {
      const res = await axios.post('/api/students/csv-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'CSV uploaded successfully.');
      setForm({ ...form, csv_file: null });
    } catch (err) {
      const error = err as AxiosError;
      const data = error.response?.data as { errors?: Record<string, string[]>; message?: string };
      setMessage(data?.message || 'CSV upload failed.');
    }
  };

  const handleCancel = () => {
    window.location.href = '/dashboard';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Register New" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="p-4 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Register Student</h2>
          {message && <div className="mb-2 text-green-600">{message}</div>}

          {/* ✅ Manual Registration Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <input
              type="text"
              name="student_ID"
              value={form.student_ID}
              onChange={handleChange}
              placeholder="Student ID"
              className="input"
            />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="input"
            />
            <select name="gender" value={form.gender} onChange={handleChange} className="input">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              className="input"
            />
            <input
              type="number"
              name="year"
              min={1}
              max={4}
              value={form.year}
              onChange={handleChange}
              placeholder="Year Level"
              className="input"
            />

            <button
              type="submit"
              className="btn mt-2 w-full bg-gray-300 text-black hover:bg-gray-400"
            >
              Register
            </button>
          </form>

          <hr className="my-6" />

          {/* ✅ CSV Upload Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Upload CSV</h3>
            <input
              type="file"
              name="csv_file"
              accept=".csv"
              onChange={handleChange}
              className="input mt-2"
            />
            <button
              type="button"
              onClick={handleCSVUpload}
              className="btn mt-2 w-full bg-gray-300 text-black hover:bg-gray-400"
            >
              Upload CSV
            </button>
          </div>

          {/* Cancel Button */}
          <Button
            type="button"
            onClick={handleCancel}
            className="mt-4 w-full bg-gray-300 text-black hover:bg-gray-400"
          >
            Cancel
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentRegister;
