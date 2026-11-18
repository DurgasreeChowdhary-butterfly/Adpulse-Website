import type { ReactNode } from 'react';
import { rich } from '@/utils/richText';

type Kinetic = 'kt-rise' | 'kt-mask' | 'kt-lines' | 'kt-chars' | 'kt-hl';

interface Props {
  eyebrow: string;
  title: string;
  /** Which kinetic heading style to use (see utils/motion/kinetic.ts) */
  kinetic?: Kinetic;
  description?: ReactNode;
  id?: string;
}

/** Standard section header: eyebrow + heading on the left, description on the right. */
export function SectionHead({ eyebrow, title, kinetic = 'kt-rise', description, id }: Props) {
  return (
    <div className="head-row rv">
      <div className="head">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className={`h2 kt ${kinetic}`} id={id}>
          {rich(title)}
        </h2>
      </div>
      {description && <p className="body">{description}</p>}
    </div>
  );
}
