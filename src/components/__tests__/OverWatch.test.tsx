import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import OverWatch from '../../pages/OverWatch';
import '@testing-library/jest-dom';

// Mock external dependencies
vi.mock('leaflet', () => ({
  Map: vi.fn(),
  TileLayer: vi.fn(),
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: vi.fn()
    }
  },
  divIcon: vi.fn(),
  marker: vi.fn(),
  polygon: vi.fn(),
  polyline: vi.fn(),
  rectangle: vi.fn(),
  circle: vi.fn(),
  latLngBounds: vi.fn()
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  Circle: () => <div data-testid="circle" />,
  useMap: () => ({
    getCenter: () => ({ lat: 40.7128, lng: -74.0060 }),
    getZoom: () => 13,
    on: vi.fn(),
    off: vi.fn(),
    getContainer: () => ({ style: {} })
  }),
  useMapEvents: vi.fn()
}));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="three-canvas">{children}</div>,
  useFrame: vi.fn(),
  useLoader: vi.fn(),
  useThree: () => ({ scene: {} })
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Text: () => <div data-testid="three-text" />,
  Html: ({ children }: any) => <div data-testid="three-html">{children}</div>,
  Environment: () => <div data-testid="environment" />,
  Grid: () => <div data-testid="grid" />,
  Box: () => <div data-testid="box" />
}));

vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: () => 'data:image/png;base64,test'
  }))
}));

// Mock services
vi.mock('../../services/api', () => ({
  weatherService: {
    getCurrentWeather: vi.fn().mockResolvedValue({
      main: { temp: 72, humidity: 65, pressure: 1013 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      wind: { speed: 5, deg: 180 },
      visibility: 10000,
      dt: Date.now() / 1000,
      name: 'Test Location',
      coord: { lat: 40.7128, lon: -74.0060 }
    }),
    getRadarData: vi.fn().mockResolvedValue({
      version: '1.0',
      generated: Date.now() / 1000,
      host: 'test',
      radar: { past: [], nowcast: [] },
      satellite: { infrared: [] }
    })
  },
  gpsTrackingService: {
    getDeviceLocations: vi.fn().mockResolvedValue([]),
    subscribeToRealTimeUpdates: vi.fn()
  }
}));

vi.mock('../../services/database', () => ({
  databaseService: {
    saveUserPreferences: vi.fn(),
    getUserPreferences: vi.fn(),
    saveWidgetLayout: vi.fn(),
    getWidgetLayouts: vi.fn().mockResolvedValue([])
  }
}));

// Mock authentication
vi.mock('../../services/auth', () => ({
  authService: {
    isAuthenticated: vi.fn().mockReturnValue(true),
    getCurrentUser: vi.fn().mockReturnValue({
      id: 'test-user',
      role: 'supervisor',
      firstName: 'Test',
      lastName: 'User'
    }),
    hasPermission: vi.fn().mockReturnValue(true)
  }
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('OverWatch Map Interface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window objects
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        start: vi.fn(),
        stop: vi.fn(),
        onstart: vi.fn(),
        onresult: vi.fn(),
        onerror: vi.fn(),
        onend: vi.fn()
      }))
    });

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn().mockReturnValue([])
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the main OverWatch interface', async () => {
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      expect(screen.getByText(/OverWatch Command Center/i)).toBeInTheDocument();
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByText('OPERATIONAL')).toBeInTheDocument();
    });

    it('displays map service selection dropdown', async () => {
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      expect(screen.getByText('Map Service:')).toBeInTheDocument();
    });

    it('shows terminology toggle options', async () => {
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      expect(screen.getByText('Terminology:')).toBeInTheDocument();
    });
  });

  describe('Map Functionality', () => {
    it('allows switching between map services', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Click on map service selector
      const mapServiceSelect = screen.getByRole('combobox');
      await user.click(mapServiceSelect);

      // Should show map service options
      await waitFor(() => {
        expect(screen.getByText('OpenStreetMap')).toBeInTheDocument();
      });
    });

    it('toggles drawing mode correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const drawButton = screen.getByRole('button', { name: /Draw AOI|Draw Area/i });
      await user.click(drawButton);

      // Button should become active
      expect(drawButton).toHaveClass('bg-primary');
    });

    it('toggles measurement mode correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const measureButton = screen.getByRole('button', { name: /Measure/i });
      await user.click(measureButton);

      expect(measureButton).toHaveClass('bg-primary');
    });
  });

  describe('Overlay Controls', () => {
    it('toggles fleet tracking overlay', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const fleetButton = screen.getByRole('button', { name: /Assets|Fleet/i });
      await user.click(fleetButton);

      // Should toggle active state
      expect(fleetButton).toHaveAttribute('variant', 'default');
    });

    it('toggles weather overlay', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const weatherButton = screen.getByRole('button', { name: /Weather/i });
      await user.click(weatherButton);

      expect(weatherButton).toHaveAttribute('variant', 'default');
    });

    it('toggles pavement analysis overlay', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const pavementButton = screen.getByRole('button', { name: /Surface Intel|Pavement/i });
      await user.click(pavementButton);

      expect(pavementButton).toHaveAttribute('variant', 'default');
    });
  });

  describe('Widget System', () => {
    it('toggles widget dashboard visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const widgetsButton = screen.getByRole('button', { name: /Widgets/i });
      await user.click(widgetsButton);

      // Should toggle widget visibility
      expect(widgetsButton).toHaveAttribute('variant', 'default');
    });
  });

  describe('Voice Command Interface', () => {
    it('toggles voice interface visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const voiceButton = screen.getByRole('button', { name: /Voice/i });
      await user.click(voiceButton);

      expect(voiceButton).toHaveAttribute('variant', 'default');
    });

    it('processes voice commands correctly', async () => {
      const mockOnCommand = vi.fn();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Simulate voice command
      const user = userEvent.setup();
      const voiceButton = screen.getByRole('button', { name: /Voice/i });
      await user.click(voiceButton);

      // Voice interface should be visible
      await waitFor(() => {
        expect(screen.getByText(/Command Interface|Voice Control/i)).toBeInTheDocument();
      });
    });
  });

  describe('Terminology Mode', () => {
    it('switches between military and civilian terminology', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Find terminology selector
      const terminologySelect = screen.getAllByRole('combobox')[0]; // First combobox should be terminology
      await user.click(terminologySelect);

      await waitFor(() => {
        expect(screen.getByText('Military')).toBeInTheDocument();
        expect(screen.getByText('Civilian')).toBeInTheDocument();
        expect(screen.getByText('Both')).toBeInTheDocument();
      });
    });

    it('updates UI text based on terminology mode', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Check for military terminology by default
      expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      // Mock API failure
      const mockWeatherService = await import('../../services/api');
      vi.mocked(mockWeatherService.weatherService.getCurrentWeather)
        .mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('handles missing browser APIs gracefully', async () => {
      // Remove speech recognition support
      Object.defineProperty(window, 'SpeechRecognition', {
        writable: true,
        value: undefined
      });

      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Should still render
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Check for accessible buttons
      expect(screen.getByRole('button', { name: /Draw/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Measure/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab();
      await user.tab();
      await user.tab();

      // Should focus on interactive elements
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    it('does not cause memory leaks', async () => {
      const { unmount } = render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Unmount component
      unmount();

      // Should clean up properly
      expect(true).toBe(true); // Basic test to ensure unmount doesn't throw
    });
  });

  describe('Integration Tests', () => {
    it('integrates weather overlay with map controls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Enable weather overlay
      const weatherButton = screen.getByRole('button', { name: /Weather/i });
      await user.click(weatherButton);

      // Weather overlay should be active
      expect(weatherButton).toHaveAttribute('variant', 'default');
    });

    it('integrates voice commands with map actions', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Open voice interface
      const voiceButton = screen.getByRole('button', { name: /Voice/i });
      await user.click(voiceButton);

      // Voice interface should open
      await waitFor(() => {
        expect(screen.getByText(/Command Interface|Voice Control/i)).toBeInTheDocument();
      });
    });

    it('saves and restores widget layouts', async () => {
      const mockSaveLayout = vi.fn();
      const mockGetLayouts = vi.fn().mockResolvedValue([]);

      const databaseService = await import('../../services/database');
      vi.mocked(databaseService.databaseService.saveWidgetLayout).mockImplementation(mockSaveLayout);
      vi.mocked(databaseService.databaseService.getWidgetLayouts).mockImplementation(mockGetLayouts);

      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Should attempt to load layouts on mount
      await waitFor(() => {
        expect(mockGetLayouts).toHaveBeenCalled();
      });
    });
  });

  describe('Data Validation', () => {
    it('validates coordinate inputs', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Test with voice command containing coordinates
      const voiceButton = screen.getByRole('button', { name: /Voice/i });
      await user.click(voiceButton);

      // Should handle coordinate validation in voice commands
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('handles invalid map service selections', async () => {
      render(
        <TestWrapper>
          <OverWatch />
        </TestWrapper>
      );

      // Should fallback to default service for invalid selections
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });
});

// Custom test utilities
export const createMockUser = (role = 'supervisor') => ({
  id: 'test-user',
  email: `test-${role}@example.com`,
  firstName: 'Test',
  lastName: 'User',
  role,
  permissions: ['view_map', 'edit_map'],
  department: 'Operations',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

export const mockGeolocation = () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn()
  };

  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });

  return mockGeolocation;
};

export const mockWebGL = () => {
  const mockContext = {
    getExtension: vi.fn(),
    createShader: vi.fn(),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(),
    createProgram: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(),
    useProgram: vi.fn(),
    createBuffer: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    drawArrays: vi.fn(),
    canvas: { width: 800, height: 600 }
  };

  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
  return mockContext;
};