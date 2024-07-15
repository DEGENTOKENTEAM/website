import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export type BaseOverlayProps = {
    isOpen: boolean
    onClose?: () => void
    closeOnBackdropClick?: boolean
    children?: any
}
export const BaseOverlay = ({
    isOpen,
    onClose,
    closeOnBackdropClick = true,
    children,
}: BaseOverlayProps) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                onClose={() => {
                    closeOnBackdropClick && onClose && onClose()
                }}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-dapp-blue-800 bg-opacity-90 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-dapp-blue-600 px-5 py-6 text-left align-middle text-dapp-cyan-50 shadow-xl transition-all">
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
