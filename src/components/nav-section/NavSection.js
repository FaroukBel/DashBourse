import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Typography, Box, List, ListItemText } from '@mui/material';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <>
            {item.title === 'Historique' && (
              <Typography
                fontSize={24}
                style={{ borderBottom: '5px solid lightgreen', borderRadius: '5px' }}
                paddingLeft={1}
              >
                Systeme
              </Typography>
            )}
            {item.title === 'Historique Banque' && (
              <Typography
                fontSize={24}
                marginTop={5}
                style={{ borderBottom: '5px solid lightsalmon', borderRadius: '5px' }}
                paddingLeft={1}
              >
                Banque
              </Typography>
            )}
            {item.title === 'Outils' && (
              <Typography
                fontSize={24}
                marginTop={5}
                style={{ borderBottom: '5px solid lightblue', borderRadius: '5px' }}
                paddingLeft={1}
              >
                Outils
              </Typography>
            )}

            <NavItem key={item.title} item={item} />
          </>
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item }) {
  const { title, path, icon, info } = item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
      }}
    >
      <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
}
