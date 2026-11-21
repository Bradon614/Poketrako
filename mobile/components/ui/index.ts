/**
 * POKETRAKO UI kit — public surface.
 *
 * Screens should import everything from here (`@/components/ui`). Design tokens
 * live in `@/theme`; this barrel only re-exports the components.
 */

/* Glass / layout primitives */
export { GlassSurface } from './GlassSurface';
export type { GlassSurfaceProps, GlassVariant, GlassElevation } from './GlassSurface';
export { PressableScale } from './PressableScale';
export type { PressableScaleProps } from './PressableScale';
export { AmbientBackground } from './AmbientBackground';

/* Atoms */
export { AppText, Heading, Body, Caption, Money } from './Text';
export type { TextTone } from './Text';
export { Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';
export { IconButton } from './IconButton';
export { Chip } from './Chip';
export type { ChipTone } from './Chip';
export { Card } from './Card';
export { Input } from './Input';
export { SelectField } from './SelectField';
export type { SelectOption } from './SelectField';
export { SegmentedControl } from './SegmentedControl';
export type { SegmentedOption } from './SegmentedControl';
export { ProgressBar } from './ProgressBar';
export { StatTile } from './StatTile';
export type { StatTone } from './StatTile';
export { ListRow } from './ListRow';

/* Structure */
export { Screen } from './Screen';
export { ScreenHeader } from './ScreenHeader';
export { SectionHeader } from './SectionHeader';
export { Appear } from './Appear';
export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';
export { LoadingState } from './LoadingState';
export { RefreshableList } from './RefreshableList';

/* Shared helpers */
export { useThemedStyles } from '@/theme/ThemeProvider';
