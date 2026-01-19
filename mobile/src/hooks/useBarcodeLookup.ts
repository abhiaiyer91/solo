/**
 * useBarcodeLookup - Hook for barcode product lookup
 */

import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface BarcodeProduct {
  name: string
  brand?: string
  servingSize: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  imageUrl?: string
  barcode: string
  nutritionGrade?: string
}

export interface BarcodeResponse {
  found: boolean
  product?: BarcodeProduct
  barcode: string
  source?: 'openfoodfacts' | 'usda' | 'local'
}

/**
 * Hook for looking up products by barcode
 */
export function useBarcodeLookup() {
  return useMutation({
    mutationFn: async (barcode: string): Promise<BarcodeResponse> => {
      try {
        const response = await api.get<BarcodeResponse>(
          `/api/nutrition/barcode/${barcode}`
        )
        return response
      } catch {
        // Return not found on error
        return {
          found: false,
          barcode,
        }
      }
    },
  })
}

/**
 * Hook for logging food from a barcode scan
 */
export function useLogScannedFood() {
  return useMutation({
    mutationFn: async (data: {
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      product: BarcodeProduct
      servings: number
    }) => {
      const { product, servings, mealType } = data
      
      return api.post('/api/nutrition/log', {
        manual: true,
        mealType,
        calories: Math.round(product.calories * servings),
        protein: product.protein * servings,
        carbs: product.carbs * servings,
        fat: product.fat * servings,
        fiber: product.fiber ? product.fiber * servings : undefined,
        notes: `${product.name}${product.brand ? ` (${product.brand})` : ''} - ${servings} serving(s)`,
      })
    },
  })
}

/**
 * Format barcode for display
 */
export function formatBarcode(barcode: string): string {
  // EAN-13: XXXX XXXX XXXX X
  if (barcode.length === 13) {
    return `${barcode.slice(0, 4)} ${barcode.slice(4, 8)} ${barcode.slice(8, 12)} ${barcode.slice(12)}`
  }
  // UPC-A: X XXXXX XXXXX X
  if (barcode.length === 12) {
    return `${barcode.slice(0, 1)} ${barcode.slice(1, 6)} ${barcode.slice(6, 11)} ${barcode.slice(11)}`
  }
  return barcode
}
