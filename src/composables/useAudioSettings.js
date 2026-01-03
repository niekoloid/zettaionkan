export const useAudioSettings = () => {
    // Determine the user's preferred instrument setting from localStorage
    // Default is 'yamaha' if not set
    const getPreferredInstrument = () => {
        return localStorage.getItem('preferred_instrument') || 'yamaha';
    };

    const setPreferredInstrument = (instrument) => {
        localStorage.setItem('preferred_instrument', instrument);
    };

    return {
        getPreferredInstrument,
        setPreferredInstrument
    }
}
