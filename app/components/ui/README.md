# shadcn/ui Components

This directory contains all shadcn/ui components configured for the User Management Application.

## Installed Components

### Core UI Components
- **Button** - Versatile button component with multiple variants (default, destructive, outline, secondary, ghost, link)
- **Input** - Text input field with validation states
- **Label** - Form label component
- **Select** - Dropdown select component with keyboard navigation
- **Table** - Data table components (Table, TableHeader, TableBody, TableRow, TableCell, etc.)

### Dialog Components
- **Dialog** - Modal dialog for forms and content
- **Alert Dialog** - Confirmation dialog for destructive actions

### Form Components
- **Form** - Form wrapper with React Hook Form integration
- **FormField** - Individual form field with validation
- **FormItem** - Form field container
- **FormLabel** - Form field label
- **FormControl** - Form control wrapper
- **FormDescription** - Helper text for form fields
- **FormMessage** - Error message display

### Notification Components
- **Toaster (Sonner)** - Toast notification system

## Usage with React Hook Form and Zod

All form components are pre-configured to work seamlessly with React Hook Form and Zod validation.

### Basic Form Example

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Define Zod schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormValues = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: FormValues) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Select Field Example

```tsx
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Dialog with Form Example

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create User</DialogTitle>
      <DialogDescription>
        Add a new user to the system
      </DialogDescription>
    </DialogHeader>
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields here */}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

### Alert Dialog Example

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the user.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Toast Notifications

```tsx
import { toast } from "sonner"

// Success toast
toast.success("User created successfully")

// Error toast
toast.error("Failed to create user")

// Info toast
toast.info("Processing request...")

// Loading toast
toast.loading("Creating user...")
```

## Component Variants

### Button Variants
- `default` - Primary action button
- `destructive` - Dangerous actions (delete, remove)
- `outline` - Secondary actions
- `secondary` - Alternative secondary style
- `ghost` - Minimal style for tertiary actions
- `link` - Text link style

### Button Sizes
- `default` - Standard size (h-9)
- `sm` - Small size (h-8)
- `lg` - Large size (h-10)
- `icon` - Square icon button (size-9)

## Styling

All components use Tailwind CSS with CSS variables for theming. The design system follows the "New York" style from shadcn/ui with neutral base colors.

## Adding New Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
```

## References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Radix UI Documentation](https://www.radix-ui.com)
