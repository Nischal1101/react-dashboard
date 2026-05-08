import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios-instance";
import { keys } from "@/lib/query-keys";
import type { TProduct, TProductsResponse, TProductListParams } from "@/@types";

async function fetchProducts(
  queryParams: TProductListParams,
): Promise<TProductsResponse> {
  const page = Math.floor(queryParams.skip / queryParams.limit) + 1;
  const params: Record<string, string | number> = {
    _page: page,
    _per_page: queryParams.limit,
  };
  if (queryParams.category) params["category:eq"] = queryParams.category;
  if (queryParams.brand) params["brand:eq"] = queryParams.brand;

  const response = await api.get<TJsonServerPage<TProduct>>("/products", {
    params,
  });
  return {
    products: response.data.data,
    total: response.data.items,
    skip: queryParams.skip,
    limit: queryParams.limit,
  };
}

export function useFetchProducts(queryParams: TProductListParams) {
  return useQuery({
    queryKey: keys.products.byFilter(queryParams),
    queryFn: () => fetchProducts(queryParams),
    placeholderData: keepPreviousData,
  });
}

async function fetchProductFilterOptions(): Promise<TProductFilterOptions> {
  const response = await api.get<TProduct[]>("/products");
  const categories = new Set<string>();
  const brands = new Set<string>();
  for (const product of response.data) {
    if (product.category) categories.add(product.category);
    if (product.brand) brands.add(product.brand);
  }
  return {
    categories: Array.from(categories).sort(),
    brands: Array.from(brands).sort(),
  };
}

export function useFetchProductFilterOptions() {
  return useQuery({
    queryKey: keys.products.filterOptions(),
    queryFn: fetchProductFilterOptions,
  });
}

async function updateProduct({ id, payload }: TUpdateProductInput) {
  const response = await api.patch<TProduct>(`/products/${id}`, payload);
  return response.data;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.products.list() });
      toast.success("Product updated");
    },
  });
}

async function deleteProduct({ id }: TDeleteProductInput) {
  const response = await api.delete<TProduct>(`/products/${id}`);
  return response.data;
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.products.list() });
      toast.success("Product deleted");
    },
  });
}
