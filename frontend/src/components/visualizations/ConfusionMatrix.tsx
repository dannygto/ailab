import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  useTheme, 
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

interface ConfusionMatrixProps {
  matrix: number[][];
  labels?: string[]; // ��ѡ������ǩ
  data?: number[][];  // ������ԭ�е��÷�ʽ
  size?: number;      // ������ԭ�е��÷�ʽ
}

/**
 * ����������ӻ����
 * 
 * �������������������������ͼ��ʽչʾ��֧�������ͣ��ʾ��ϸ��Ϣ
 */
const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix, labels, data, size }) => {
  const theme = useTheme();
  
  // ���ݴ�����֧�־ɵ�data����
  const matrixData = matrix || data || [];
  
  // ���û���ṩ��ǩ����ʹ����������
  const classLabels = labels || Array.from({ length: matrixData.length }, (_, i) => `��� ${i+1}`);
  
  // �ҳ������е����ֵ�����ڹ�һ����ɫ
  const maxValue = Math.max(...matrixData.map(row => Math.max(...row)));

  // ����ֵ������ɫ���
  const getColor = (value: number) => {
    // ��ֵ��һ����0-1��Χ
    const normalizedValue = value / maxValue;
    
    // ʹ�������primary��ɫ������ֵ����͸����
    return theme.palette.primary.main + 
      Math.floor(normalizedValue * 200).toString(16).padStart(2, '0');
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        ��������
      </Typography>
      <div sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                {classLabels.map((label, i) => (
                  <TableCell key={`header-${i}`} align="center">
                    <Typography variant="body2" fontWeight="bold">
                      Ԥ��: {label }
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {matrixData.map((row, i) => (
                <TableRow key={`row-${i}`}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">
                      ʵ��: {classLabels[i]}
                    </Typography>
                  </TableCell>
                  {row.map((cell, j) => (
                    <Tooltip 
                      key={`cell-${i}-${j}`} 
                      title={`ʵ��: ${classLabels[i]}, Ԥ��: ${classLabels[j]}, ����: ${cell}`}
                      arrow
                    >
                      <TableCell 
                        align="center"
                        sx={{
                          backgroundColor: getColor(cell),
                          color: cell / maxValue > 0.5 ? 'white' : 'inherit',
                          fontWeight: i === j ? 'bold' : 'normal', // �Խ��߼Ӵ�
                          border: i === j ? `1px solid ${theme.palette.primary.main}` : undefined,
                          minWidth: '60px',
                          height: '60px'
                        }}
                      >
                        {cell}
                      </TableCell>
                    </Tooltip>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
        * �Խ����ϵ�ֵ��ʾ��ȷ�������������
      </Typography>
    </Paper>
  );
};

export default ConfusionMatrix;
