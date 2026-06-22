import { cx } from '../../../lib/useStyles';

export const makeAvatarStyles = (className: string) => ({
  root: cx(
    'relative rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-semibold bg-gradient-to-br from-primary to-accent',
    className,
  ),
  img: 'absolute inset-0 w-full h-full object-cover',
});
