import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  IconButton,
  Tooltip
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SwitchRightIcon from '@mui/icons-material/SwitchRight';
import { useSchool } from '../contexts/SchoolContext';

/**
 * 校区选择器组件
 * 用于切换当前校区
 */
const SchoolSelector: React.FC = () => {
  const { currentSchool, schools, setCurrentSchool } = useSchool();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectSchool = (schoolCode: string) => {
    setCurrentSchool(schoolCode);
    handleClose();
  };

  return (
    <>
      <Tooltip title="切换校区" arrow>
        <IconButton 
          color="inherit" 
          onClick={handleOpen}
          sx={{ 
            borderRadius: 1,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {currentSchool?.name || '选择校区'}
          </Typography>
          <SwitchRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          选择校区
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            请选择您要访问的校区
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List sx={{ pt: 0 }}>
            {schools.map((school) => (
              <ListItem 
                button 
                key={school.id}
                onClick={() => handleSelectSchool(school.code)}
                selected={currentSchool?.code === school.code}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={school.logoUrl} 
                    alt={school.name}
                    sx={{ 
                      bgcolor: school.themeSettings?.primaryColor || 'primary.main'
                    }}
                  >
                    {school.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={school.name} 
                  secondary={`校区代码: ${school.code}`} 
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SchoolSelector;
