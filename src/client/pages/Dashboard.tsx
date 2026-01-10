import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History,
    Pencil,
    CreditCard,
    RotateCcw,
    Package,
    Users,
    Store as StoreIcon,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApi } from '@/hooks/useApi';
import { statsApi } from '@/lib/api';

import { useActivities } from '@/hooks/useActivities';
import { useSession } from '@/lib/auth-client';
import { HeaderContent } from '@/components/layout/HeaderProvider';
import { useDashboardActions } from '@/hooks/useDashboardActions';
import { useDashboardCards } from '@/hooks/useDashboardCards';
import { QuickActionsReorder } from '@/components/dashboard/QuickActionsReorder';
import { DashboardCardsReorder } from '@/components/dashboard/DashboardCardsReorder';
import { DashboardCardItem } from '@/components/dashboard/DashboardCardItem';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';

type ActivityType = 'order' | 'customer' | 'store' | 'payment';

interface Activity {
    id: number;
    type: ActivityType;
    title: string;
    subtitle: string;
    timestamp: string;
    image?: string | null;
    status?: string;
    navigatePath: string;
    sentence: string;
}

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const { data: stats } = useApi(statsApi.get);

    const { data: activitiesData } = useActivities(10);

    // Get user's first name for greeting
    const userName = session?.user?.name?.split(' ')[0] || 'there';

    // Helper to format activity into a sentence
    const formatActivitySentence = (type: ActivityType, title: string, status: string | undefined | null, action: string | undefined | null, description: string | undefined | null): string => {
        if (type === 'order') {
            if (action === 'created') return `${title} was placed`;
            if (action === 'status_changed') {
                if (status === 'pending') return `${title} is pending`;
                if (status === 'bought') return `${title} is bought`;
                if (status === 'packed') return `${title} is packed`;
                if (status === 'delivered') return `${title} was delivered`;
                if (status === 'cancelled') return `${title} was cancelled`;
                if (status === 'no_stock') return `${title} is out of stock`;
                return `${title} is ${status}`;
            }
            if (action === 'updated') return `${title} details were updated`;
        }

        if (type === 'customer') {
            if (action === 'created') return `${title} added as new customer`;
            if (action === 'updated') return `${title} details were updated`;
        }

        if (type === 'store') {
            if (action === 'created') return `${title} added as new store`;
            if (action === 'updated') return `${title} details were updated`;
            if (action === 'status_changed') return `${title} is now ${status}`;
        }

        if (type === 'payment') {
            if (description) {
                // Capitalize first letter of description
                return description.charAt(0).toUpperCase() + description.slice(1);
            }
            return 'Payment was recorded';
        }

        // Fallback
        if (action === 'deleted') return `${title} was deleted`;
        return `${title} - ${description || ''}`;
    };

    // Map backend activities to UI Activity interface
    const recentActivities = useMemo<Activity[]>(() => {
        if (!activitiesData) return [];

        return activitiesData.map(act => {
            const type = act.type as ActivityType;
            let navigatePath = `/${type}s`;
            if (act.entityId) {
                navigatePath = `/${type}s/${act.entityId}/edit`;
            }

            return {
                id: act.id,
                type,
                title: act.title,
                subtitle: act.description || '',
                timestamp: act.createdAt,
                status: act.status || undefined,
                navigatePath,
                sentence: formatActivitySentence(type, act.title, act.status, act.action, act.description),
            };
        });
    }, [activitiesData]);

    // Get icon component for activity type
    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case 'order': return Package;
            case 'customer': return Users;
            case 'store': return StoreIcon;
            case 'payment': return CreditCard;
        }
    };

    // Get icon background color for activity type
    const getActivityIconBg = (type: ActivityType) => {
        switch (type) {
            case 'order': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400';
            case 'customer': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400';
            case 'store': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400';
            case 'payment': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400';
        }
    };

    // Dashboard cards state
    const { visibleCards, allCards, updateOrder, resetToDefaults: resetCardsToDefaults } = useDashboardCards();
    const [isCardsEditMode, setIsCardsEditMode] = useState(false);

    // Quick actions state
    const { visibleActions, resetToDefaults: resetActionsToDefaults } = useDashboardActions();
    const [isActionsEditMode, setIsActionsEditMode] = useState(false);

    // DnD sensors for cards
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleCardsDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = visibleCards.findIndex((c) => c.id === active.id);
            const newIndex = visibleCards.findIndex((c) => c.id === over.id);

            const newOrder = arrayMove(visibleCards, oldIndex, newIndex);
            // Update the full order based on visible cards new positions
            const hiddenCards = allCards.filter(c => !visibleCards.some(vc => vc.id === c.id));
            const newIds = [...newOrder.map(c => c.id), ...hiddenCards.map(c => c.id)];
            updateOrder(newIds);
        }
    };

    return (
        <div className="pb-10">
            <HeaderContent
                title={`Welcome, ${userName}!`}
                actions={
                    <div className="hidden sm:flex text-[10px] font-bold text-muted-foreground tracking-widest uppercase bg-secondary/80 backdrop-blur-sm px-4 py-1.5 rounded-full border shadow-sm">
                        {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                }
            />

            {/* Stats Cards Section */}
            <section className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Overview</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full"
                        onClick={() => setIsCardsEditMode(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleCardsDragEnd}
                    modifiers={[restrictToParentElement]}
                >
                    <SortableContext
                        items={visibleCards.map(c => c.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {visibleCards.map((card) => (
                                <DashboardCardItem
                                    key={card.id}
                                    card={card}
                                    stats={stats ?? undefined}
                                    compact={visibleCards.length > 4}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {visibleCards.length === 0 && (
                    <div className="text-center py-12 text-sm text-muted-foreground italic bg-muted/20 rounded-2xl">
                        No cards visible. Click the edit button to add cards.
                    </div>
                )}
            </section>

            {/* Quick Actions - Mobile & Tablet */}
            <section className="lg:hidden mb-12">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Actions</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full"
                        onClick={() => setIsActionsEditMode(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
                <div className="relative -mx-4">
                    <div className="flex gap-4 overflow-x-auto px-4 pb-6 no-scrollbar snap-x snap-mandatory">
                        {visibleActions.map((action) => (
                            <button
                                key={action.id}
                                className="snap-start shrink-0 flex flex-col items-center gap-3 group w-24"
                                onClick={() => navigate(action.path)}
                            >
                                <div className={`w-16 h-16 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center shadow-sm group-active:scale-95 group-hover:shadow-md transition-all`}>
                                    <action.icon className="h-8 w-8" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight text-foreground/80 group-hover:text-foreground">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                        <div className="w-4 shrink-0"></div>
                    </div>
                    {/* Fade Indicator to show more content */}
                    <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity Section */}
                <section className="lg:col-span-2">
                    <div className="bg-card rounded-3xl shadow-sm border p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <History className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Recent Activity</h2>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
                                const IconComponent = getActivityIcon(activity.type);
                                return (
                                    <div key={`${activity.type}-${activity.id}`}>
                                        <div
                                            className="flex items-center justify-between cursor-pointer group hover:bg-muted/50 p-2 -m-2 rounded-2xl transition-all"
                                            onClick={() => navigate(activity.navigatePath)}
                                        >
                                            <div className="flex items-center gap-4 sm:gap-5">
                                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-sm transition-transform group-hover:scale-105 ${activity.image ? 'bg-secondary' : getActivityIconBg(activity.type)}`}>
                                                    {activity.image ? (
                                                        <img src={activity.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors">{activity.sentence}</h3>
                                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                        <span>{new Date(activity.timestamp).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                                                        <span>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {index < recentActivities.length - 1 && (
                                            <div className="h-px bg-border/60 w-full my-1"></div>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <History className="h-6 w-6 opacity-20" />
                                    </div>
                                    <p className="italic font-medium">No recent activity found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Quick Actions Section - Desktop */}
                <section className="hidden lg:block">
                    <div className="bg-card rounded-3xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full"
                                onClick={() => setIsActionsEditMode(true)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {visibleActions.map((action) => (
                                <button
                                    key={action.id}
                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-all border-2 border-transparent hover:border-primary/5 group text-left shadow-sm hover:shadow-md"
                                    onClick={() => navigate(action.path)}
                                >
                                    <div className={`w-14 h-14 rounded-2xl shrink-0 ${action.bg} ${action.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                        <action.icon className="h-7 w-7" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                            {action.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-0.5">
                                            Click to perform action
                                        </span>
                                    </div>
                                </button>
                            ))}
                            {visibleActions.length === 0 && (
                                <div className="text-center py-12 text-sm text-muted-foreground italic col-span-full bg-muted/20 rounded-2xl">
                                    No actions visible.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* Cards Edit Dialog */}
            <Dialog open={isCardsEditMode} onOpenChange={setIsCardsEditMode}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Customize Cards</DialogTitle>
                        <DialogDescription>
                            Select which stat cards to display on your dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <DashboardCardsReorder />
                        <div className="mt-6 pt-4 border-t">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={resetCardsToDefaults}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset to Defaults
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Actions Edit Dialog */}
            <Dialog open={isActionsEditMode} onOpenChange={setIsActionsEditMode}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Customize Actions</DialogTitle>
                        <DialogDescription>
                            Select which quick actions to display on your dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <QuickActionsReorder />
                        <div className="mt-6 pt-4 border-t">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={resetActionsToDefaults}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset to Defaults
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

