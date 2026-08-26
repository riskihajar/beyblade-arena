{{-- 
Page Structure Guidelines

This document outlines the standard structure for Index (List) and Form (Create/Edit) pages 
in this Inertia React application. Adhering to these patterns ensures UI consistency, 
correct padding, and proper component hierarchy.
--}}

# Page Structure Guidelines

## 1. Index Page Pattern (List View)

Index pages display tabular data with filtering, sorting, and pagination.

### Key Rules
1.  **Container:** Use `container mx-auto px-4 py-8`.
2.  **Header Placement:** The page heading (`<h1>`) and description must be **inside** the main container, not in the `AppLayout` header slot.
3.  **Frame Usage:** The `<Table>` must be wrapped inside a `<Frame>`.
4.  **Pagination:** Placed **outside** the `<Frame>`, immediately following it.

### Template
```tsx
export default function ResourceIndex({ items, filters }: Props) {
    return (
        <AppLayout breadcrumbs={[/* ... */]}>
            {/* 1. Main Container */}
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    
                    {/* 2. Page Header & Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Heading */}
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-semibold">Resource Name</h1>
                            <p className="text-muted-foreground">Description of the resource.</p>
                        </div>
                        
                        {/* Actions (Search, Filter, Export, Create) */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            {/* InputGroup, Filters, Create Button */}
                        </div>
                    </div>

                    {/* 3. Table Container */}
                    <Frame className="w-full">
                        <Table>
                            {/* TableHeader, TableBody... */}
                        </Table>
                    </Frame>

                    {/* 4. Pagination */}
                    <Pagination data={items} />
                </div>
            </div>
        </AppLayout>
    );
}
```

---

## 2. Form Page Pattern (Create / Edit)

Form pages are used for creating or updating resources.
**Always use the Inertia `Form` component** (imported from `@inertiajs/react`) instead of the native `form` element.

### Key Rules
1.  **Container:** Use `max-w-2xl px-4 py-8` (narrower than index).
2.  **Form Component:** Use `<Form>` from `@inertiajs/react`.
    *   Pass `action` and `method` props directly.
    *   For Edit forms, use `method="patch"` directly (NOT hidden `_method` input).
    *   Use Wayfinder for route URLs: `resourceRoutes.store()` (without `.url`).
3.  **No Double Padding:** Do **NOT** add padding classes to the `<Form>` element.
4.  **Render Props:** Always use render props to access form state:
    ```tsx
    <Form action={resourceRoutes.store()} method="post">
        {({ processing, errors }) => (
            // Form content here
        )}
    </Form>
    ```
5.  **Uncontrolled Inputs:** Use `defaultValue` for simple inputs (text, email, etc.).
6.  **Controlled Inputs:** Use `useState` for complex inputs (Combobox, Checkbox) and use `transform` prop to send data.
7.  **Submit Button:** Use `disabled={processing}` to prevent double submissions.
8.  **Error Display:** Show validation errors using the `errors` object from render props.

### Template (Create)
```tsx
import { Form, Head, Link } from '@inertiajs/react';
// ... other imports

export default function ResourceCreate({ /* props */ }) {
    const { routes: resourceRoutes } = /* get routes */;
    // Local state for complex components
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
        <AppLayout breadcrumbs={[/* ... */]}>
            <div className="max-w-2xl px-4 py-8">
                
                {/* 1. Form Component with render props */}
                <Form 
                    action={resourceRoutes.store()} 
                    method="post"
                    transform={(data) => ({
                        ...data,
                        items: selectedItems, // Send controlled state as array
                    })}
                >
                    {({ processing, errors }) => (
                        <>
                            <Frame>
                                <FrameHeader>
                                    {/* Back Button & Title */}
                                </FrameHeader>

                                <FramePanel>
                                    <div className="space-y-6">
                                        <Fieldset>
                                            {/* Simple Input (uncontrolled) */}
                                            <Field name="title" data-invalid={!!errors.title || undefined}>
                                                <FieldLabel htmlFor="title">Title</FieldLabel>
                                                <Input 
                                                    id="title" 
                                                    name="title" 
                                                    defaultValue="" 
                                                    required
                                                    aria-invalid={!!errors.title || undefined}
                                                    aria-describedby={errors.title ? 'title-error' : undefined}
                                                />
                                                <FieldError error={errors.title} id="title-error" />
                                            </Field>

                                            {/* Complex Input (controlled + transform) */}
                                            {/* Use transform prop on Form, NOT hidden inputs */}
                                        </Fieldset>
                                    </div>
                                </FramePanel>
                            </Frame>

                            {/* Actions */}
                            <div className="mt-4 flex gap-3">
                                <Button type="submit" disabled={processing}>Save</Button>
                                <Button variant="outline" render={<Link href={resourceRoutes.index()}>Cancel</Link>} />
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
```

### Template (Edit)
```tsx
export default function ResourceEdit({ resource, /* other props */ }) {
    const { routes: resourceRoutes } = /* get routes */;
    const [selectedItems, setSelectedItems] = useState<string[]>(
        resource.items?.map((i) => i.name) || []
    );

    return (
        <AppLayout breadcrumbs={[/* ... */]}>
            <div className="max-w-2xl px-4 py-8">
                
                {/* Use method="patch" for updates, NOT hidden _method input */}
                <Form 
                    action={resourceRoutes.update({ resource: resource.id })} 
                    method="patch"
                    transform={(data) => ({
                        ...data,
                        items: selectedItems,
                    })}
                >
                    {({ processing, errors }) => (
                        <>
                            <Frame>
                                <FrameHeader>
                                    {/* Back Button & Title */}
                                </FrameHeader>

                                <FramePanel>
                                    <div className="space-y-6">
                                        <Fieldset>
                                            <Field name="title" data-invalid={!!errors.title || undefined}>
                                                <FieldLabel htmlFor="title">Title</FieldLabel>
                                                <Input 
                                                    id="title" 
                                                    name="title" 
                                                    defaultValue={resource.title} // Use defaultValue for edit
                                                    required
                                                    aria-invalid={!!errors.title || undefined}
                                                    aria-describedby={errors.title ? 'title-error' : undefined}
                                                />
                                                <FieldError error={errors.title} id="title-error" />
                                            </Field>
                                        </Fieldset>
                                    </div>
                                </FramePanel>
                            </Frame>

                            <div className="mt-4 flex gap-3">
                                <Button type="submit" disabled={processing}>Update</Button>
                                <Button variant="outline" render={<Link href={resourceRoutes.index()}>Cancel</Link>} />
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
```

---

## 3. Array Inputs (Combobox / Checkbox)

For multi-select fields (Combobox with `multiple` prop) or multiple checkboxes, use controlled components with `transform` prop.

### Combobox (Multi-Select)
```tsx
// Use useState to manage selected values
const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user?.roles?.map((r) => r.name) || []
);

// Use transform prop to send array data
<Form
    action={resourceRoutes.store()}
    method="post"
    transform={(data) => ({
        ...data,
        roles: selectedRoles, // Send controlled state
    })}
>
    {({ processing, errors }) => (
        <>
            {/* Combobox UI */}
            <Combobox
                items={roles}
                multiple
                value={roles.filter((r) => selectedRoles.includes(r.value))}
                onValueChange={(val) => setSelectedRoles(val.map((v) => v.value))}
            >
                {/* ...combobox slots */}
            </Combobox>
        </>
    )}
</Form>
```

### Checkbox Group
```tsx
const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions?.map((p) => p.name) || []
);

<Form
    action={resourceRoutes.update({ resource: resource.id })}
    method="patch"
    transform={(data) => ({
        ...data,
        permissions: selectedPermissions,
    })}
>
    {({ processing, errors }) => (
        <>
            {permissions.map((permission) => (
                <Checkbox
                    key={permission.id}
                    checked={selectedPermissions.includes(permission.name)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedPermissions([...selectedPermissions, permission.name]);
                        } else {
                            setSelectedPermissions(
                                selectedPermissions.filter((p) => p !== permission.name),
                            );
                        }
                    }}
                />
            ))}
        </>
    )}
</Form>
```

---

## 4. Helper Components

### FieldError Component
```tsx
function FieldError({ error, id }: { error?: string; id: string }) {
    if (!error) return null;
    return (
        <p id={id} className="text-sm text-red-500" data-slot="field-error">
            {error}
        </p>
    );
}
```

### Best Practices Summary
| Pattern | Approach |
|---------|----------|
| Simple inputs | Uncontrolled with `defaultValue` |
| Complex inputs (multi-select, checkbox group) | Controlled with `useState` + `transform` |
| HTTP Method | Use `method="patch"` directly, NOT hidden `_method` |
| Errors | Access via render props `errors` |
| Submit state | Use `processing` from render props |
| Routes | Use Wayfinder without `.url` |
