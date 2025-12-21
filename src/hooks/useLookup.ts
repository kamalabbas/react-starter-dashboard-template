import { LookupDomain } from "@/interface/enums";
import { getLookups } from "@/services/lookupService";
import { useQuery } from "@tanstack/react-query";

export const useLookup = (domainList: LookupDomain[]) => {
    const query = useQuery({
        queryKey: ['lookups', domainList],
        queryFn: () => getLookups(domainList),
        retry: 0,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
    });

    // Helper: get all lookups for a given domain code
    const getDomain = (domainCode: LookupDomain) => {
        const list = query.data?.data?.lookupList || (query.data as any)?.lookupList;
        if (!Array.isArray(list)) return [];
        return list.filter((item: any) => String(item.domain) === String(domainCode));
    };

    return {
        ...query,
        getDomain,
    };
}

