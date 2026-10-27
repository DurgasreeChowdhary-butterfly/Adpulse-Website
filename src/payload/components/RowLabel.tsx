"use client";

import { useRowLabel } from "@payloadcms/ui";

// Shows the item's own label/title on collapsed array rows in the admin.

export function LabelRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; visible?: boolean }>();
  const label = data?.label || `Item ${(rowNumber ?? 0) + 1}`;
  return <span>{data?.visible === false ? `${label} (hidden)` : label}</span>;
}

export function TitleRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string }>();
  return <span>{data?.title || `Column ${(rowNumber ?? 0) + 1}`}</span>;
}
