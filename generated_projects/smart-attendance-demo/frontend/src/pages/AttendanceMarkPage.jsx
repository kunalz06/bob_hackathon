import { useState, useEffect } from 'react';
import api from '../utils/api';

const AttendanceMarkPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      const filtered = response.data.filter(s => s.class === selectedClass);
      setStudents(filtered);
      
      // Initialize attendance state
      const initialAttendance = {};
      filtered.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
      setSelectedClass(subject.class);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        subjectId: parseInt(selectedSubject),
        date,
        status,
      }));

      await api.post('/attendance/bulk-mark', { attendanceRecords });
      alert('Attendance marked successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mark Attendance</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedSubject}
                onChange={handleSubjectChange}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={selectedClass}
                readOnly
              />
            </div>
          </div>

          {students.length > 0 && (
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Roll Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{student.roll_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                value="present"
                                checked={attendance[student.id] === 'present'}
                                onChange={() => handleAttendanceChange(student.id, 'present')}
                                className="form-radio text-green-600"
                              />
                              <span className="ml-2">Present</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                value="absent"
                                checked={attendance[student.id] === 'absent'}
                                onChange={() => handleAttendanceChange(student.id, 'absent')}
                                className="form-radio text-red-600"
                              />
                              <span className="ml-2">Absent</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                value="late"
                                checked={attendance[student.id] === 'late'}
                                onChange={() => handleAttendanceChange(student.id, 'late')}
                                className="form-radio text-yellow-600"
                              />
                              <span className="ml-2">Late</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            </form>
          )}

          {selectedSubject && students.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No students found for this class.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarkPage;

// Made with Bob
