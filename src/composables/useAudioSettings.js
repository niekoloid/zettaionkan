export const useAudioSettings = () => {
    // Determine the user's preferred instrument setting from localStorage
    // Default is 'yamaha' if not set
    const getPreferredInstrument = (tier = 'free') => {
        const stored = localStorage.getItem('preferred_instrument');
        if (stored) return stored;
        
        // If no preference stored, default based on tier
        return tier === 'premium' ? 'steinway' : 'yamaha';
    };

    const setPreferredInstrument = (instrument) => {
        localStorage.setItem('preferred_instrument', instrument);
    };

    return {
        getPreferredInstrument,
        setPreferredInstrument
    }
}
