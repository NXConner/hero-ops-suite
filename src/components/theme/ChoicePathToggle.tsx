import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAdvancedTheme } from '@/contexts/AdvancedThemeContext';
import { Shuffle, Ghost, Flame, Building2, Radiation } from 'lucide-react';

const LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  stealth: { label: 'Stealth', icon: <Ghost className="h-3 w-3" /> },
  aggressive: { label: 'Aggressive', icon: <Flame className="h-3 w-3" /> },
  corporate: { label: 'Corporate', icon: <Building2 className="h-3 w-3" /> },
  anarchist: { label: 'Anarchist', icon: <Radiation className="h-3 w-3" /> },
};

export function ChoicePathToggle() {
  const { choicePath, setChoicePath, currentTheme } = useAdvancedTheme();

  const activeLabel = choicePath && LABELS[choicePath] ? LABELS[choicePath].label : 'Neutral';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Shuffle className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Choice path</span>
          {choicePath && (
            <Badge variant="secondary" className="absolute -bottom-1 -right-1 h-4 px-1 text-[10px] leading-3">
              {activeLabel}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Choice Path</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setChoicePath(null)} className="flex items-center gap-2">
          <Shuffle className="h-3 w-3" />
          Neutral
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {Object.entries(LABELS).map(([key, meta]) => (
          <DropdownMenuItem key={key} onClick={() => setChoicePath(key)} className="flex items-center gap-2">
            {meta.icon}
            {meta.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ChoicePathToggle;

