/** A picture from src/data/pictures.ts (SVG markup in a 100 x 100 box). */
export default function Picture({ svg, className = 'size-44' }: { svg: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={className}
      fill="none"
      stroke="#334155"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
