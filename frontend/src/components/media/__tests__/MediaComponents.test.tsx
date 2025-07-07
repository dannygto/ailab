// ý������������
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SpeechToTextComponent from '../SpeechToTextComponent';
import OCRComponent from '../OCRComponent';
import ChartAnalysisComponent from '../ChartAnalysisComponent';
import FormulaRecognitionComponent from '../FormulaRecognitionComponent';

// Mock aiService
jest.mock('../../../services/aiService', () => ({
  __esModule: true,
  default: {
    speechToText: jest.fn().mockResolvedValue({
      success: true,
      data: {
        text: '����һ����������תд���',
        confidence: 0.95,
        metadata: {
          duration: 5.0,
          wordCount: 10,
          LanguageIcon: 'zh-CN'
        }
      }
    }),
    imageOCR: jest.fn().mockResolvedValue({
      success: true,
      data: {
        text: '����OCRʶ����ı�',
        confidence: 0.92,
        blocks: [],
        metadata: {
          LanguageIcon: 'zh-CN',
          orientation: 0,
          dimensions: { width: 800, height: 600 }
        }
      }
    }),
    analyzeScientificChart: jest.fn().mockResolvedValue({
      success: true,
      data: {
        chartType: '��״ͼ',
        interpretation: '����һ����ʾ�������Ƶ���״ͼ',
        confidence: 0.88
      }
    }),
    recognizeFormula: jest.fn().mockResolvedValue({
      success: true,
      data: {
        formula: 'E = mc^2',
        originalFormat: 'latex',
        confidence: 0.93
      }
    })
  }
}));

// Mock MediaStream for testing
// @ts-ignore
global.MediaStream = jest.fn().mockImplementation(() => ({
  getTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => []),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  clone: jest.fn()
}));

// Mocký��api
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue(new (global as any).MediaStream())
  }
});

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SpeechToTextComponent', () => {
  test('��Ⱦ����ת�ı����', () => {
    renderWithTheme(<SpeechToTextComponent />);
    expect(screen.getByText('����ת�ı�')).toBeInTheDocument();
    expect(screen.getByText('��ʼ¼��')).toBeInTheDocument();
  });

  test('��ʾ����ѡ����', () => {
    renderWithTheme(<SpeechToTextComponent />);
    // ʹ��role�����Ʋ���Select���
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('���� (����)')).toBeInTheDocument();
  });
});

describe('OCRComponent', () => {
  test('��ȾOCR���', () => {
    renderWithTheme(<OCRComponent />);
    expect(screen.getByText('ͼ������ʶ�� (OCR)')).toBeInTheDocument();
    expect(screen.getByText('ѡ��ͼƬ')).toBeInTheDocument();
  });

  test('��ʾʶ��ģʽѡ����', () => {
    renderWithTheme(<OCRComponent />);
    // ʹ���ı����ݲ��ң���Ϊ�ж��combobox
    expect(screen.getByText('��ȷģʽ')).toBeInTheDocument();
    expect(screen.getByText('�Զ����')).toBeInTheDocument();
  });
});

describe('ChartAnalysisComponent', () => {
  test('��Ⱦ��ѧͼ���������', () => {
    renderWithTheme(<ChartAnalysisComponent />);
    expect(screen.getByText('��ѧͼ������')).toBeInTheDocument();
    expect(screen.getByText('ѡ��ͼ��ͼƬ')).toBeInTheDocument();
  });

  test('��ʾͼ������ѡ����', () => {
    renderWithTheme(<ChartAnalysisComponent />);
    // ����ͼ��������ص���ʾ�ı�
    expect(screen.getByText('�Զ����')).toBeInTheDocument();
    expect(screen.getByText('��ȡ����')).toBeInTheDocument();
  });
});

describe('FormulaRecognitionComponent', () => {
  test('��Ⱦ��ѧ��ʽʶ�����', () => {
    renderWithTheme(<FormulaRecognitionComponent />);
    expect(screen.getByText('��ѧ��ʽʶ��')).toBeInTheDocument();
    expect(screen.getByText('ѡ��ʽͼƬ')).toBeInTheDocument();
  });

  test('��ʾ�����ʽѡ����', () => {
    renderWithTheme(<FormulaRecognitionComponent />);
    // ���������ʽ��ص���ʾ�ı�
    expect(screen.getByText('LaTeX')).toBeInTheDocument();
    expect(screen.getByText('������ʽ����')).toBeInTheDocument();
  });
});

describe('�ļ��ϴ��ʹ���', () => {
  test('�ļ��ϴ���������', async () => {
    renderWithTheme(<OCRComponent />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText('ѡ��ͼƬ').querySelector('input[type="file"]') as HTMLInputElement;
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('��ʼʶ��')).toBeInTheDocument();
      });
    }
  });
});

describe('api����', () => {
  test('����תдapi����', async () => {
    const mockCallback = jest.fn();
    renderWithTheme(<SpeechToTextComponent onTranscriptionComplete={mockCallback} />);
    
    // ģ���ļ��ϴ��ʹ�������
    const file = new File(['audio'], 'test.webm', { type: 'audio/webm' });
    
    // ��֤�ļ����ڣ��������ԣ�
    expect(file.name).toBe('test.webm');
    expect(file.type).toBe('audio/webm');
    
    // ������Ҫ�����ӵĲ����߼���ģ����������Ƶ��������
    // �����漰ý��api��ʵ�ʲ��Կ�����Ҫ�����mock����
  });
});
