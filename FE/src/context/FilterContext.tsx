import * as React from "react";
import type { AlumniProfile, AlumniFullProfile } from "../types/api";

export interface GlobalFilters {
    programme: string;
    graduationFrom: string;
    graduationTo: string;
    industrySector: string;
}

interface FilterContextType {
    filters: GlobalFilters;
    setFilters: (filters: GlobalFilters) => void;
    updateFilter: (key: keyof GlobalFilters, value: string) => void;
    resetFilters: () => void;
    applyFiltersToProfiles: (profiles: AlumniProfile[]) => AlumniProfile[];
    applyFiltersToDetails: (details: AlumniFullProfile[]) => AlumniFullProfile[];
}

const defaultFilters: GlobalFilters = {
    programme: "all",
    graduationFrom: "",
    graduationTo: "",
    industrySector: "all",
};

const FilterContext = React.createContext<FilterContextType>({
    filters: defaultFilters,
    setFilters: () => { },
    updateFilter: () => { },
    resetFilters: () => { },
    applyFiltersToProfiles: (profiles) => profiles,
    applyFiltersToDetails: (details) => details,
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = React.useState<GlobalFilters>(defaultFilters);

    const updateFilter = React.useCallback((key: keyof GlobalFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = React.useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    const applyFiltersToProfiles = React.useCallback(
        (profiles: AlumniProfile[]) => {
            return profiles.filter((profile) => {
                const programme = (profile.programme || profile.degree || "Unknown") as string;
                const industry = (profile.industry_sector || "Unknown") as string;

                const matchesProgramme = filters.programme === "all" || programme === filters.programme;
                const matchesIndustry = filters.industrySector === "all" || industry === filters.industrySector;

                const gradDate = profile.graduation_date ? new Date(profile.graduation_date) : null;
                const fromOk = !filters.graduationFrom || (gradDate ? gradDate >= new Date(filters.graduationFrom) : true);
                const toOk = !filters.graduationTo || (gradDate ? gradDate <= new Date(filters.graduationTo) : true);

                return matchesProgramme && matchesIndustry && fromOk && toOk;
            });
        },
        [filters],
    );

    const applyFiltersToDetails = React.useCallback(
        (details: AlumniFullProfile[]) => {
            return details.filter((detail) => {
                const programme = (detail.programme || detail.degree || "Unknown") as string;
                const industry = (detail.industry_sector || "Unknown") as string;

                const matchesProgramme = filters.programme === "all" || programme === filters.programme;
                const matchesIndustry = filters.industrySector === "all" || industry === filters.industrySector;

                const gradDate = detail.graduation_date ? new Date(detail.graduation_date) : null;
                const fromOk = !filters.graduationFrom || (gradDate ? gradDate >= new Date(filters.graduationFrom) : true);
                const toOk = !filters.graduationTo || (gradDate ? gradDate <= new Date(filters.graduationTo) : true);

                return matchesProgramme && matchesIndustry && fromOk && toOk;
            });
        },
        [filters],
    );

    const value = React.useMemo(
        () => ({
            filters,
            setFilters,
            updateFilter,
            resetFilters,
            applyFiltersToProfiles,
            applyFiltersToDetails,
        }),
        [filters, updateFilter, resetFilters, applyFiltersToProfiles, applyFiltersToDetails],
    );

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
    return React.useContext(FilterContext);
}
