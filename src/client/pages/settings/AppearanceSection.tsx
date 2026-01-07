import React from 'react';
import { Sun, Moon, Monitor, Smartphone } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

export const AppearanceSection: React.FC = () => {
    const { theme, setTheme, isDark, isAmoled, toggleAmoled } = useTheme();

    return (
        <div className="space-y-6">
            {/* Theme Mode */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Theme Mode</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose how Pabili looks to you</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = theme === option.value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className={cn(
                                    "text-xs font-medium",
                                    isSelected ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* AMOLED Mode */}
            <div className={cn(
                "flex items-center justify-between p-4 rounded-xl border border-border/50 transition-opacity",
                !isDark && "opacity-50 pointer-events-none"
            )}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-border/50">
                        <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <Label htmlFor="amoled-mode" className="text-sm font-semibold cursor-pointer">
                            AMOLED Dark Mode
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            True black background for OLED screens
                        </p>
                    </div>
                </div>
                <Switch
                    id="amoled-mode"
                    checked={isAmoled}
                    onCheckedChange={toggleAmoled}
                    disabled={!isDark}
                />
            </div>

            {!isDark && (
                <p className="text-xs text-muted-foreground text-center italic">
                    AMOLED mode is only available in Dark mode
                </p>
            )}
        </div>
    );
};
