import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  Box
} from '@mui/material';
import { ExpandLessIcon, ExpandMoreIcon, AccountCircleIcon as AccountCircleIconIcon } from '../../utils/icons';
import { Link, useLocation } from 'react-router-dom';
import { getIcon } from '../../utils/iconUtils';

interface SubMenuItem {
  text: string;
  path: string;
}

interface MenuItem {
  text: string;
  icon: string;
  path: string;
  subItems?: SubMenuItem[];
}

interface NavigationMenuProps {
  menuItems: MenuItem[];
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ menuItems }) => {
  const theme = useTheme();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const handleMenuClick = (path: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      setExpandedMenus(prev => 
        prev.includes(path) 
          ? prev.filter(item => item !== path)
          : [...prev, path]
      );
    }
  };

  const isMenuActive = (path: string, subItems?: SubMenuItem[]) => {
    if (subItems) {
      return subItems.some(item => location.pathname === item.path);
    }
    return location.pathname === path;
  };

  const isSubMenuActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <List>
      {menuItems.map((item) => (
        <Box key={item.text}>
          <ListItem 
            button 
            component={item.subItems ? 'div' : Link}
            to={item.subItems ? undefined : item.path}
            onClick={() => handleMenuClick(item.path, !!item.subItems)}
            selected={isMenuActive(item.path, item.subItems)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              cursor: 'pointer'
            }}
          >                    <ListItemIcon>{getIcon(item.icon)}</ListItemIcon>
            <ListItemText primary={item.text} />
            {item.subItems && (
              expandedMenus.includes(item.path) ? <ExpandLessIcon /> : <ExpandMoreIcon />
            )}
          </ListItem>
          
          {item.subItems && (
            <Collapse in={expandedMenus.includes(item.path)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.subItems.map((subItem) => (
                  <ListItem
                    key={subItem.text}
                    button
                    component={Link}
                    to={subItem.path}
                    selected={isSubMenuActive(subItem.path)}
                    sx={{
                      pl: 4,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main,
                        }
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      }
                    }}
                  >
                    <ListItemIcon>
                      <AccountCircleIconIcon sx={{ fontSize: 8 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text} 
                      primaryTypographyProps={{
                        fontSize: '0.875rem'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </Box>
      ))}
    </List>
  );
};

export default NavigationMenu;
