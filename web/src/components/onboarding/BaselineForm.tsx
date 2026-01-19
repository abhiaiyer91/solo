/**
 * BaselineForm - Multi-step questionnaire for baseline assessment
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BaselineAssessmentInput } from '@/hooks/useOnboarding'

interface BaselineFormProps {
  onComplete: (data: BaselineAssessmentInput) => void
  onSkip: () => void
  isLoading?: boolean
}

type FormStep = 'physical' | 'activity' | 'lifestyle' | 'experience'

const STEPS: FormStep[] = ['physical', 'activity', 'lifestyle', 'experience']

export function BaselineForm({ onComplete, onSkip, isLoading }: BaselineFormProps) {
  const [step, setStep] = useState<FormStep>('physical')
  const [unit, setUnit] = useState<'kg' | 'lbs'>('lbs')
  const [data, setData] = useState<Partial<BaselineAssessmentInput>>({
    weightUnit: 'lbs',
  })

  const currentIndex = STEPS.indexOf(step)

  const updateField = <K extends keyof BaselineAssessmentInput>(
    field: K, 
    value: BaselineAssessmentInput[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]!)
    } else {
      onComplete({
        ...data,
        weightUnit: unit,
        fitnessExperience: data.fitnessExperience ?? 'beginner',
        hasGymAccess: data.hasGymAccess ?? false,
        hasHomeEquipment: data.hasHomeEquipment ?? false,
      } as BaselineAssessmentInput)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]!)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-system-blue mb-2">
          {'>'} BASELINE ASSESSMENT
        </h2>
        <p className="text-sm text-system-text-muted">
          Calibrating initial parameters...
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex justify-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 w-8 rounded ${
              i < currentIndex ? 'bg-system-green' :
              i === currentIndex ? 'bg-system-blue' :
              'bg-system-panel'
            }`}
          />
        ))}
      </div>

      {/* Form Content */}
      <div className="system-window p-4 mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'physical' && (
              <PhysicalStep
                data={data}
                unit={unit}
                onUpdate={updateField}
                onUnitChange={setUnit}
              />
            )}
            {step === 'activity' && (
              <ActivityStep data={data} onUpdate={updateField} />
            )}
            {step === 'lifestyle' && (
              <LifestyleStep data={data} onUpdate={updateField} />
            )}
            {step === 'experience' && (
              <ExperienceStep data={data} onUpdate={updateField} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={currentIndex === 0 ? onSkip : handleBack}
          className="text-sm text-system-text-muted hover:text-system-text"
          disabled={isLoading}
        >
          {currentIndex === 0 ? 'Skip Assessment' : '< Back'}
        </button>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="px-6 py-2 bg-system-blue text-system-black font-bold rounded hover:bg-system-blue/80 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 
           currentIndex === STEPS.length - 1 ? 'Complete' : 'Continue >'}
        </button>
      </div>
    </motion.div>
  )
}

/**
 * Physical measurements step
 */
function PhysicalStep({ 
  data, 
  unit, 
  onUpdate, 
  onUnitChange 
}: {
  data: Partial<BaselineAssessmentInput>
  unit: 'kg' | 'lbs'
  onUpdate: <K extends keyof BaselineAssessmentInput>(field: K, value: BaselineAssessmentInput[K]) => void
  onUnitChange: (unit: 'kg' | 'lbs') => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-system-text-muted mb-2">
        PHYSICAL METRICS
      </div>

      {/* Unit Toggle */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={() => onUnitChange('lbs')}
          className={`px-3 py-1 text-sm rounded ${unit === 'lbs' ? 'bg-system-blue text-system-black' : 'bg-system-panel text-system-text'}`}
        >
          lbs
        </button>
        <button
          onClick={() => onUnitChange('kg')}
          className={`px-3 py-1 text-sm rounded ${unit === 'kg' ? 'bg-system-blue text-system-black' : 'bg-system-panel text-system-text'}`}
        >
          kg
        </button>
      </div>

      <InputField
        label={`Current Weight (${unit})`}
        type="number"
        value={data.startingWeight ?? ''}
        onChange={(v) => onUpdate('startingWeight', v ? Number(v) : undefined)}
        placeholder="e.g., 185"
      />

      <InputField
        label={`Target Weight (${unit})`}
        type="number"
        value={data.targetWeight ?? ''}
        onChange={(v) => onUpdate('targetWeight', v ? Number(v) : undefined)}
        placeholder="optional"
      />

      <InputField
        label="Height (inches)"
        type="number"
        value={data.height ?? ''}
        onChange={(v) => onUpdate('height', v ? Number(v) : undefined)}
        placeholder="e.g., 70"
      />

      <InputField
        label="Max Push-ups"
        type="number"
        value={data.pushUpsMax ?? ''}
        onChange={(v) => onUpdate('pushUpsMax', v ? Number(v) : undefined)}
        placeholder="e.g., 20"
      />

      <InputField
        label="Plank Hold (seconds)"
        type="number"
        value={data.plankHoldSeconds ?? ''}
        onChange={(v) => onUpdate('plankHoldSeconds', v ? Number(v) : undefined)}
        placeholder="e.g., 60"
      />
    </div>
  )
}

/**
 * Activity level step
 */
function ActivityStep({ 
  data, 
  onUpdate 
}: {
  data: Partial<BaselineAssessmentInput>
  onUpdate: <K extends keyof BaselineAssessmentInput>(field: K, value: BaselineAssessmentInput[K]) => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-system-text-muted mb-2">
        ACTIVITY LEVELS
      </div>

      <InputField
        label="Average Daily Steps"
        type="number"
        value={data.dailyStepsBaseline ?? ''}
        onChange={(v) => onUpdate('dailyStepsBaseline', v ? Number(v) : undefined)}
        placeholder="e.g., 5000"
      />

      <InputField
        label="Workouts Per Week"
        type="number"
        value={data.workoutsPerWeek ?? ''}
        onChange={(v) => onUpdate('workoutsPerWeek', v ? Number(v) : undefined)}
        placeholder="e.g., 3"
      />

      <InputField
        label="Mile Run Time (minutes)"
        type="number"
        value={data.mileTimeMinutes ?? ''}
        onChange={(v) => onUpdate('mileTimeMinutes', v ? Number(v) : undefined)}
        placeholder="e.g., 10"
      />
    </div>
  )
}

/**
 * Lifestyle step
 */
function LifestyleStep({ 
  data, 
  onUpdate 
}: {
  data: Partial<BaselineAssessmentInput>
  onUpdate: <K extends keyof BaselineAssessmentInput>(field: K, value: BaselineAssessmentInput[K]) => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-system-text-muted mb-2">
        LIFESTYLE FACTORS
      </div>

      <InputField
        label="Average Sleep (hours)"
        type="number"
        value={data.sleepHoursBaseline ?? ''}
        onChange={(v) => onUpdate('sleepHoursBaseline', v ? Number(v) : undefined)}
        placeholder="e.g., 7"
      />

      <InputField
        label="Daily Protein Intake (grams)"
        type="number"
        value={data.proteinGramsBaseline ?? ''}
        onChange={(v) => onUpdate('proteinGramsBaseline', v ? Number(v) : undefined)}
        placeholder="e.g., 100"
      />

      <InputField
        label="Alcohol Drinks Per Week"
        type="number"
        value={data.alcoholDrinksPerWeek ?? ''}
        onChange={(v) => onUpdate('alcoholDrinksPerWeek', v ? Number(v) : undefined)}
        placeholder="e.g., 3"
      />
    </div>
  )
}

/**
 * Experience step
 */
function ExperienceStep({ 
  data, 
  onUpdate 
}: {
  data: Partial<BaselineAssessmentInput>
  onUpdate: <K extends keyof BaselineAssessmentInput>(field: K, value: BaselineAssessmentInput[K]) => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold text-system-text-muted mb-2">
        EXPERIENCE & ACCESS
      </div>

      <div className="space-y-2">
        <label className="text-sm text-system-text-muted">Fitness Experience</label>
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onUpdate('fitnessExperience', level)}
              className={`flex-1 py-2 px-3 text-sm rounded capitalize ${
                data.fitnessExperience === level 
                  ? 'bg-system-blue text-system-black' 
                  : 'bg-system-panel text-system-text hover:bg-system-panel/70'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-system-text-muted">Equipment Access</label>
        
        <label className="flex items-center gap-3 p-3 bg-system-panel rounded cursor-pointer">
          <input
            type="checkbox"
            checked={data.hasGymAccess ?? false}
            onChange={(e) => onUpdate('hasGymAccess', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-system-text">Gym Membership</span>
        </label>

        <label className="flex items-center gap-3 p-3 bg-system-panel rounded cursor-pointer">
          <input
            type="checkbox"
            checked={data.hasHomeEquipment ?? false}
            onChange={(e) => onUpdate('hasHomeEquipment', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-system-text">Home Equipment</span>
        </label>
      </div>
    </div>
  )
}

/**
 * Reusable input field
 */
function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string
  type: 'text' | 'number'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-system-text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-system-black border border-system-text/20 rounded text-system-text placeholder:text-system-text/30 focus:border-system-blue focus:outline-none"
      />
    </div>
  )
}
