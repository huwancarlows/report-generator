import { supabase, handleSupabaseError } from '../app/utils/supabaseClient';

export const profileService = {
    /**
     * Update the municipal mayor for a user profile.
     * @param userId - The user's UUID
     * @param mayor - The new mayor name
     */
    async updateMayor(userId: string, mayor: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ municipal_mayor: mayor })
                .eq('id', userId);

            if (error) {
                handleSupabaseError<boolean>(error, false);
                return false;
            }
            return true;
        } catch (error) {
            handleSupabaseError<boolean>(error, false);
            return false;
        }
    },

    /**
     * Update the name for a user profile.
     * @param userId - The user's UUID
     * @param name - The new name
     */
    async updateName(userId: string, name: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ name })
                .eq('id', userId);

            if (error) {
                handleSupabaseError<boolean>(error, false);
                return false;
            }
            return true;
        } catch (error) {
            handleSupabaseError<boolean>(error, false);
            return false;
        }
    },
}; 