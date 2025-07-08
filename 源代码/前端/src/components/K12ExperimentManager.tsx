/**
 * K12ʵ����Դ������
 * ������ʾ�͹���K12ʵ����Դ���е�ʵ��ģ��
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ScienceIcon, PsychologyIcon, ComputerIcon, ExpandMoreIcon, WarningIcon, GroupIcon, ScheduleIcon, SchoolIcon, BuildIcon } from '../utils/icons';

// K12ʵ�����ͺ͹���
import {
  K12Experiment,
  K12Grade,
  K12Subject,
  ExperimentType,
  SafetyLevel,
  GRADE_LABELS,
  SUBJECT_LABELS,
  TYPE_LABELS,
  SAFETY_LABELS,
  getSafetyTips,
  getRecommendedClassSize
} from '../utils/experimentTypes';

// ����K12ʵ����Դ
import k12ExperimentsData from '../config/k12-experiments.json';

interface K12ExperimentManagerProps {
  onSelectExperiment?: (experiment: K12Experiment) => void;
  selectedGrade?: K12Grade;
  selectedSubject?: K12Subject;
}

const K12ExperimentManager: React.FC<K12ExperimentManagerProps> = ({
  onSelectExperiment,
  selectedGrade,
  selectedSubject
}) => {
  const [experiments, setExperiments] = useState<K12Experiment[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<K12Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<K12Grade | 'all'>(selectedGrade || 'all');
  const [subjectFilter, setSubjectFilter] = useState<K12Subject | 'all'>(selectedSubject || 'all');
  const [typeFilter, setTypeFilter] = useState<ExperimentType | 'all'>('all');
  const [safetyFilter, setSafetyFilter] = useState<SafetyLevel | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<number | 'all'>('all');
  const [selectedExperiment, setSelectedExperiment] = useState<K12Experiment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // ѧ��ͼ��ӳ��
  const subjectIcons = {
    ScienceIcon: <ScienceIcon />,
    physics: <ScienceIcon />,
    chemistry: <ScienceIcon />,
    biology: <ScienceIcon />,
    mathematics: <PsychologyIcon />,
    chinese: <SchoolIcon />,
    english: <SchoolIcon />,
    geography: <ScienceIcon />,
    labor: <BuildIcon />,
    technology: <ComputerIcon />,
    general_tech: <BuildIcon />
  };

  // ��ȫ�ȼ���ɫ
  const safetyColors = {
    low: 'success' as const,
    medium: 'warning' as const,
    high: 'error' as const
  };

  // ����ʵ������
  useEffect(() => {
    const loadExperiments = async () => {
      try {
        setLoading(true);
        // ��JSON�����м���ʵ������
        const data = k12ExperimentsData.experiments as K12Experiment[];
        setExperiments(data);
        setFilteredExperiments(data);
      } catch (error) {
        console.error('����K12ʵ����Դʧ��:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExperiments();
  }, []);

  // Ӧ�ù�������
  const filteredResults = useMemo(() => {
    let result = [...experiments];

    // ��������
    if (searchTerm) {
      result = result.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // ѧ�ι���
    if (gradeFilter !== 'all') {
      result = result.filter(exp => exp.grade === gradeFilter);
    }

    // ѧ�ƹ���
    if (subjectFilter !== 'all') {
      result = result.filter(exp => exp.subject === subjectFilter);
    }

    // ʵ�����͹���
    if (typeFilter !== 'all') {
      result = result.filter(exp => exp.type === typeFilter);
    }

    // ��ȫ�ȼ�����
    if (safetyFilter !== 'all') {
      result = result.filter(exp => exp.safetyLevel === safetyFilter);
    }

    // �Ѷȹ���
    if (difficultyFilter !== 'all') {
      result = result.filter(exp => exp.difficulty <= difficultyFilter);
    }

    return result;
  }, [experiments, searchTerm, gradeFilter, subjectFilter, typeFilter, safetyFilter, difficultyFilter]);

  // ����ʵ��ѡ��
  const handleExperimentSelect = (experiment: K12Experiment) => {
    setSelectedExperiment(experiment);
    setDetailDialogOpen(true);
    onSelectExperiment?.(experiment);
  };

  // ��Ⱦʵ�鿨Ƭ
  const renderExperimentCard = (experiment: K12Experiment) => {
    const classSize = getRecommendedClassSize(experiment);
    const safetyTips = getSafetyTips(experiment.safetyLevel);

    return (
      <Grid item xs={12} sm={6} md={4} key={experiment.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <div>
              {subjectIcons[experiment.subject]}
              <Typography variant="h6" component="h3" ml={1}>
                {experiment.title}
              </Typography>
            </div>
            
            <Typography variant="body2" color="text.secondary">
              {experiment.description}
            </Typography>

            <div>
              <Chip
                size="small"
                label={GRADE_LABELS[experiment.grade]}
                color="primary"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
              <Chip
                size="small"
                label={SUBJECT_LABELS[experiment.subject]}
                color="secondary"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
              <Chip
                size="small"
                label={TYPE_LABELS[experiment.type]}
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            </div>

            <div>
              <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {experiment.duration}����
              </Typography>
            </div>

            <div>
              <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Chip
                size="small"
                label={SAFETY_LABELS[experiment.safetyLevel]}
                color={safetyColors[experiment.safetyLevel]}
              />
            </div>

            <div>
              <GroupIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {experiment.isGroupWork ? 'С��ʵ��' : '����ʵ��'}
                ������{classSize.min}-{classSize.max}�ˣ�
              </Typography>
            </div>

            <Typography variant="body2" color="text.secondary">
              �Ѷȵȼ�: {'��'.repeat(experiment.difficulty)}
            </Typography>
          </CardContent>

          <CardActions>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleExperimentSelect(experiment)}
              fullWidth
            >
              �鿴����
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  // ��Ⱦʵ������Ի���
  const renderExperimentDetail = () => {
    if (!selectedExperiment) return null;

    const safetyTips = getSafetyTips(selectedExperiment.safetyLevel);

    return (
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div>
            {subjectIcons[selectedExperiment.subject]}
            <Typography variant="h5" ml={1}>
              {selectedExperiment.title}
            </Typography>
          </div>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedExperiment.description}
          </Typography>

          <div>
            <Typography variant="h6" gutterBottom>������Ϣ</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>ѧ��:</strong> {GRADE_LABELS[selectedExperiment.grade]}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>ѧ��:</strong> {SUBJECT_LABELS[selectedExperiment.subject]}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>����:</strong> {TYPE_LABELS[selectedExperiment.type]}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>ʱ��:</strong> {selectedExperiment.duration}����
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>�Ѷ�:</strong> {'��'.repeat(selectedExperiment.difficulty)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>��ʽ:</strong> {selectedExperiment.isGroupWork ? 'С��ʵ��' : '����ʵ��'}
                </Typography>
              </Grid>
            </Grid>
          </div>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">ʵ��Ŀ��</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {selectedExperiment.objectives.map((objective, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${objective}`} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">ʵ�����</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {selectedExperiment.materials.map((material, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`? ${material}`} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">ʵ�鲽��</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {selectedExperiment.procedures.map((procedure, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${procedure}`} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">��ȫע������</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity={selectedExperiment.safetyLevel === 'high' ? 'error' : selectedExperiment.safetyLevel === 'medium' ? 'warning' : 'info'}>
                <Typography variant="subtitle2">
                  ��ȫ�ȼ�: {SAFETY_LABELS[selectedExperiment.safetyLevel]}
                </Typography>
              </Alert>
              <List dense>
                {selectedExperiment.safetyNotes.map((note, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`? ${note}`} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>ͨ�ð�ȫ��ʾ:</Typography>
              <List dense>
                {safetyTips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`? ${tip}`} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <div>
            <Typography variant="body2" color="text.secondary">
              <strong>�γ̱�׼:</strong> {selectedExperiment.curriculumStandard}
            </Typography>
            <div>
              {selectedExperiment.tags.map((tag, index) => (
                <Chip
                  key={index}
                  size="small"
                  label={tag}
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            �ر�
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onSelectExperiment?.(selectedExperiment);
              setDetailDialogOpen(false);
            }}
          >
            ʹ�ô�ʵ��
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div>
        <Typography>���ڼ���K12ʵ����Դ...</Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        K12ʵ����Դ��
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        �ϸ���Ϲ��ҿγ̱�׼��K12��ѧ��ʵ����Դ������Сѧ�����С�������Ҫѧ��
      </Typography>

      {/* ������ */}
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="����ʵ��"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="����ʵ�����ƻ�ؼ���"
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ѧ��</InputLabel>
              <Select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value as K12Grade | 'all')}
                label="ѧ��"
              >
                <MenuItem value="all">ȫ��ѧ��</MenuItem>
                <MenuItem value="primary">Сѧ</MenuItem>
                <MenuItem value="junior">����</MenuItem>
                <MenuItem value="senior">����</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ѧ��</InputLabel>
              <Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value as K12Subject | 'all')}
                label="ѧ��"
              >
                <MenuItem value="all">ȫ��ѧ��</MenuItem>
                {Object.entries(SUBJECT_LABELS).map(([value, LabelIcon]) => (
                  <MenuItem key={value} value={value}>{LabelIcon}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>����</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ExperimentType | 'all')}
                label="����"
              >
                <MenuItem value="all">ȫ������</MenuItem>
                {Object.entries(TYPE_LABELS).map(([value, LabelIcon]) => (
                  <MenuItem key={value} value={value}>{LabelIcon}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ȫȼ</InputLabel>
              <Select
                value={safetyFilter}
                onChange={(e) => setSafetyFilter(e.target.value as SafetyLevel | 'all')}
                label="ȫȼ"
              >
                <MenuItem value="all">ȫȼ</MenuItem>
                <MenuItem value="low">ͷ</MenuItem>
                <MenuItem value="medium">з</MenuItem>
                <MenuItem value="high">߷</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Ѷ</InputLabel>
              <Select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                label="Ѷ"
              >
                <MenuItem value="all">ȫ</MenuItem>
                <MenuItem value={1}>?</MenuItem>
                <MenuItem value={2}>??</MenuItem>
                <MenuItem value={3}>???</MenuItem>
                <MenuItem value={4}>????</MenuItem>
                <MenuItem value={5}>?????</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </div>

      {/* ͳϢ */}
      <div>
        <Typography variant="body2" color="text.secondary">
          ҵ {filteredResults.length} ʵ飬ܹ {experiments.length} K12ʵԴ
        </Typography>
      </div>

      {/* ʵ鿨Ƭ */}
      <Grid container spacing={3}>
        {filteredResults.map(renderExperimentCard)}
      </Grid>

      {filteredResults.length === 0 && (
        <div>
          <Typography variant="h6" color="text.secondary">
            ûҵʵԴ
          </Typography>
        </div>
      )}

      {/* ʵԻ */}
      {renderExperimentDetail()}
    </div>
  );
};

export default K12ExperimentManager;

