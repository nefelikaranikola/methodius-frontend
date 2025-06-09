import { TeamOutlined, FileTextOutlined, FileProtectOutlined, WalletOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';

const icons = {
  TeamOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  WalletOutlined,
  BarChartOutlined,
  CalendarOutlined
};

const management = {
  id: 'management',
  title: 'Διαχείριση',
  type: 'group',
  children: [
    {
      id: 'employees',
      title: 'Υπάλληλοι',
      type: 'item',
      url: '/management/employees',
      icon: icons.TeamOutlined,
      breadcrumbs: false
    },
    {
      id: 'leave-requests',
      title: 'Αιτήματα Άδειας',
      type: 'item',
      url: '/management/leave-requests',
      icon: icons.FileTextOutlined,
      breadcrumbs: false
    },
    {
      id: 'contracts',
      title: 'Συμβόλαια',
      type: 'item',
      url: '/management/contracts',
      icon: icons.FileProtectOutlined,
      breadcrumbs: false
    },
    {
      id: 'payroll',
      title: 'Μισθοδοσία',
      type: 'item',
      url: '/management/payroll',
      icon: icons.WalletOutlined,
      breadcrumbs: false
    },
    {
      id: 'calendar',
      title: 'Ημερολόγιο',
      type: 'item',
      url: '/calendar',
      icon: icons.CalendarOutlined,
      breadcrumbs: false
    },
    {
      id: 'analytics',
      title: 'Στατιστικά',
      type: 'item',
      url: '/management/analytics',
      icon: icons.BarChartOutlined,
      breadcrumbs: false
    }
  ]
};

export default management;
