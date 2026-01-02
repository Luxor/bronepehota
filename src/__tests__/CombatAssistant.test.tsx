import { render, screen, fireEvent } from '@testing-library/react';
import CombatAssistant from '../components/CombatAssistant';

describe('CombatAssistant Component', () => {
  test('renders combat assistant title', () => {
    render(<CombatAssistant />);
    expect(screen.getByText('Расчет атаки')).toBeInTheDocument();
  });

  test('calculates hit correctly after click', () => {
    render(<CombatAssistant />);
    
    const fireButton = screen.getByText('Огонь!');
    fireEvent.click(fireButton);

    // After click, results should appear
    expect(screen.getByText('Результат')).toBeInTheDocument();
    expect(screen.getByText('Урон')).toBeInTheDocument();
  });
});


