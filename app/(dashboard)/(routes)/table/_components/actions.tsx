import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios-instance";
import { keys } from "@/lib/query-keys";
import type { Product, ProductsResponse } from "@/@types";

interface ProductListParams {
  limit: number;
  skip: number;
  q?: string;
  category?: string;
  brand?: string;
}

interface JsonServerPage<T> {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: T[];
}

export async function fetchProducts(
  queryParams: ProductListParams,
): Promise<ProductsResponse> {
  const page = Math.floor(queryParams.skip / queryParams.limit) + 1;
  const params: Record<string, string | number> = {
    _page: page,
    _per_page: queryParams.limit,
  };
  if (queryParams.q) params["title:contains"] = queryParams.q;
  if (queryParams.category) params["category:eq"] = queryParams.category;
  if (queryParams.brand) params["brand:eq"] = queryParams.brand;

  const response = await api.get<JsonServerPage<Product>>("/products", {
    params,
  });
  return {
    products: response.data.data,
    total: response.data.items,
    skip: queryParams.skip,
    limit: queryParams.limit,
  };
}

export function useFetchProducts(queryParams: ProductListParams) {
  return useQuery({
    queryKey: keys.products.byFilter(queryParams),
    queryFn: () => fetchProducts(queryParams),
    placeholderData: keepPreviousData,
  });
}

export interface ProductFilterOptions {
  categories: string[];
  brands: string[];
}

export async function fetchProductFilterOptions(): Promise<ProductFilterOptions> {
  const response = await api.get<Product[]>("/products");
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

interface UpdateProductInput {
  id: number;
  payload: Partial<Product>;
}

export async function updateProduct({ id, payload }: UpdateProductInput) {
  const response = await api.patch<Product>(`/products/${id}`, payload);
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

interface DeleteProductInput {
  id: number;
}

export async function deleteProduct({ id }: DeleteProductInput) {
  const response = await api.delete<Product>(`/products/${id}`);
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
