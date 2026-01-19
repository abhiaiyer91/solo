/**
 * Food Search Hook
 * 
 * Search Open Food Facts API by food name.
 * Includes debouncing, loading states, and error handling.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/cgi/search.pl'
const DEBOUNCE_MS = 400
const PAGE_SIZE = 20

export interface FoodSearchResult {
  id: string
  name: string
  brand?: string
  imageUrl?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
  servingUnit: string
  barcode?: string
}

interface OpenFoodFactsProduct {
  _id: string
  product_name?: string
  brands?: string
  image_front_small_url?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
  }
  serving_size?: string
  code?: string
}

interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[]
  count: number
  page: number
  page_size: number
}

function parseServingSize(servingStr?: string): { size: number; unit: string } {
  if (!servingStr) return { size: 100, unit: 'g' }
  
  // Try to parse serving size like "30g" or "1 cup (240ml)"
  const match = servingStr.match(/(\d+\.?\d*)\s*(\w+)/)
  if (match) {
    return {
      size: parseFloat(match[1]),
      unit: match[2].toLowerCase(),
    }
  }
  
  return { size: 100, unit: 'g' }
}

function mapProduct(product: OpenFoodFactsProduct): FoodSearchResult | null {
  // Skip products without name or nutrient data
  if (!product.product_name || !product.nutriments) {
    return null
  }

  const nutrients = product.nutriments
  const serving = parseServingSize(product.serving_size)

  return {
    id: product._id,
    name: product.product_name,
    brand: product.brands,
    imageUrl: product.image_front_small_url,
    calories: Math.round(nutrients['energy-kcal_100g'] ?? 0),
    protein: Math.round((nutrients.proteins_100g ?? 0) * 10) / 10,
    carbs: Math.round((nutrients.carbohydrates_100g ?? 0) * 10) / 10,
    fat: Math.round((nutrients.fat_100g ?? 0) * 10) / 10,
    servingSize: serving.size,
    servingUnit: serving.unit,
    barcode: product.code,
  }
}

export function useFoodSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  /**
   * Search for foods by name
   */
  const search = useCallback(async (searchQuery: string, pageNum: number = 1) => {
    // Cancel any pending request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (!searchQuery.trim()) {
      setResults([])
      setHasMore(false)
      setError(null)
      return
    }

    setIsSearching(true)
    setError(null)

    abortRef.current = new AbortController()

    try {
      const params = new URLSearchParams({
        search_terms: searchQuery,
        search_simple: '1',
        action: 'process',
        json: '1',
        page_size: PAGE_SIZE.toString(),
        page: pageNum.toString(),
        fields: 'product_name,brands,image_front_small_url,nutriments,serving_size,code',
      })

      const response = await fetch(`${OPEN_FOOD_FACTS_API}?${params}`, {
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data: OpenFoodFactsResponse = await response.json()
      
      const mappedResults = data.products
        .map(mapProduct)
        .filter((r): r is FoodSearchResult => r !== null)

      if (pageNum === 1) {
        setResults(mappedResults)
      } else {
        setResults((prev) => [...prev, ...mappedResults])
      }

      setHasMore(data.count > pageNum * PAGE_SIZE)
      setPage(pageNum)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      console.error('Food search error:', err)
      setError('Failed to search foods. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [])

  /**
   * Update query with debouncing
   */
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery)

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      search(newQuery, 1)
    }, DEBOUNCE_MS)
  }, [search])

  /**
   * Load more results
   */
  const loadMore = useCallback(() => {
    if (!isSearching && hasMore) {
      search(query, page + 1)
    }
  }, [isSearching, hasMore, query, page, search])

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setHasMore(false)
    setError(null)
    setPage(1)
  }, [])

  return {
    query,
    results,
    isSearching,
    error,
    hasMore,
    updateQuery,
    loadMore,
    clearSearch,
    search: (q: string) => search(q, 1),
  }
}
