export const toSet = (input?: string[] | string) => {
    if (input === undefined) return undefined;
    const ids = Array.isArray(input) ? input : input ? [input] : [];
    const uniq = Array.from(new Set(ids.filter(Boolean)));
    return { set: uniq.map(id => ({ id })) };
};