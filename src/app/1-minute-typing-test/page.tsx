import DurationTestPage, { durationMetadata } from '@/components/tools/DurationTestPage';

export const metadata = durationMetadata(1);

export default function Page() {
  return <DurationTestPage minutes={1} />;
}
