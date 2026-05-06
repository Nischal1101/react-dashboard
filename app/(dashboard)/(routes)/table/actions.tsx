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
}

export async function fetchProducts(queryParams: ProductListParams) {
  const response = await api.get<ProductsResponse>("/products/", {
    params: queryParams,
  });
  return response.data;
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
  const response = await api.get<ProductsResponse>("/products/", {
    params: { limit: 0, select: "brand,category" },
  });
  const categories = new Set<string>();
  const brands = new Set<string>();
  for (const product of response.data.products) {
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
    staleTime: Infinity,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: keys.products.byFilter(data.id),
      });
      toast.success("Portfolio order deleted successfully");
    },
  });
}

interface DeleteProductInput {
  id: number;
}

interface DeletedProduct extends Product {
  isDeleted: boolean;
  deletedOn: string;
}

export async function deleteProduct({ id }: DeleteProductInput) {
  const response = await api.delete<DeletedProduct>(`/products/${id}`);
  return response.data;
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.products.list(),
      });
      toast.success("Portfolio order deleted successfully");
    },
  });
}
