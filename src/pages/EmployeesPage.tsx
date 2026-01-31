import { useState } from 'react';
import AddEmployee from '../components/Employee/AddEmployee';
import EmployeeList from '../components/Employee/EmployeeList';

const EmployeesPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEmployeeAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full px-4 sm:px-6 lg:px-8">
      <div className="w-full lg:w-96 lg:flex-shrink-0">
        <AddEmployee onEmployeeAdded={handleEmployeeAdded} />
      </div>
      <div className="flex-1 min-w-0">
        <EmployeeList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default EmployeesPage;
