/**
 * Index des composants réutilisables
 * Facilite les imports
 */

// ===== COMPOSANTS HOME =====
export { DogCard } from './DogCard';
export { DogCardWithProgress } from './DogCardWithProgress';
export { StatsCards } from './charts/StatsCards';
export { ProgressSection } from './ProgressSection';
export { ActionButtons } from './ActionButtons';
export { LastWalkTimer } from './LastWalkTimer';
export { ActionModal } from './ActionModal';
export { TrialModal } from './TrialModal';
export { default as PremiumContent } from './PremiumContent';
export { default as BlurredPremiumSection } from './BlurredPremiumSection';
export { default as TextHidden } from './HideIfFree';

// ===== COMPOSANTS ANALYTICS =====
export { DogCommunicationStats } from './charts/AskToGoOutStats';
export { IncidentReasonChart } from './charts/IncidentReasonChart';

// ===== COMPOSANTS ONBOARDING =====
export { default as OnboardingHeader } from './OnboardingHeader';
export { default as FormInput } from './FormInput';
export { default as AuthButton } from './AuthButton';
export { default as BackButton } from './BackButton';
export { default as SexToggle } from './SexToggle';