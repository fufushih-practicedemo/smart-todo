'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getLabels } from '@/actions/label';
import { Input } from '../ui/input';

interface Label {
  id: string;
  name: string;
  type: string;
}

interface LabelInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const getLabelColor = (type: string) => {
  switch (type.toLowerCase()) {
  case 'priority':
    return 'bg-red-100 text-red-800 border-red-200';
  case 'status':
    return 'bg-blue-100 text-blue-800 border-blue-200';
  case 'category':
    return 'bg-green-100 text-green-800 border-green-200';
  default:
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const LabelInput: React.FC<LabelInputProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);

  useEffect(() => {
    const fetchLabels = async () => {
      const response = await getLabels();
      if (response.status === 'success') {
        setAvailableLabels(response.data);
      }
    };
    fetchLabels();
  }, []);

  const handleSelect = (label: string) => {
    if (!value.includes(label)) {
      onChange([...value, label]);
    }
    setOpen(false);
  };

  const handleRemove = (labelToRemove: string) => {
    onChange(value.filter(label => label !== labelToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search) {
      e.preventDefault();
      if (!value.includes(search)) {
        onChange([...value, search]);
      }
      setSearch('');
    }
  };

  // Group labels by type
  const groupedLabels = availableLabels.reduce((acc, label) => {
    acc[label.type] = acc[label.type] || [];
    acc[label.type].push(label);
    return acc;
  }, {} as Record<string, Label[]>);

  const filteredLabels = availableLabels.filter(label => 
    label.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search && filteredLabels.length === 0) {
      e.preventDefault();
      if (!value.includes(search)) {
        handleSelect(search);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((labelName) => {
          const label = availableLabels.find(l => l.name === labelName);
          return (
            <Badge
              key={labelName}
              className={`${label ? getLabelColor(label.type) : 'bg-gray-100'} flex items-center gap-1 px-3 py-1`}
              variant="outline"
            >
              {labelName}
              <button
                type="button"
                onClick={() => handleRemove(labelName)}
                className="ml-1 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </Badge>
          );
        })}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            placeholder="搜尋或添加標籤"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[200px] overflow-hidden" 
          side="top" 
          align="start"
        >
          <Command onKeyDown={handleCommandKeyDown}>
            <CommandInput 
              placeholder="搜尋標籤..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>
              <div className="py-3 px-4">
                <p className="text-sm text-muted-foreground">
                  未找到標籤 - 按下 Enter 創建
                </p>
              </div>
            </CommandEmpty>
            <div className="max-h-[200px] overflow-y-auto">
              {Object.entries(groupedLabels).map(([type, labels]) => (
                <CommandGroup key={type} heading={type}>
                  {labels.filter(label => 
                    label.name.toLowerCase().includes(search.toLowerCase())
                  ).map((label) => (
                    <CommandItem
                      key={label.id}
                      onSelect={() => handleSelect(label.name)}
                    >
                      <Badge 
                        variant="outline"
                        className={`${getLabelColor(label.type)}`}
                      >
                        {label.name}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
