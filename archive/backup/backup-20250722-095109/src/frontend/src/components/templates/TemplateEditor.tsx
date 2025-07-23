import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Card,
  CardContent,
  List,
  ListItemIcon,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { AddIcon, DeleteIcon, DragIndicatorIcon as DragIcon, SaveIcon, VisibilityIcon as PreviewIcon } from '../../utils/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useParams, useNavigate } from 'react-router-dom';
import { ExperimentTemplate, TemplateStep, TemplateMaterial } from '../../types';
import { templateService } from '../../services';

// ���ı��༭����ʹ��React-Quill���������ı��༭����
// @ts-ignore
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface TemplateEditorProps {
  templateId?: string;
  onSave?: (template: ExperimentTemplate) => void;
  onCancelIcon?: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  templateId, 
  onSave,
  onCancelIcon
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  
  // ģ�������Ϣ
  const [template, setTemplate] = useState<Partial<ExperimentTemplate>>({
    name: '',
    description: '',
    detailedDescription: '',
    type: 'exploration',
    subject: '',
    difficulty: 'intermediate',
    grade: 'middle',
    duration: 60,
    steps: [],
    materials: [],
    tags: [],
    thumbnailUrl: '',
    isPublic: true
  });
  
  // UI״̬
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>('');
  
  // ��ȡģ������
  useEffect(() => {
    if (templateId || id) {
      loadTemplate(templateId || id || '');
    }
  }, [templateId, id]);
  
  const loadTemplate = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await templateService.getTemplate(id);
      
      if (response.success && response.data) {
        setTemplate(response.data);
      } else {
        setError('�޷�����ģ������');
      }
    } catch (err) {
      setError('����ģ��ʱ���ִ���');
      console.error('ģ����ش���:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // ������Ϣ�޸Ĵ���
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setTemplate(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleDetailedDescriptionChange = (content: string) => {
    setTemplate(prev => ({ ...prev, detailedDescription: content }));
  };
  
  // ��ǩ����
  const handleAddTag = () => {
    if (newTag.trim() && !template.tags?.includes(newTag.trim())) {
      setTemplate(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleDeleteTag = (tag: string) => {
    setTemplate(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };
  
  // ���账��
  const handleAddStep = () => {
    const newStep: TemplateStep = {
      id: `step-${Date.now()}`,
      title: '�²���',
      description: '',
      order: template.steps?.length || 0,
      duration: 10,
      materials: [],
      images: []
    };
    
    setTemplate(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  };
  
  const handleStepChange = (id: string, field: string, value: any) => {
    setTemplate(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    }));
  };
  
  const handleDeleteStep = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== id).map((step, index) => ({
        ...step,
        order: index
      }))
    }));
  };
  
  // ������ק����
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(template.steps || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // ��������
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setTemplate(prev => ({ ...prev, steps: updatedItems }));
  };
  
  // ���ϴ���
  const handleAddMaterial = () => {
    const newMaterial: TemplateMaterial = {
      id: `material-${Date.now()}`,
      name: '�²���',
      description: '',
      quantity: '1',
      type: 'required'
    };
    
    setTemplate(prev => ({
      ...prev,
      materials: [...(prev.materials || []), newMaterial]
    }));
  };
  
  const handleMaterialChange = (id: string, field: string, value: any) => {
    setTemplate(prev => ({
      ...prev,
      materials: prev.materials?.map(material => 
        material.id === id ? { ...material, [field]: value } : material
      )
    }));
  };
  
  const handleDeleteMaterial = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      materials: prev.materials?.filter(material => material.id !== id)
    }));
  };
  
  // ����ģ��
  const handleSave = async () => {
    if (!template.name || !template.description) {
      setError('����дģ�����ƺ�����');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let response: any;
      
      if (templateId || id) {
        // ��������ģ��
        response = await templateService.updateTemplate(
          templateId || id || '',
          template as any
        );
      } else {
        // ������ģ��
        response = await templateService.createTemplate(template as any);
      }
      
      if (response.success) {
        setSuccess('ģ�屣��ɹ�');
        
        if (onSave) {
          onSave(response.data);
        } else {
          // 3�����ת��ģ������ҳ
          setTimeout(() => {
            navigate(`/templates/${response.data?.id}`);
          }, 3000);
        }
      } else {
        setError('����ģ��ʧ��');
      }
    } catch (err) {
      setError('����ģ��ʱ���ִ���');
      console.error('ģ�屣�����:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Ԥ��ģ��
  const handlePreview = () => {
    setPreviewOpen(true);
  };
  
  // ��ǩҳ�л�
  const handleTabChange = (EventIcon: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // ��Ⱦ��ǩ
  const renderTags = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>��ǩ</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="���ӱ�ǩ"
          variant="outlined"
          size="small"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          sx={{ mr: 1, flexGrow: 1 }}
        />
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={handleAddTag}
        >
          ����
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {template.tags?.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleDeleteTag(tag)}
            color="primary"
            variant="outlined"
          />
        ))}
        {!template.tags?.length && (
          <Typography variant="body2" color="text.secondary">
            ���ޱ�ǩ��������
          </Typography>
        )}
      </Box>
    </Box>
  );
  
  // ��Ⱦ�����б�
  const renderSteps = () => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">ʵ�鲽��</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddStep}
        >
          ���Ӳ���
        </Button>
      </Box>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <List 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              sx={{ bgcolor: 'background.paper' }}
            >
              {template.steps?.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided) => (
                    <Card 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ mb: 2 }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ListItemIcon {...provided.dragHandleProps}>
                            <DragIcon />
                          </ListItemIcon>
                          <Typography variant="h6">
                            ���� {index + 1}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleDeleteStep(step.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              label="�������"
                              value={step.title}
                              onChange={(e) => handleStepChange(step.id, 'title', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Ԥ��ʱ��(����)"
                              type="number"
                              value={step.duration}
                              onChange={(e) => handleStepChange(step.id, 'duration', parseInt(e.target.value) || 0)}
                              margin="normal"
                              InputProps={{ inputProps: { min: 1 } }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              ��������
                            </Typography>
                            <ReactQuill
                              value={step.description}
                              onChange={(content) => handleStepChange(step.id, 'DescriptionIcon', content)}
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{'list': 'ordered'}, {'list': 'bullet'}],
                                  ['link', 'image'],
                                  ['clean']
                                ]
                              }}
                              style={{ height: '200px', marginBottom: '50px' } as React.CSSProperties}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2">
                                ����ͼƬ
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />
                              <Button 
                                size="small" 
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  const currentImages = step.images || [];
                                  handleStepChange(step.id, 'images', [...currentImages, '']);
                                }}
                              >
                                ����ͼƬ
                              </Button>
                            </Box>
                            <Grid container spacing={1}>
                              {step.images?.map((image, imgIndex) => (
                                <Grid item xs={12} sm={6} md={4} key={imgIndex}>
                                  <Box sx={{ position: 'relative' }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label={`ͼƬURL ${imgIndex + 1}`}
                                      value={image}
                                      onChange={(e) => {
                                        const newImages = [...(step.images || [])];
                                        newImages[imgIndex] = e.target.value;
                                        handleStepChange(step.id, 'images', newImages);
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      sx={{ position: 'absolute', right: -12, top: -12 }}
                                      onClick={() => {
                                        const newImages = step.images?.filter((_, i) => i !== imgIndex);
                                        handleStepChange(step.id, 'images', newImages);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                              {!step.images?.length && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">
                                    ����ͼƬ
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {!template.steps?.length && (
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    ���޲��裬������ʵ�鲽��
                  </Typography>
                </Paper>
              )}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
  
  // ��Ⱦ�����б�
  const renderMaterials = () => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">ʵ�����</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddMaterial}
        >
          ���Ӳ���
        </Button>
      </Box>
      
      <List sx={{ bgcolor: 'background.paper' }}>
        {template.materials?.map((material, index) => (
          <Card key={material.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  ���� {index + 1}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleDeleteMaterial(material.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="��������"
                    value={material.name}
                    onChange={(e) => handleMaterialChange(material.id, 'name', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="����"
                    value={material.quantity}
                    onChange={(e) => handleMaterialChange(material.id, 'quantity', e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id={`material-type-LabelIcon-${material.id}`}>����</InputLabel>
                    <Select
                      labelId={`material-type-LabelIcon-${material.id}`}
                      value={material.type}
                      label="����"
                      onChange={(e) => handleMaterialChange(material.id, 'type', e.target.value)}
                    >
                      <MenuItem value="required">����</MenuItem>
                      <MenuItem value="optional">��ѡ</MenuItem>
                      <MenuItem value="alternative">���Ʒ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="����"
                    value={material.description}
                    onChange={(e) => handleMaterialChange(material.id, 'DescriptionIcon', e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                {material.type === 'alternative' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="�������"
                      value={material.substitutes?.join(', ') || ''}
                      onChange={(e) => {
                        const substitutes = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        handleMaterialChange(material.id, 'substitutes', substitutes);
                      }}
                      margin="normal"
                      helperText="����д�˲��Ͽ�����Ĳ�������"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
        {!template.materials?.length && (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              ���޲��ϣ�������ʵ�����
            </Typography>
          </Paper>
        )}
      </List>
    </Box>
  );
  
  // Ԥ���Ի���
  const renderPreviewDialog = () => (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">ģ��Ԥ��: {template.name}</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>{template.name}</Typography>
          <Typography variant="body1" paragraph>{template.description}</Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">����</Typography>
              <Typography variant="body1">{template.type}</Typography>
            </Grid>
            {template.subject && (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">ѧ��</Typography>
                <Typography variant="body1">{template.subject}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">�Ѷ�</Typography>
              <Typography variant="body1">{template.difficulty}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">����ѧ��</Typography>
              <Typography variant="body1">{template.grade}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Ԥ��ʱ��</Typography>
              <Typography variant="body1">{template.duration} ����</Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">��ǩ</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {template.tags?.map(tag => (
                <Chip key={tag} label={tag} size="small" />
              ))}
              {!template.tags?.length && <Typography variant="body2">�ޱ�ǩ</Typography>}
            </Box>
          </Box>
          
          {template.detailedDescription && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>��ϸ����</Typography>
              <div dangerouslySetInnerHTML={{ __html: template.detailedDescription }} />
            </Box>
          )}
        </Box>
        
        {template.materials && template.materials.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>ʵ�����</Typography>
            <Grid container spacing={2}>
              {template.materials.map((material, index) => (
                <Grid item xs={12} sm={6} md={4} key={material.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">{material.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ����: {material.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ����: {
                          material.type === 'required' ? '����' : 
                          material.type === 'optional' ? '��ѡ' : '���Ʒ'
                        }
                      </Typography>
                      {material.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {material.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {template.steps && template.steps.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>ʵ�鲽��</Typography>
            {template.steps.map((step, index) => (
              <Box key={step.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  ���� {index + 1}: {step.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                  Ԥ��ʱ��: {step.duration} ����
                </Typography>
                <div dangerouslySetInnerHTML={{ __html: step.description }} />
                
                {step.images && step.images.length > 0 && (
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {step.images.map((image, imgIndex) => (
                      <Grid item xs={6} sm={4} md={3} key={imgIndex}>
                        {image && (
                          <Box 
                            component="img" 
                            src={image} 
                            alt={`���� ${index + 1} ͼƬ ${imgIndex + 1}`}
                            sx={{ 
                              width: '100%', 
                              height: 'auto', 
                              borderRadius: 1,
                              border: '1px solid #eee'
                            }}
                            onError={(e: any) => {
                              e.target.src = '/images/image-placeholder.jpg';
                            }}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>�ر�</Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* ��ʾ��Ϣ */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* ������ */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5">
            {templateId || id ? '�༭ģ��' : '������ģ��'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            Ԥ��
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            ����
          </Button>
          {onCancelIcon && (
            <Button 
              variant="outlined" 
              onClick={onCancelIcon}
            >
              ȡ��
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* ��ǩҳ */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="������Ϣ" />
          <Tab label="����" />
          <Tab label="����" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* ������Ϣ��ǩҳ */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="ģ������"
                  name="name"
                  value={template.name}
                  onChange={handleBasicInfoChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Ԥ��ʱ��(����)"
                  name="duration"
                  type="number"
                  value={template.duration}
                  onChange={handleBasicInfoChange}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="��Ҫ����"
                  name="description"
                  value={template.description}
                  onChange={handleBasicInfoChange}
                  required
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="template-type-LabelIcon">ʵ������</InputLabel>
                  <Select
                    labelId="template-type-LabelIcon"
                    name="type"
                    value={template.type}
                    label="ʵ������"
                    onChange={handleSelectChange as any}
                  >
                    <MenuItem value="physics">����ʵ��</MenuItem>
                    <MenuItem value="chemistry">��ѧʵ��</MenuItem>
                    <MenuItem value="biology">����ʵ��</MenuItem>
                    <MenuItem value="math">��ѧʵ��</MenuItem>
                    <MenuItem value="computer_ScienceIcon">�������ѧ</MenuItem>
                    <MenuItem value="robotics">������</MenuItem>
                    <MenuItem value="environment">������ѧ</MenuItem>
                    <MenuItem value="astronomy">����ѧ</MenuItem>
                    <MenuItem value="other">����</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="template-subject-LabelIcon">ѧ�Ʒ���</InputLabel>
                  <Select
                    labelId="template-subject-LabelIcon"
                    name="subject"
                    value={template.subject}
                    label="ѧ�Ʒ���"
                    onChange={handleSelectChange as any}
                  >
                    <MenuItem value="">��ѡ��</MenuItem>
                    <MenuItem value="mechanics">��ѧ</MenuItem>
                    <MenuItem value="electromagnetism">���ѧ</MenuItem>
                    <MenuItem value="optics">��ѧ</MenuItem>
                    <MenuItem value="thermodynamics">����ѧ</MenuItem>
                    <MenuItem value="organic_chemistry">�л���ѧ</MenuItem>
                    <MenuItem value="inorganic_chemistry">�޻���ѧ</MenuItem>
                    <MenuItem value="analytical_chemistry">������ѧ</MenuItem>
                    <MenuItem value="microbiology">΢����ѧ</MenuItem>
                    <MenuItem value="botany">ֲ��ѧ</MenuItem>
                    <MenuItem value="zoology">����ѧ</MenuItem>
                    <MenuItem value="genetics">�Ŵ�ѧ</MenuItem>
                    <MenuItem value="algebra">����</MenuItem>
                    <MenuItem value="geometry">����</MenuItem>
                    <MenuItem value="calculus">΢����</MenuItem>
                    <MenuItem value="programming">���</MenuItem>
                    <MenuItem value="artificial_intelligence">�˹�����</MenuItem>
                    <MenuItem value="other">����</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="template-difficulty-LabelIcon">�Ѷȵȼ�</InputLabel>
                  <Select
                    labelId="template-difficulty-LabelIcon"
                    name="difficulty"
                    value={template.difficulty}
                    label="�Ѷȵȼ�"
                    onChange={handleSelectChange as any}
                  >
                    <MenuItem value="beginner">���ż�</MenuItem>
                    <MenuItem value="intermediate">�м�</MenuItem>
                    <MenuItem value="advanced">�߼�</MenuItem>
                    <MenuItem value="expert">ר�Ҽ�</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="template-grade-LabelIcon">����ѧ��</InputLabel>
                  <Select
                    labelId="template-grade-LabelIcon"
                    name="grade"
                    value={template.grade}
                    label="����ѧ��"
                    onChange={handleSelectChange as any}
                  >
                    <MenuItem value="elementary">Сѧ</MenuItem>
                    <MenuItem value="middle">����</MenuItem>
                    <MenuItem value="high">����</MenuItem>
                    <MenuItem value="university">��ѧ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="����ͼURL"
                  name="thumbnailUrl"
                  value={template.thumbnailUrl}
                  onChange={handleBasicInfoChange}
                  margin="normal"
                  placeholder="����ͼƬURL�򱣳ֿհ�ʹ��Ĭ��ͼƬ"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>��ϸ����</Typography>
                <ReactQuill
                  value={template.detailedDescription || ''}
                  onChange={handleDetailedDescriptionChange}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{'list': 'ordered'}, {'list': 'bullet'}],
                      [{ 'indent': '-1'}, { 'indent': '+1' }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  style={{ height: '200px', marginBottom: '50px' } as React.CSSProperties}
                />
              </Grid>
              <Grid item xs={12}>
                {renderTags()}
              </Grid>
            </Grid>
          )}
          
          {/* �����ǩҳ */}
          {activeTab === 1 && renderSteps()}
          
          {/* ���ϱ�ǩҳ */}
          {activeTab === 2 && renderMaterials()}
        </Box>
      </Paper>
      
      {/* Ԥ���Ի��� */}
      {renderPreviewDialog()}
    </Box>
  );
};

export default TemplateEditor;

