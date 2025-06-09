import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from 'components/ProtectedRoute';
const CompanyDashboard = Loadable(lazy(() => import('pages/dashboard/CompanyDashboard')));
const EmployeeList = Loadable(lazy(() => import('pages/management/employees/EmployeeList')));
const EmployeeForm = Loadable(lazy(() => import('pages/management/employees/EmployeeForm')));
const LeaveRequestList = Loadable(lazy(() => import('pages/management/leave-requests/LeaveRequestList')));
const LeaveRequestForm = Loadable(lazy(() => import('pages/management/leave-requests/LeaveRequestForm')));
const ContractList = Loadable(lazy(() => import('pages/management/contracts/ContractList')));
const ContractForm = Loadable(lazy(() => import('pages/management/contracts/ContractForm')));
const Payroll = Loadable(lazy(() => import('pages/management/payroll/Payroll')));
const Analytics = Loadable(lazy(() => import('pages/management/analytics/Analytics')));

// render - Calendar
const CalendarPage = Loadable(lazy(() => import('pages/calendar/CalendarPage')));

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />
    },
    {
      path: 'dashboard',
      element: <CompanyDashboard />
    },
    {
      path: 'management',
      children: [
        {
          path: 'employees',
          element: <EmployeeList />
        },
        {
          path: 'employees/add',
          element: <EmployeeForm />
        },
        {
          path: 'employees/:id/edit',
          element: <EmployeeForm />
        },
        {
          path: 'leave-requests',
          element: <LeaveRequestList />
        },
        {
          path: 'leave-requests/add',
          element: <LeaveRequestForm />
        },
        {
          path: 'leave-requests/:id/edit',
          element: <LeaveRequestForm />
        },
        {
          path: 'contracts',
          element: <ContractList />
        },
        {
          path: 'contracts/add',
          element: <ContractForm />
        },
        {
          path: 'contracts/:id/edit',
          element: <ContractForm />
        },
        {
          path: 'payroll',
          element: <Payroll />
        },
        {
          path: 'analytics',
          element: <Analytics />
        }
      ]
    },
    {
      path: 'calendar',
      element: <CalendarPage />
    }
  ]
};

export default MainRoutes;
