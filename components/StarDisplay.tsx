interface Props {
  earned: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "text-base", md: "text-2xl", lg: "text-4xl" };

export default function StarDisplay({ earned, max = 3, size = "md" }: Props) {
  return (
    <span className={`inline-flex gap-1 ${sizes[size]}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i}>{i < earned ? "⭐" : "☆"}</span>
      ))}
    </span>
  );
}
