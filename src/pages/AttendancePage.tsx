import { useState } from 'react';
import MarkAttendance from '../components/Attendance/MarkAttendance';
import AttendanceView from '../components/Attendance/AttendanceView';

const AttendancePage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAttendanceMarked = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-96 lg:flex-shrink-0">
        <MarkAttendance onAttendanceMarked={handleAttendanceMarked} />
      </div>
      <div className="flex-1 min-w-0">
        <AttendanceView refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default AttendancePage;
