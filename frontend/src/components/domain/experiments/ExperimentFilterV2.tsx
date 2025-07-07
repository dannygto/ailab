import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
    Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Autocomplete,
  Button as MuiButton,
  IconButton,
  Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { FilterListIcon } from '../../../utils/icons';
import { SaveIcon } from '../../../utils/icons';
import { ExpandMoreIcon } from '../../../utils/icons';
import { ExpandLessIcon } from '../../../utils/icons';
import { zhCN } from 'date-fns/locale';

// ����������
import { Button, ButtonType } from '../../core/atoms/Button';
import { Card } from '../../core/atoms/Card';
import { Input } from '../../core/atoms/Input';


// �������ͺͳ���
import { ExperimentStatus, ExperimentType } from '../../../types';
import { experimentStatusMap } from '../../../constants/experimentStatus';
import { TYPE_LABELS } from '../../../utils/experimentTypes';

/**
 * ʵ��ɸѡ�����ӿ�
 */
export interface ExperimentFilterCriteria {
  keyword?: string;
  status?: ExperimentStatus[];
  type?: ExperimentType[];
  dateRange?: {
    startDate?: Date | null;
    endDate?: Date | null;
  };
  createdBy?: string[];
  tags?: string[];
  advancedFilters?: Record<string, any>;
}

/**
 * ʵ��ɸѡ��������Խӿ�
 */
export interface ExperimentFilterV2Props {
  /**
   * ��ʼɸѡ����
   */
  initialCriteria?: ExperimentFilterCriteria;

  /**
   * ɸѡ�����仯�ص�
   */
  onFilterChange?: (criteria: ExperimentFilterCriteria) => void;

  /**
   * ����ɸѡ�����ص�
   */
  onSaveFilter?: (name: string, criteria: ExperimentFilterCriteria) => void;

  /**
   * ���ر����ɸѡ����
   */
  savedFilters?: Array<{
    id: string;
    name: string;
    criteria: ExperimentFilterCriteria;
  }>;

  /**
   * �Ƿ�Ĭ��չ��
   */
  defaultExpanded?: boolean;

  /**
   * �Ƿ���������ɸѡ����
   */
  allowSaveFilter?: boolean;
}

/**
 * ʵ��ɸѡ���V2�汾
 * 
 * �ṩ������ɸѡ���ܣ������ؼ���������״̬ɸѡ������ɸѡ�����ڷ�Χѡ���
 */
const ExperimentFilterV2: React.FC<ExperimentFilterV2Props> = ({
  initialCriteria = {},
  onFilterChange,
  onSaveFilter,
  savedFilters = [],
  defaultExpanded = false,
  allowSaveFilter = true
}) => {
  // ״̬����
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [criteria, setCriteria] = useState<ExperimentFilterCriteria>(initialCriteria);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // ����ɸѡ�����仯
  const handleCriteriaChange = (newCriteria: Partial<ExperimentFilterCriteria>) => {
    const updatedCriteria = { ...criteria, ...newCriteria };
    setCriteria(updatedCriteria);
    if (onFilterChange) {
      onFilterChange(updatedCriteria);
    }
  };

  // �������ɸѡ����
  const handleClearFilter = () => {
    setCriteria({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // ��������ɸѡ����
  const handleSaveFilter = () => {
    if (filterName && onSaveFilter) {
      onSaveFilter(filterName, criteria);
      setShowSaveDialog(false);
      setFilterName('');
    }
  };

  // �������ر����ɸѡ����
  const handleLoadFilter = (savedFilter: { id: string; name: string; criteria: ExperimentFilterCriteria }) => {
    setCriteria(savedFilter.criteria);
    if (onFilterChange) {
      onFilterChange(savedFilter.criteria);
    }
  };

  return (
    <Card>
      <div sx={{ display: 'flex', alignItems: 'center', mb: expanded ? 2 : 0 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          ʵ��ɸѡ
        </Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {/* �ؼ������� */}
          <Grid item xs={12} md={6} lg={3}>
            <Input
              fullWidth
              placeholder="����ʵ�����ơ�ID������"
              value={criteria.keyword || ''}
              onChange={(e) => handleCriteriaChange({ keyword: e.target.value })}
            />
          </Grid>

          {/* ״̬ɸѡ */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-LabelIcon">״̬</InputLabel>
              <Select
                labelId="status-filter-LabelIcon"
                multiple
                value={criteria.status || []}
                onChange={(e) => handleCriteriaChange({ status: e.target.value as ExperimentStatus[] })}
                renderValue={(selected) => (
                  <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as ExperimentStatus[]).map((value) => (
                      <Chip 
                        key={value} 
                        label={experimentStatusMap[value]?.label || value} 
                        size="small"
                        sx={{ 
                          bgcolor: experimentStatusMap[value]?.color || 'default',
                          color: '#fff'
                        }}
                      />
                    ))}
                  </div>
                )}
              >
                {Object.entries(experimentStatusMap).map(([key, { label }]) => (
                  <MenuItem key={key} value={key}>
                    {label }
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ����ɸѡ */}
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel id="type-filter-LabelIcon">����</InputLabel>
              <Select
                labelId="type-filter-LabelIcon"
                multiple
                value={criteria.type || []}
                onChange={(e) => handleCriteriaChange({ type: e.target.value as ExperimentType[] })}
                renderValue={(selected) => (
                  <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as ExperimentType[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </div>
                )}
              >
                {['observation','measurement','comparison','exploration','design','analysis','synthesis'].map((type) => (
                  <MenuItem key={type} value={type}>
                    {TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ���ڷ�Χѡ�� */}
          <Grid item xs={12} md={6} lg={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <DatePicker
                    label="��ʼ����"
                    value={criteria.dateRange?.startDate || null}
                    onChange={(date) => handleCriteriaChange({
                      dateRange: {
                        ...criteria.dateRange,
                        startDate: date
                      }
                    })}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="��������"
                    value={criteria.dateRange?.endDate || null}
                    onChange={(date) => handleCriteriaChange({
                      dateRange: {
                        ...criteria.dateRange,
                        endDate: date
                      }
                    })}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    minDate={criteria.dateRange?.startDate || undefined}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Grid>

          {/* ������ɸѡ */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={[]}
              freeSolo
              value={criteria.createdBy || []}
              onChange={(_, newValue) => handleCriteriaChange({ createdBy: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option} 
                    size="small" 
                    {...getTagProps({ index })} 
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="������"
                  placeholder="���벢���س�����"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* ��ǩɸѡ */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              multiple
              options={[]}
              freeSolo
              value={criteria.tags || []}
              onChange={(_, newValue) => handleCriteriaChange({ tags: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option} 
                    size="small" 
                    {...getTagProps({ index })} 
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="��ǩ"
                  placeholder="���벢���س�����"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* ������ť */}
          <Grid item xs={12}>
            <div sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <div>
                {allowSaveFilter && (
                  <Button
                    buttonType={ButtonType.SECONDARY}
                    onClick={() => setShowSaveDialog(true)}
                    startIcon={<SaveIcon />}
                    sx={{ mr: 1 }}
                  >
                    ����ɸѡ
                  </Button>
                )}
                {savedFilters.length > 0 && (
                  <FormControl sx={{ minWidth: 150, mr: 1 }}>
                    <InputLabel id="saved-filters-LabelIcon">�ѱ����ɸѡ</InputLabel>
                    <Select
                      labelId="saved-filters-LabelIcon"
                      value=""
                      label="�ѱ����ɸѡ"
                      onChange={(e) => {
                        const filterId = e.target.value;
                        const filter = savedFilters.find(f => f.id === filterId);
                        if (filter) {
                          handleLoadFilter(filter);
                        }
                      }}
                    >
                      {savedFilters.map(filter => (
                        <MenuItem key={filter.id} value={filter.id}>
                          {filter.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
              <div>
                <Button
                  buttonType={ButtonType.PRIMARY}
                  onClick={() => onFilterChange && onFilterChange(criteria)}
                  sx={{ mr: 1 }}
                >
                  Ӧ��ɸѡ
                </Button>
                <Button
                  buttonType={ButtonType.SECONDARY}
                  onClick={handleClearFilter}
                >
                  ���ɸѡ
                </Button>
              </div>
            </div>
          </Grid>
        </Grid>
      </Collapse>

      {/* ����ɸѡ�Ի��� */}
      {showSaveDialog && (
        <div sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            ���浱ǰɸѡ����
          </Typography>
          <TextField
            fullWidth
            label="ɸѡ����"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            margin="normal"
            size="small"
          />
          <div sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <MuiButton 
              size="small" 
              onClick={() => setShowSaveDialog(false)} 
              sx={{ mr: 1 }}
            >
              ȡ��
            </MuiButton>
            <MuiButton 
              size="small" 
              variant="contained" 
              onClick={handleSaveFilter}
              disabled={!filterName}
            >
              ����
            </MuiButton>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ExperimentFilterV2;

