import { cn, formatNumber } from "@/lib/utils";

export default function NumberCell({
  value,
  className,
  shouldBeRed,
}: {
  value: number | string;
  className?: string;
  shouldBeRed?: boolean;
}) {
  const isInvalid =
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value));

  return (
    <p
      className={cn(
        shouldBeRed === undefined
          ? "text-black-500/90 dark:text-black-100"
          : shouldBeRed
            ? "text-destructive"
            : "text-success",
        className,
      )}
    >
      {isInvalid ? "-" : formatNumber(value)}
    </p>
  );
}
