import { Link } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import { Divider } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import BadgeIcon from '@mui/icons-material/Badge';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import KeyIcon from '@mui/icons-material/Key';
import SettingsIcon from '@mui/icons-material/Settings';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

const drawerWidth = 220;

const AppDrawer = () => {
  return (
    <MuiDrawer
      variant='permanent'
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar variant='dense' />

      <List component='nav'>
        <ListItemButton component={Link} to='/'>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary='Dashboard' />
        </ListItemButton>

        <ListItemButton component={Link} to='/privatekeys'>
          <ListItemIcon>
            <KeyIcon />
          </ListItemIcon>
          <ListItemText primary='Private Keys' />
        </ListItemButton>

        <ListItemButton component={Link} to='/acmeaccounts'>
          <ListItemIcon>
            <BadgeIcon />
          </ListItemIcon>
          <ListItemText primary='ACME Accounts' />
        </ListItemButton>

        <ListItemButton component={Link} to='/certificates'>
          <ListItemIcon>
            <CardMembershipIcon />
          </ListItemIcon>
          <ListItemText primary='Certificates' />
        </ListItemButton>

        <Divider sx={{ my: 2 }} />

        <ListItemButton component={Link} to='/logs'>
          <ListItemIcon>
            <TextSnippetIcon />
          </ListItemIcon>
          <ListItemText primary='Logs' />
        </ListItemButton>

        <ListItemButton component={Link} to='/settings'>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary='Settings' />
        </ListItemButton>
      </List>
    </MuiDrawer>
  );
};

export default AppDrawer;
