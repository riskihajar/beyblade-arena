import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxPopup,
    ComboboxValue,
} from '@/components/ui/combobox';
import { useEffect, useState } from 'react';

interface User {
    value: string;
    label: string;
}

interface AsyncUserComboboxProps {
    value?: string[];
    onValueChange: (value: string[]) => void;
    placeholder?: string;
    defaultItems?: User[];
}

export function AsyncUserCombobox({
    value = [],
    onValueChange,
    placeholder = 'Select users...',
    defaultItems = [],
}: AsyncUserComboboxProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                setLoading(true);
                const url = new URL('/settings/users', window.location.origin);
                url.searchParams.set('search', inputValue);
                url.searchParams.set('per_page', '20');

                fetch(url.toString(), {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (Array.isArray(data)) {
                            setUsers(data);
                        }
                    })
                    .catch((err) => console.error(err))
                    .finally(() => setLoading(false));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue, open]);

    // Build items list, merging defaultItems with fetched users
    const items = (() => {
        const allItems = [...defaultItems];
        users.forEach((user) => {
            if (!allItems.some((item) => item.value === user.value)) {
                allItems.push(user);
            }
        });
        return allItems;
    })();

    // Convert string[] to User[] for the combobox value
    const selectedItems = items.filter((item) => value.includes(item.value));

    return (
        <Combobox
            multiple
            items={items}
            value={selectedItems}
            onValueChange={(newValue) => {
                const newIds = (newValue as User[]).map((item) => item.value);
                onValueChange(newIds);
            }}
            open={open}
            onOpenChange={setOpen}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
        >
            <ComboboxChips>
                <ComboboxValue>
                    {(selected: User[]) => (
                        <>
                            {selected?.map((item) => (
                                <ComboboxChip
                                    key={item.value}
                                    aria-label={item.label}
                                >
                                    {item.label}
                                </ComboboxChip>
                            ))}
                            <ComboboxInput
                                placeholder={
                                    selected.length > 0
                                        ? undefined
                                        : placeholder
                                }
                                aria-label="Select users"
                                showTrigger={selected.length === 0}
                            />
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxPopup>
                {loading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : items.length === 0 ? (
                    <ComboboxEmpty>No users found.</ComboboxEmpty>
                ) : (
                    <ComboboxList>
                        {(item: User) => (
                            <ComboboxItem key={item.value} value={item}>
                                {item.label}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                )}
            </ComboboxPopup>
        </Combobox>
    );
}
