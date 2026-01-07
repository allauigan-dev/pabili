import React from "react";
import { useActiveOrganization, authClient } from "../lib/auth-client";
import { Building2, PlusCircle, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface OrganizationSwitcherProps {
    isCollapsed?: boolean;
}

export function OrganizationSwitcher({ isCollapsed }: OrganizationSwitcherProps) {
    const { data: activeOrg } = useActiveOrganization();
    const [orgs, setOrgs] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchOrgs = async () => {
            const result = await authClient.organization.list();
            setOrgs(result.data || []);
        };
        fetchOrgs();
    }, []);

    const handleCreateOrg = async () => {
        const name = prompt("Enter organization name");
        if (name) {
            await authClient.organization.create({
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-'),
            });
            window.location.reload();
        }
    };

    const handleSwitchOrg = async (id: string) => {
        await authClient.organization.setActive({
            organizationId: id,
        });
        window.location.reload();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex items-center bg-card border border-border/50 rounded-lg text-foreground font-medium hover:bg-accent transition-all shadow-sm w-full outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                        isCollapsed ? "justify-center p-2" : "gap-2 px-3 py-2"
                    )}
                    title={isCollapsed ? activeOrg?.name || "Select Organization" : undefined}
                >
                    <div className="w-8 h-8 bg-primary/10 shrink-0 rounded-lg flex items-center justify-center text-primary transition-colors">
                        <Building2 size={18} />
                    </div>
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left truncate text-sm">
                                {activeOrg?.name || "Select Organization"}
                            </span>
                            <ChevronDown size={14} className="text-muted-foreground transition-transform shrink-0" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side={isCollapsed ? "right" : "bottom"}
                align={isCollapsed ? "start" : "center"}
                sideOffset={isCollapsed ? 12 : 8}
                className="w-64 max-h-80 overflow-y-auto no-scrollbar rounded-xl shadow-xl z-[70]"
            >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                    Organizations
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-y-auto no-scrollbar">
                    {orgs.map((org) => (
                        <DropdownMenuItem
                            key={org.id}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer focus:bg-accent rounded-lg mx-1 my-0.5"
                            onClick={() => handleSwitchOrg(org.id)}
                        >
                            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-foreground font-bold shrink-0">
                                {org.name.charAt(0)}
                            </div>
                            <span className={cn(
                                "flex-1 font-medium truncate",
                                activeOrg?.id === org.id ? 'text-primary' : 'text-foreground'
                            )}>
                                {org.name}
                            </span>
                            {activeOrg?.id === org.id && <Check size={16} className="text-primary shrink-0" />}
                        </DropdownMenuItem>
                    ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer text-primary focus:bg-primary/5 rounded-lg mx-1 my-0.5 font-medium"
                    onClick={handleCreateOrg}
                >
                    <PlusCircle size={18} className="shrink-0" />
                    <span>Create New Organization</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
