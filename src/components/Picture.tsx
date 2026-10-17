/** A generated PNG picture from src/data/pictures.ts. */
export default function Picture({ src, className = 'size-44' }: { src: string; className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}${src.slice(1)}`} alt="" aria-hidden className={`${className} object-contain`} />
}
