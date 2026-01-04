/**
 * Army Building Flow Tests
 *
 * Tests are OPTIONAL for this feature.
 * If following TDD, uncomment and implement these tests before implementation.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FactionSelector } from '@/components/FactionSelector';
import { PointBudgetInput } from '@/components/PointBudgetInput';
import { UnitSelector } from '@/components/UnitSelector';
import type { Faction, Squad, ArmyUnit, FactionID } from '@/lib/types';

// Mock faction data
const mockFactions: Faction[] = [
  {
    id: 'polaris',
    name: 'Polaris',
    color: '#ef4444',
    description: 'Элитные кибер-солдаты с передовыми технологиями',
    motto: 'В единении — сила',
    homeWorld: 'Полярис Прайм',
  },
  {
    id: 'protectorate',
    name: 'Протекторат',
    color: '#3b82f6',
    description: 'Защитники галактики с мощной броней',
    motto: 'Защита — наш долг',
    homeWorld: 'Терра Нова',
  },
  {
    id: 'mercenaries',
    name: 'Наёмники',
    color: '#eab308',
    description: ' Profesional soldiers fighting for credits',
    motto: 'Победа любой ценой',
    homeWorld: 'Фрипорт',
  },
];

// Mock squad data
const mockSquads: Squad[] = [
  {
    id: 'polaris_light_assault',
    name: 'Легкий штурм',
    faction: 'polaris' as FactionID,
    cost: 50,
    soldiers: [],
    image: '/images/polaris-light-assault.jpg',
  },
  {
    id: 'polaris_heavy_assault',
    name: 'Тяжелый штурм',
    faction: 'polaris' as FactionID,
    cost: 100,
    soldiers: [],
    image: '/images/polaris-heavy-assault.jpg',
  },
];

describe('FactionSelector', () => {
  it('renders all factions', () => {
    const mockSelect = jest.fn();
    render(
      <FactionSelector
        factions={mockFactions}
        onFactionSelect={mockSelect}
      />
    );

    expect(screen.getByText('Polaris')).toBeInTheDocument();
    expect(screen.getByText('Протекторат')).toBeInTheDocument();
    expect(screen.getByText('Наёмники')).toBeInTheDocument();
  });

  it('calls onFactionSelect when card is clicked', () => {
    const mockSelect = jest.fn();
    render(
      <FactionSelector
        factions={mockFactions}
        onFactionSelect={mockSelect}
      />
    );

    fireEvent.click(screen.getByText('Polaris'));
    expect(mockSelect).toHaveBeenCalledWith('polaris');
  });

  it('highlights selected faction', () => {
    const mockSelect = jest.fn();
    render(
      <FactionSelector
        factions={mockFactions}
        selectedFaction="polaris"
        onFactionSelect={mockSelect}
      />
    );

    const polarisCard = screen.getByText('Polaris').closest('[role="button"]');
    expect(polarisCard).toHaveAttribute('aria-pressed', 'true');
  });

  it('expands faction details on click', () => {
    const mockSelect = jest.fn();
    render(
      <FactionSelector
        factions={mockFactions}
        onFactionSelect={mockSelect}
      />
    );

    // Initially details are hidden
    expect(screen.queryByText(/Элитные кибер-солдаты/)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText('Polaris'));
    expect(screen.getByText(/Элитные кибер-солдаты/)).toBeInTheDocument();
  });
});

describe('PointBudgetInput', () => {
  it('renders all preset buttons', () => {
    const mockChange = jest.fn();
    render(
      <PointBudgetInput
        presets={[250, 350, 500, 1000]}
        onChange={mockChange}
      />
    );

    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('350')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('calls onChange with preset value when button is clicked', () => {
    const mockChange = jest.fn();
    render(
      <PointBudgetInput
        presets={[250, 350, 500, 1000]}
        onChange={mockChange}
      />
    );

    fireEvent.click(screen.getByText('500'));
    expect(mockChange).toHaveBeenCalledWith(500);
  });

  it('validates custom input', () => {
    const mockChange = jest.fn();
    render(
      <PointBudgetInput
        presets={[250, 350, 500, 1000]}
        onChange={mockChange}
      />
    );

    const input = screen.getByPlaceholderText('Введите количество очков');

    // Invalid input
    fireEvent.change(input, { target: { value: '-10' } });
    expect(screen.getByText('Введите положительное число')).toBeInTheDocument();

    // Valid input
    fireEvent.change(input, { target: { value: '750' } });
    expect(mockChange).toHaveBeenCalledWith(750);
  });

  it('shows error for values over 10000', () => {
    const mockChange = jest.fn();
    render(
      <PointBudgetInput
        presets={[250, 350, 500, 1000]}
        onChange={mockChange}
      />
    );

    const input = screen.getByPlaceholderText('Введите количество очков');
    fireEvent.change(input, { target: { value: '15000' } });

    expect(screen.getByText('Максимум 10000 очков')).toBeInTheDocument();
  });
});

describe('UnitSelector', () => {
  const mockArmy: ArmyUnit[] = [];
  const mockAdd = jest.fn();
  const mockRemove = jest.fn();
  const mockToBattle = jest.fn();

  it('filters units by selected faction', () => {
    render(
      <UnitSelector
        factions={mockFactions}
        squads={mockSquads}
        selectedFaction="polaris"
        pointBudget={500}
        army={mockArmy}
        onAddUnit={mockAdd}
        onRemoveUnit={mockRemove}
        onToBattle={mockToBattle}
      />
    );

    expect(screen.getByText('Легкий штурм')).toBeInTheDocument();
    expect(screen.getByText('Тяжелый штурм')).toBeInTheDocument();
  });

  it('calculates remaining points correctly', () => {
    const armyWithUnits: ArmyUnit[] = [
      {
        instanceId: 'test1',
        type: 'squad',
        data: mockSquads[0],
      },
    ];

    render(
      <UnitSelector
        factions={mockFactions}
        squads={mockSquads}
        selectedFaction="polaris"
        pointBudget={500}
        army={armyWithUnits}
        onAddUnit={mockAdd}
        onRemoveUnit={mockRemove}
        onToBattle={mockToBattle}
      />
    );

    expect(screen.getByText('Осталось очков: 450 / 500')).toBeInTheDocument();
  });

  it('prevents adding units over budget', () => {
    render(
      <UnitSelector
        factions={mockFactions}
        squads={mockSquads}
        selectedFaction="polaris"
        pointBudget={30}
        army={mockArmy}
        onAddUnit={mockAdd}
        onRemoveUnit={mockRemove}
        onToBattle={mockToBattle}
      />
    );

    // Try to add 50-point unit when budget is 30
    fireEvent.click(screen.getAllByText('Добавить')[0]);

    // Warning should appear
    expect(screen.getByText('Недостаточно очков')).toBeInTheDocument();
    // Unit should not be added
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('enables "В бой" button when army has units', () => {
    const armyWithUnits: ArmyUnit[] = [
      {
        instanceId: 'test1',
        type: 'squad',
        data: mockSquads[0],
      },
    ];

    render(
      <UnitSelector
        factions={mockFactions}
        squads={mockSquads}
        selectedFaction="polaris"
        pointBudget={500}
        army={armyWithUnits}
        onAddUnit={mockAdd}
        onRemoveUnit={mockRemove}
        onToBattle={mockToBattle}
      />
    );

    const battleButton = screen.getByText('В бой');
    expect(battleButton).not.toBeDisabled();
  });

  it('displays empty army message when army is empty', () => {
    render(
      <UnitSelector
        factions={mockFactions}
        squads={mockSquads}
        selectedFaction="polaris"
        pointBudget={500}
        army={mockArmy}
        onAddUnit={mockAdd}
        onRemoveUnit={mockRemove}
        onToBattle={mockToBattle}
      />
    );

    expect(screen.getByText('Армия пуста')).toBeInTheDocument();
  });
});
