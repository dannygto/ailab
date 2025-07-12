export {};

/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toHaveClass(className: string): R;
    toHaveValue(value: any): R;
    toHaveAttribute(attr: string, value?: any): R;
    toBeCheckIconed(): R;
    toBePartiallyCheckIconed(): R;
    toHaveFocus(): R;
    toHaveStyle(style: Record<string, any>): R;
  }
}
