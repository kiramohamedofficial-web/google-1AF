import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient.ts';

type IconSettings = Record<string, string>;

interface IconContextType {
    iconSettings: IconSettings;
    loading: boolean;
    refreshIcons: () => void;
}

const IconContext = createContext<IconContextType>({
    iconSettings: {},
    loading: true,
    refreshIcons: () => {},
});

export const useIcons = () => useContext(IconContext);

export const IconProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [iconSettings, setIconSettings] = useState<IconSettings>({});
    const [loading, setLoading] = useState(true);

    const fetchIcons = useCallback(async () => {
        // Don't set loading to true here to prevent UI flicker on real-time updates
        const { data, error } = await supabase.from('icon_settings').select('key, value');
        if (error) {
            console.error('Error fetching icon settings:', error);
            if (loading) setLoading(false);
            return;
        }
        const settingsMap = data.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {} as IconSettings);
        setIconSettings(settingsMap);
        if (loading) setLoading(false);
    }, [loading]);

    useEffect(() => {
        fetchIcons();

        const channel = supabase
            .channel('icon_settings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'icon_settings' }, (payload) => {
                console.log('Icon settings changed, refetching:', payload);
                fetchIcons();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchIcons]);

    return (
        <IconContext.Provider value={{ iconSettings, loading, refreshIcons: fetchIcons }}>
            {children}
        </IconContext.Provider>
    );
};
