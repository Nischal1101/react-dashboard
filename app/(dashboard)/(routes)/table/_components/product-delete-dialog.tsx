import type { TProduct } from "@/@types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TDeleteDialogProps = {
  product: TProduct | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: TProduct) => void;
};

export default function DeleteDialog({
  product,
  onOpenChange,
  onConfirm,
}: TDeleteDialogProps) {
  return (
    <AlertDialog open={product !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this product?</AlertDialogTitle>
          <AlertDialogDescription>
            {product
              ? `"${product.title}" will be permanently removed. This cannot be undone.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (product) onConfirm(product);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
