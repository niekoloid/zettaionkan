export const useProModal = () => {
  const isOpen = useState<boolean>('pro_modal_open', () => false)
  const defaultTitle = 'PROプラン限定機能'
  const defaultDesc = 'この機能を使用するにはPROプランへのアップグレードが必要です。'
  
  const modalTitle = useState<string>('pro_modal_title', () => defaultTitle)
  const modalDesc = useState<string>('pro_modal_desc', () => defaultDesc)

  const openProModal = (title?: string, desc?: string) => {
    modalTitle.value = title || defaultTitle
    modalDesc.value = desc || defaultDesc
    isOpen.value = true
  }

  const closeProModal = () => {
    isOpen.value = false
    // Reset to defaults after close (optional, maybe better not to for animation smoothness)
  }

  return {
    isOpen,
    modalTitle,
    modalDesc,
    openProModal,
    closeProModal
  }
}
