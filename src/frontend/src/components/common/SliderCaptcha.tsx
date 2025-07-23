import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Slider, Paper } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

interface SliderCaptchaProps {
  onVerified: () => void;
  threshold?: number; // 滑动阈值，默认为90
}

const SliderCaptcha: React.FC<SliderCaptchaProps> = ({
  onVerified,
  threshold = 90
}) => {
  const [value, setValue] = useState<number>(0);
  const [verified, setVerified] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 处理滑动值变化
  const handleChange = (_event: Event, newValue: number | number[]) => {
    const slideValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setValue(slideValue);

    if (slideValue >= threshold) {
      setVerified(true);
      onVerified();
    }
  };

  // 处理滑动开始
  const handleDragStart = () => {
    setDragging(true);
  };

  // 处理滑动结束
  const handleDragEnd = () => {
    setDragging(false);
    if (!verified) {
      // 如果未验证成功，滑块回到起始位置
      setValue(0);
    }
  };

  // 监听验证状态
  useEffect(() => {
    if (verified) {
      // 如果验证成功，禁用滑块
      const slider = sliderRef.current?.querySelector('.MuiSlider-thumb') as HTMLElement;
      if (slider) {
        slider.style.pointerEvents = 'none';
      }
    }
  }, [verified]);

  return (
    <Paper
      ref={sliderRef}
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: verified ? 'rgba(76, 175, 80, 0.08)' : 'background.paper',
        transition: 'background-color 0.3s ease',
        border: verified ? '1px solid #4caf50' : '1px solid #e0e0e0'
      }}
    >
      <Box sx={{ position: 'relative', height: 40, mb: 1 }}>
        <Typography
          variant="body2"
          color={verified ? 'success.main' : 'text.secondary'}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            transition: 'color 0.3s ease',
            whiteSpace: 'nowrap'
          }}
        >
          {verified ? '验证成功' : '向右滑动滑块完成验证'}
        </Typography>
      </Box>

      <Box sx={{ px: 2, position: 'relative' }}>
        <Slider
          value={value}
          onChange={handleChange}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          aria-label="滑动验证"
          valueLabelDisplay="off"
          slots={{
            thumb: (props) => (
              <Box component="span" {...props}>
                {verified ? (
                  <LockOpenIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <LockIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                )}
              </Box>
            )
          }}
          sx={{
            color: verified ? 'success.main' : dragging ? 'primary.main' : 'primary.light',
            height: 8,
            '& .MuiSlider-thumb': {
              width: 40,
              height: 24,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              '&:before': {
                display: 'none',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
              },
              '&.Mui-active': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
            '& .MuiSlider-rail': {
              height: 24,
              borderRadius: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
            '& .MuiSlider-track': {
              height: 24,
              borderRadius: 2,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default SliderCaptcha;
