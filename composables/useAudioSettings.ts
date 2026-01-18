import { useAppSettings } from './useAppSettings'

export const useAudioSettings = () => {
    const { instrument, updateInstrument } = useAppSettings()

    const getPreferredInstrument = (tier = 'free') => {
        return instrument.value
    }

    const setPreferredInstrument = (instrumentId: string) => {
        updateInstrument(instrumentId)
    }

    return {
        getPreferredInstrument,
        setPreferredInstrument
    }
}
