import Link from 'next/link';
import type { Insight } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/utils/format';

export function InsightCard({ post, readLabel }: { post: Insight; readLabel: string }) {
  return (
    <Link className="post" href={`/insights/${post.slug}`}>
      {post.cover && (
        <span className="post-img">
          <img src={post.cover} alt={post.coverAlt} loading="lazy" decoding="async" />
        </span>
      )}
      <span className="post-meta">
        <span>{post.category}</span>
        <span>
          {formatDate(post.date)} · {post.readTime}
        </span>
      </span>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <span className="go">
        {readLabel} <Icon name="i-arrow" />
      </span>
    </Link>
  );
}
