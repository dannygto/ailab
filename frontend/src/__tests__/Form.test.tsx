import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextField, Button, FormControl, FormLabel } from '@mui/material';
import { renderWithTheme } from '../test-utils';

// ģ��������
const MockForm = () => {
  const [name, setName] = React.useState('');
  const [email, setemail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { name, email });
  };

  return (
    <form data-testid="mock-form" onSubmit={handleSubmit}>
      <h2>���Ա���</h2>
      
      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="name-input">����</FormLabel>
        <TextField
          id="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="����������"
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="email-input">����</FormLabel>
        <TextField
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          placeholder="����������"
        />
      </FormControl>

      <Button 
        type="submit" 
        variant="contained" 
        data-testid="submit-button"
      >
        �ύ
      </Button>
    </form>
  );
};

describe('Form', () => {
  test('��Ⱦ����', () => {
    renderWithTheme(<MockForm />);
    expect(screen.getByTestId('mock-form')).toBeInTheDocument();
    expect(screen.getByText('���Ա���')).toBeInTheDocument();
  });

  test('��ʾ�����ֶ�', () => {
    renderWithTheme(<MockForm />);
    expect(screen.getByLabelText('����')).toBeInTheDocument();
    expect(screen.getByLabelText('����')).toBeInTheDocument();
  });

  test('�����ֶν���', () => {
    renderWithTheme(<MockForm />);
    
    const nameInput = screen.getByLabelText('����');
    const emailInput = screen.getByLabelText('����');

    fireEvent.change(nameInput, { target: { value: '����' } });
    fireEvent.change(emailInput, { target: { value: 'zhangsan@example.com' } });

    expect(nameInput).toHaveValue('����');
    expect(emailInput).toHaveValue('zhangsan@example.com');
  });

  test('�ύ��ť����', () => {
    renderWithTheme(<MockForm />);
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '�ύ' })).toBeInTheDocument();
  });

  test('�����ύ', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderWithTheme(<MockForm />);

    const nameInput = screen.getByLabelText('����');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(nameInput, { target: { value: '�����û�' } });
    fireEvent.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', { 
      name: '�����û�', 
      email: '' 
    });

    consoleSpy.mockRestore();
  });
});