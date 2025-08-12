import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAdvancedTheme } from "@/contexts/AdvancedThemeContext";
import { hslToString } from "@/lib/theme-utils";
import { Palette, Check, Settings, Wand2, Sun, Moon, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

export function AdvancedThemeToggle() {
  const { currentTheme, availableThemes, setTheme, isLoading } = useAdvancedTheme();

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Palette className="h-[1.2rem] w-[1.2rem] animate-spin" />
        <span className="sr-only">Loading themes</span>
      </Button>
    );
  }

  const groupedThemes = availableThemes.reduce(
    (acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = [];
      }
      acc[theme.category].push(theme);
      return acc;
    },
    {} as Record<string, typeof availableThemes>,
  );

  const categoryIcons = {
    military: <Monitor className="h-3 w-3" />,
    asphalt: <Settings className="h-3 w-3" />,
    construction: <Settings className="h-3 w-3" />,
    nature: <Sun className="h-3 w-3" />,
    tech: <Wand2 className="h-3 w-3" />,
    abstract: <Palette className="h-3 w-3" />,
    corporate: <Monitor className="h-3 w-3" />,
    custom: <Wand2 className="h-3 w-3" />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
          {/* Current theme indicator */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background"
            style={{
              backgroundColor: hslToString(
                currentTheme?.colors.primary || { h: 220, s: 100, l: 50 },
              ),
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Select Theme</span>
          <Link to="/theme-customizer">
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Wand2 className="h-3 w-3 mr-1" />
              Customize
            </Button>
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(groupedThemes).map(([category, themes]) => (
          <div key={category}>
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              {categoryIcons[category as keyof typeof categoryIcons]}
              {category}
            </DropdownMenuLabel>
            {themes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className="flex items-center justify-between p-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Theme color preview */}
                  <div className="flex gap-1">
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: hslToString(theme.colors.background) }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: hslToString(theme.colors.primary) }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: hslToString(theme.colors.accent) }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-sm">{theme.name}</div>
                    <div className="text-xs text-muted-foreground">{theme.description}</div>
                    <div className="flex gap-1 mt-1">
                      {theme.featured && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          Featured
                        </Badge>
                      )}
                      {theme.baseMode && (
                        <Badge variant="outline" className="text-xs h-4 px-1">
                          {theme.baseMode === "dark" ? (
                            <Moon className="h-2 w-2" />
                          ) : (
                            <Sun className="h-2 w-2" />
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {currentTheme?.id === theme.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}

        <DropdownMenuLabel className="text-center">
          <Link to="/theme-customizer">
            <Button variant="ghost" className="w-full">
              <Wand2 className="h-4 w-4 mr-2" />
              Create Custom Theme
            </Button>
          </Link>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AdvancedThemeToggle;
