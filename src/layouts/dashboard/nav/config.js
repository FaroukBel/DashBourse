// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`}  sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'Tableau de bord',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Historique',
    path: '/dashboard/history',
    icon: icon('ic_table'),
  },
  {
    title: 'Operations',
    path: '/dashboard/transactions',
    icon: icon('ic_transaction'),
  },
  {
    title: 'Historique Banque',
    path: '/dashboard/bank-history',
    icon: icon('ic_bank'),
  },
  {
    title: 'Operations Banque',
    path: '/dashboard/bank-ops',
    icon: icon('ic_money'),
  },
];

export default navConfig;
