import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Palette, Building2, ChevronRight, Navigation } from 'lucide-react';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProfileSection } from './ProfileSection';
import { AppearanceSection } from './AppearanceSection';
import { OrganizationSection } from './OrganizationSection';
import { NavigationSection } from './NavigationSection';

type SettingsTab = 'profile' | 'appearance' | 'navigation' | 'organization';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your account info' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
    { id: 'navigation', label: 'Navigation', icon: Navigation, description: 'Customize bottom nav' },
    { id: 'organization', label: 'Organization', icon: Building2, description: 'Team and business settings' },
];

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);

    const handleBack = () => {
        if (activeTab) {
            setActiveTab(null);
        } else {
            navigate(-1);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSection />;
            case 'appearance':
                return <AppearanceSection />;
            case 'navigation':
                return <NavigationSection />;
            case 'organization':
                return <OrganizationSection />;
            default:
                return null;
        }
    };

    const activeTabData = tabs.find((t) => t.id === activeTab);

    // Mobile: Show tab list or active section
    // Desktop: Show split view with sidebar
    return (
        <div className="pb-24">
            <HeaderContent
                title={activeTab ? activeTabData?.label || 'Settings' : 'Settings'}
                actions={
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-9 w-9 rounded-full"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                }
            />

            <main className="pt-2">
                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-6">
                    {/* Sidebar */}
                    <div className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "bg-surface-light dark:bg-surface-dark hover:bg-muted border border-border/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        isActive
                                            ? "bg-primary-foreground/20"
                                            : "bg-muted"
                                    )}>
                                        <Icon className={cn("h-5 w-5", isActive ? "" : "text-muted-foreground")} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{tab.label}</p>
                                        <p className={cn(
                                            "text-xs",
                                            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                                        )}>
                                            {tab.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-border/50 min-h-[400px]">
                        {activeTab ? (
                            renderContent()
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <User className="h-8 w-8 opacity-30" />
                                </div>
                                <p className="text-sm">Select a setting to get started</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden">
                    {activeTab ? (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-5 shadow-soft border border-border/50">
                            {renderContent()}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className="w-full flex items-center gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-border/50 text-left group hover:border-primary/30 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground">{tab.label}</p>
                                            <p className="text-xs text-muted-foreground">{tab.description}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
