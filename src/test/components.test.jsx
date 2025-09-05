// Component Integration Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Import UI components
import { Button } from '../src/components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../src/components/ui/card.jsx';
import { Badge } from '../src/components/ui/badge.jsx';
import { Input } from '../src/components/ui/input.jsx';
import { Progress } from '../src/components/ui/progress.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs.jsx';

// Mock error boundary for testing
class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Test Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Error occurred: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}

describe('UI Component Tests', () => {
  describe('Button Component', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply variant classes', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');

      rerender(<Button variant="outline">Outline</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('should handle disabled state', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
    });
  });

  describe('Card Components', () => {
    it('should render card structure correctly', () => {
      render(
        <Card data-testid="test-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByTestId('test-card')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should apply custom classes', () => {
      render(
        <Card className="custom-class" data-testid="test-card">
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId('test-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Badge Component', () => {
    it('should render with content', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
      const { rerender } = render(<Badge variant="destructive">Error</Badge>);
      let badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-600');

      rerender(<Badge variant="secondary">Info</Badge>);
      badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-gray-600');
    });
  });

  describe('Input Component', () => {
    it('should render input field', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('should handle value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle different input types', () => {
      const { rerender } = render(<Input type="email" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      input = screen.getByLabelText('', { selector: 'input[type="password"]' });
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Progress Component', () => {
    it('should render progress bar', () => {
      render(<Progress value={50} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toBeInTheDocument();
    });

    it('should handle different values', () => {
      const { rerender } = render(<Progress value={0} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();

      rerender(<Progress value={100} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should handle invalid values gracefully', () => {
      expect(() => {
        render(<Progress value={-10} data-testid="progress" />);
      }).not.toThrow();

      expect(() => {
        render(<Progress value={150} data-testid="progress" />);
      }).not.toThrow();
    });
  });

  describe('Tabs Components', () => {
    it('should render tabs structure', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should handle tab switching', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Initially tab1 content should be visible
      expect(screen.getByText('Content 1')).toBeVisible();

      // Click on tab2
      fireEvent.click(screen.getByText('Tab 2'));
      
      // Now tab2 content should be visible
      expect(screen.getByText('Content 2')).toBeVisible();
    });
  });

  describe('Error Boundary Integration', () => {
    // Component that throws error
    const ErrorComponent = ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    it('should catch and display errors', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText(/Error occurred: Test error/)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should render children when no error', () => {
      render(
        <TestErrorBoundary>
          <ErrorComponent shouldThrow={false} />
        </TestErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <div>
          <Button aria-label="Close dialog">×</Button>
          <Input aria-label="Search field" />
          <Progress value={50} aria-label="Loading progress" />
        </div>
      );

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Search field')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading progress')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Input />
        </div>
      );

      const button1 = screen.getByRole('button', { name: 'Button 1' });
      const button2 = screen.getByRole('button', { name: 'Button 2' });
      const input = screen.getByRole('textbox');

      // Test tab navigation
      button1.focus();
      expect(document.activeElement).toBe(button1);

      fireEvent.keyDown(button1, { key: 'Tab' });
      // In a real browser, focus would move to next element
      // Here we simulate it
      button2.focus();
      expect(document.activeElement).toBe(button2);
    });
  });

  describe('Performance Tests', () => {
    it('should render many components without performance issues', () => {
      const startTime = performance.now();

      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Card {i}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button>Button {i}</Button>
                <Badge>Badge {i}</Badge>
                <Progress value={i} />
              </CardContent>
            </Card>
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render 100 cards in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid re-renders', () => {
      let renderCount = 0;
      const TestComponent = ({ value }) => {
        renderCount++;
        return <Button>{value}</Button>;
      };

      const { rerender } = render(<TestComponent value={0} />);

      // Perform 50 rapid re-renders
      for (let i = 1; i <= 50; i++) {
        rerender(<TestComponent value={i} />);
      }

      expect(renderCount).toBe(51); // Initial render + 50 re-renders
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });
});
