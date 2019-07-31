export interface StepProps {
    hashKey?: string
    isActive?: boolean
    currentStep?: number
    totalSteps?: number
    firstStep?: () => void
    lastStep?: () => void
    nextStep?: () => void
    previousStep?: () => void
    goToStep?: (step: number) => void

    state?: {
        activeStep: number
    }

    setActiveStep?: any
}
