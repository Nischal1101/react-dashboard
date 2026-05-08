import { z } from "zod";

const trimmedString = z.string().trim();

const finiteNumber = (typeMessage = "Must be a number") =>
  z.number({ error: typeMessage }).finite(typeMessage);

export const productSchema = z.object({
  title: trimmedString
    .min(2, "Min 2 characters")
    .max(200, "Max 200 characters"),
  description: trimmedString
    .min(1, "Required")
    .max(2000, "Max 2000 characters"),
  category: trimmedString
    .min(1, "Required")
    .max(60, "Max 60 characters"),
  price: finiteNumber("Price must be a number")
    .nonnegative("Cannot be negative")
    .max(10_000_000, "Max 10,000,000"),
  discountPercentage: finiteNumber("Discount must be a number")
    .min(0, "Must be between 0 and 100")
    .max(100, "Must be between 0 and 100"),
  rating: finiteNumber("Rating must be a number")
    .min(0, "Must be between 0 and 5")
    .max(5, "Must be between 0 and 5"),
  stock: finiteNumber("Stock must be a number")
    .int("Must be a whole number")
    .nonnegative("Cannot be negative")
    .max(1_000_000, "Max 1,000,000"),
  brand: trimmedString.max(60, "Max 60 characters").optional(),
  sku: trimmedString.max(40, "Max 40 characters").optional(),
  thumbnail: z.string().url("Must be a valid URL").optional(),
});

export const productUpdateSchema = productSchema.partial();

export type TProductInput = z.infer<typeof productSchema>;
export type TProductUpdateInput = z.infer<typeof productUpdateSchema>;

export type TProductField = keyof typeof productSchema.shape;

const FIELD_LABELS: Record<TProductField, string> = {
  title: "Title",
  description: "Description",
  category: "Category",
  price: "Price",
  discountPercentage: "Discount",
  rating: "Rating",
  stock: "Stock",
  brand: "Brand",
  sku: "SKU",
  thumbnail: "Thumbnail",
};

export function validateProductField(
  field: TProductField,
  value: unknown,
): string | null {
  const fieldSchema = productSchema.shape[field];
  const isOptional = fieldSchema.safeParse(undefined).success;

  if (value === null || value === undefined || value === "") {
    return isOptional ? null : "Required";
  }

  const result = fieldSchema.safeParse(value);
  return result.success
    ? null
    : (result.error.issues[0]?.message ?? "Invalid value");
}

export function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const head = issue.path[0];
      const label =
        typeof head === "string" && head in FIELD_LABELS
          ? FIELD_LABELS[head as TProductField]
          : issue.path.join(".");
      return label ? `${label}: ${issue.message}` : issue.message;
    })
    .join("; ");
}
