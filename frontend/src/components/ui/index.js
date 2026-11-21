/**
 * UI kit barrel — screens import everything visual from here.
 *
 *   import { Button, Card, Input, Modal, useConfirm } from '../ui';
 */

/* Actions */
export { Button, LinkButton, IconButton } from './Button';

/* Surfaces */
export { Card, GlassPanel, SectionCard } from './Surface';

/* Form */
export { Input, Textarea, Select, FieldRow } from './Field';

/* Controls */
export { SegmentedControl, SearchInput, Switch, Badge, Chip, Tooltip, StatDelta } from './Controls';

/* Overlays */
export { Modal, ConfirmProvider, useConfirm } from './Overlay';

/* Feedback */
export {
  Skeleton,
  SkeletonText,
  SkeletonRows,
  SkeletonChart,
  Spinner,
  EmptyState,
  ErrorState,
  Alert,
} from './Feedback';

/* Data visualisation */
export { ProgressBar, ProgressRing, CategoryBar, StatTile } from './DataViz';
