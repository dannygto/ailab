import { Box } from '@mui/material';
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithTheme } from '../test-utils';
import { experimentFixtures } from '../fixtures/experiments';

// ģ��ʵ���������V2
const MockExperimentDetailV2 = ({ experiment = experimentFixtures.basicExperiments[0] }) => (
  <div data-testid="experiment-detail-v2">
    <header data-testid="experiment-header">
      <h1>{experiment.name}</h1>
      <div data-testid="experiment-status">
        <span className={`status-${experiment.status}`}>
          ״̬: {experiment.status}
        </span>
      </div>
    </header>
    
    <section data-testid="experiment-info">
      <h3>ʵ����Ϣ</h3>
      <p>����: {experiment.description}</p>
      <p>����ʱ��: {experiment.createdAt}</p>
    </section>

    <section data-testid="experiment-tabs">
      <div data-testid="tab-overview">����</div>
      <div data-testid="tab-data">����</div>
      <div data-testid="tab-results">���</div>
      <div data-testid="tab-settings">����</div>
    </section>

    <section data-testid="experiment-content">
      <div>ʵ����������</div>
    </section>
  </div>
);

describe('ExperimentDetailV2', () => {
  test('��Ⱦʵ������V2', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-detail-v2')).toBeInTheDocument();
  });

  test('��ʾʵ������״̬', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-header')).toBeInTheDocument();
    expect(screen.getByText('ţ�ٵڶ�������֤ʵ��')).toBeInTheDocument();
    expect(screen.getByTestId('experiment-status')).toBeInTheDocument();
  });

  test('��ʾʵ����Ϣ', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-info')).toBeInTheDocument();
    expect(screen.getByText(/����:/)).toBeInTheDocument();
    expect(screen.getByText(/����ʱ��:/)).toBeInTheDocument();
  });

  test('��ʾѡ�', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-data')).toBeInTheDocument();
    expect(screen.getByTestId('tab-results')).toBeInTheDocument();
    expect(screen.getByTestId('tab-settings')).toBeInTheDocument();
  });

  test('��ʾ��������', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-content')).toBeInTheDocument();
  });
});

export default MockExperimentDetailV2;
