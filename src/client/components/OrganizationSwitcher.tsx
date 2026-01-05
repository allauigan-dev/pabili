import React from "react";
import { useActiveOrganization, authClient } from "../lib/auth-client";
import { Building2, PlusCircle, ChevronDown, Check } from "lucide-react";

export function OrganizationSwitcher() {
    const { data: activeOrg } = useActiveOrganization();
    const [orgs, setOrgs] = React.useState<any[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);

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
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Building2 size={18} />
                </div>
                <span className="flex-1 text-left truncate max-w-[150px]">
                    {activeOrg?.name || "Select Organization"}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Organizations
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {orgs.map((org) => (
                                <button
                                    key={org.id}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                                    onClick={() => handleSwitchOrg(org.id)}
                                >
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold">
                                        {org.name.charAt(0)}
                                    </div>
                                    <span className={`flex-1 font-medium ${activeOrg?.id === org.id ? 'text-blue-600' : 'text-slate-700'}`}>
                                        {org.name}
                                    </span>
                                    {activeOrg?.id === org.id && <Check size={16} className="text-blue-600" />}
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors font-medium text-sm"
                                onClick={handleCreateOrg}
                            >
                                <PlusCircle size={18} />
                                Create New Organization
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
