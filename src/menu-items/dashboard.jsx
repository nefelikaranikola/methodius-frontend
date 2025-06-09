import { DashboardOutlined } from '@ant-design/icons';

const icons = {
  DashboardOutlined
};

const dashboard = {
  id: 'group-dashboard',
  title: 'Πλοήγηση',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Πίνακας Ελέγχου',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
