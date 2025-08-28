'use client';

export const FormItem = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium mb-1">
    {children}
  </label>
);

export const FormControl = ({ as: Component = 'input', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { as?: React.ElementType }) => (
  <Component
    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  />
);

export const FormMessage = ({ children }: { children: React.ReactNode }) => (
  <p className="text-red-500 text-sm mt-1">
    {children}
  </p>
);