'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { useProModal } from '@/lib/app-context'

export default function ProModal() {
  const { isOpen, closeProModal, modalTitle, modalDesc } = useProModal()
  const router = useRouter()

  const goToSubscription = () => {
    closeProModal()
    router.push('/subscription')
  }

  return (
    <Dialog open={isOpen} onClose={closeProModal} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity duration-300 data-[closed]:opacity-0" />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-sm border-2 border-amber-400 data-[closed]:opacity-0 data-[closed]:translate-y-4 sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95"
          >
            <div className="bg-amber-400 px-4 py-3 sm:px-6">
              <div className="flex items-center justify-center text-white font-black tracking-widest uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Premium Feature
              </div>
            </div>

            <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4 text-center">
              <DialogTitle as="h3" className="text-xl font-bold leading-6 text-gray-900 mb-2">{modalTitle}</DialogTitle>
              <p className="text-sm text-gray-500 mt-2">{modalDesc}</p>
              <p className="text-sm text-gray-500 mt-2 font-bold">PROプランで、絶対音感の扉を開きましょう。</p>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 flex justify-center flex-col gap-2">
              <button type="button" onClick={goToSubscription} className="inline-flex w-full justify-center rounded-xl bg-gray-900 px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-gray-800 sm:w-auto transition-transform active:scale-95">
                PROプランを見る
              </button>
              <button type="button" onClick={closeProModal} className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
                今はやめておく
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
