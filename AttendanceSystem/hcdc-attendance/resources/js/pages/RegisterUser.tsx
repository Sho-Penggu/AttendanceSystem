import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

// Define valid user types
type UserType = 'students' | 'faculty' | 'visitor';

// Define form state types
type FormState = {
  student_ID: string;
  faculty_ID: string;
  name: string;
  gender: string;
  department: string;
  year: string;
  purpose: string;
  position: string;
  organization: string;
  csv_file: File | null;
};

const initialFormState: FormState = {
  student_ID: '',
  faculty_ID: '',
  name: '',
  gender: '',
  department: '',
  year: '',
  purpose: '',
  position: '',
  organization: '',
  csv_file: null,
};

const RegisterUser = () => {
  const [userType, setUserType] = useState<UserType>('students');
  const [form, setForm] = useState<FormState>({ ...initialFormState });
  const [message, setMessage] = useState('');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'RegisterNew', href: '/register' },
  ];

  useEffect(() => {
    // Reset form when userType changes
    setForm({ ...initialFormState });
    setMessage('');
  }, [userType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'csv_file') {
      setForm({ ...form, csv_file: files?.[0] || null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      let url = '';
      let payload:
        | {
            student_ID: string;
            name: string;
            gender: string;
            department: string;
            year: string;
          }
        | {
            faculty_ID: string;
            name: string;
            department: string;
            position: string;
          }
        | {
            name: string;
            purpose: string;
            organization: string;
          };

      if (userType === 'students') {
        url = '/api/students';
        payload = {
          student_ID: form.student_ID,
          name: form.name,
          gender: form.gender,
          department: form.department,
          year: form.year,
        };
      } else if (userType === 'faculty') {
        url = '/api/faculty';
        payload = {
          faculty_ID: form.faculty_ID,
          name: form.name,
          department: form.department,
          position: form.position,
        };
      } else {
        url = '/api/visitors';
        payload = {
          name: form.name,
          purpose: form.purpose,
          organization: form.organization,
        };
      }

      const res = await axios.post(url, payload);
      setMessage(res.data.message || `${userType} registered successfully.`);
    } catch (err) {
      const error = err as AxiosError;
      const data = error.response?.data as { message?: string };
      setMessage(data?.message || 'Error during registration.');
    }
  };

  const handleCSVUpload = async () => {
    if (!form.csv_file) {
      setMessage('Please select a CSV file.');
      return;
    }

    setMessage('');
    const formData = new FormData();
    formData.append('csv_file', form.csv_file);

    try {
      const url = `/api/${userType}/csv-upload`; // Dynamically set the URL based on user type (students, faculty, or visitor)
      const res = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'CSV uploaded successfully.');
      setForm({ ...form, csv_file: null });  // Reset CSV file input after successful upload
    } catch (err) {
      const error = err as AxiosError;
      const data = error.response?.data as { message?: string };
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
          <h2 className="text-xl font-semibold mb-4">Register New {userType}</h2>
          {message && <div className="mb-2 text-green-600">{message}</div>}

          {/* User Type Selection */}
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
            className="input mb-4"
          >
            <option value="students">Student</option>
            <option value="faculty">Faculty</option>
            <option value="visitor">Visitor</option>
          </select>

          {/* Manual Registration Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {userType === 'students' && (
              <input
                type="text"
                name="student_ID"
                value={form.student_ID}
                onChange={handleChange}
                placeholder="Student ID"
                className="input"
              />
            )}

            {userType === 'faculty' && (
              <input
                type="text"
                name="faculty_ID"
                value={form.faculty_ID}
                onChange={handleChange}
                placeholder="Faculty ID"
                className="input"
              />
            )}

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="input"
            />

            {(userType === 'students') && (
              <select name="gender" value={form.gender} onChange={handleChange} className="input">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            )}

            {(userType === 'students' || userType === 'faculty') && (
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                className="input"
              />
            )}

            {userType === 'students' && (
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
            )}

            {userType === 'faculty' && (
              <input
                type="text"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Position"
                className="input"
              />
            )}

            {userType === 'visitor' && (
              <>
                <input
                  type="text"
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Purpose"
                  className="input"
                />
                <input
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Organization"
                  className="input"
                />
              </>
            )}

            <button
              type="submit"
              className="btn mt-2 w-full bg-gray-300 text-black hover:bg-gray-400"
            >
              Register
            </button>
          </form>

          <hr className="my-6" />

          {/* CSV Upload Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Upload CSV for {userType}</h3>
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

export default RegisterUser;
