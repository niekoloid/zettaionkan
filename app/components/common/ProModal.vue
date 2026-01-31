<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
const { isOpen, closeProModal, modalTitle, modalDesc } = useProModal()
const router = useRouter()

const goToSubscription = () => {
  closeProModal()
  router.push('/subscription')
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="closeProModal">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm border-2 border-amber-400">
              <!-- Premium Header -->
              <div class="bg-amber-400 px-4 py-3 sm:px-6">
                 <div class="flex items-center justify-center text-white font-black tracking-widest uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                   Premium Feature
                 </div>
              </div>

              <div class="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start text-center flex-col items-center">
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <DialogTitle as="h3" class="text-xl font-bold leading-6 text-gray-900 text-center mb-2">
                      {{ modalTitle }}
                    </DialogTitle>
                    <div class="mt-2 text-center">
                      <p class="text-sm text-gray-500">
                        {{ modalDesc }}
                      </p>
                       <p class="text-sm text-gray-500 mt-2 font-bold">
                        PROプランで、絶対音感の扉を開きましょう。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 flex justify-center flex-col gap-2">
                <button type="button" class="inline-flex w-full justify-center rounded-xl bg-gray-900 px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-gray-800 sm:w-auto transition-transform active:scale-95" @click="goToSubscription">
                  PROプランを見る
                </button>
                <button type="button" class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="closeProModal" ref="cancelButtonRef">
                  今はやめておく
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
