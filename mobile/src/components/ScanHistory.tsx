/**
 * ScanHistory - Display and interact with recent barcode scans
 */

import React from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native'
import { useScanHistory, formatRelativeTime, type ScanHistoryItem } from '../hooks/useScanHistory'
import type { BarcodeProduct } from '../hooks/useBarcodeLookup'

interface ScanHistoryProps {
  onSelectProduct?: (product: BarcodeProduct) => void
  maxItems?: number
  showClearButton?: boolean
}

/**
 * Full scan history list
 */
export function ScanHistory({
  onSelectProduct,
  maxItems,
  showClearButton = true,
}: ScanHistoryProps) {
  const { history, isLoading, clearHistory } = useScanHistory()

  const displayHistory = maxItems ? history.slice(0, maxItems) : history

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    )
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyTitle}>No Scan History</Text>
        <Text style={styles.emptyText}>
          Products you scan will appear here for quick access
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Scans</Text>
        {showClearButton && (
          <Pressable onPress={clearHistory}>
            <Text style={styles.clearButton}>Clear All</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={displayHistory}
        keyExtractor={(item) => item.barcode}
        renderItem={({ item }) => (
          <ScanHistoryRow
            item={item}
            onPress={() => onSelectProduct?.(item.product)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
}

/**
 * Compact history row for inline display
 */
export function ScanHistoryRow({
  item,
  onPress,
}: {
  item: ScanHistoryItem
  onPress?: () => void
}) {
  const { product, scannedAt } = item

  return (
    <Pressable style={styles.row} onPress={onPress}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.rowImage} />
      ) : (
        <View style={styles.rowImagePlaceholder}>
          <Text style={styles.rowImagePlaceholderText}>📦</Text>
        </View>
      )}

      <View style={styles.rowContent}>
        <Text style={styles.rowName} numberOfLines={1}>{product.name}</Text>
        {product.brand && (
          <Text style={styles.rowBrand} numberOfLines={1}>{product.brand}</Text>
        )}
        <View style={styles.rowMeta}>
          <Text style={styles.rowCalories}>{product.calories} cal</Text>
          <Text style={styles.rowTime}>{formatRelativeTime(scannedAt)}</Text>
        </View>
      </View>

      <View style={styles.rowArrow}>
        <Text style={styles.rowArrowText}>›</Text>
      </View>
    </Pressable>
  )
}

/**
 * Horizontal scroll list of recent scans
 */
export function RecentScansBar({
  onSelectProduct,
}: {
  onSelectProduct: (product: BarcodeProduct) => void
}) {
  const { history, isLoading } = useScanHistory()
  const recentScans = history.slice(0, 5)

  if (isLoading || recentScans.length === 0) {
    return null
  }

  return (
    <View style={styles.recentBar}>
      <Text style={styles.recentBarTitle}>Recent Scans</Text>
      <View style={styles.recentBarItems}>
        {recentScans.map((item) => (
          <Pressable
            key={item.barcode}
            style={styles.recentBarItem}
            onPress={() => onSelectProduct(item.product)}
          >
            {item.product.imageUrl ? (
              <Image source={{ uri: item.product.imageUrl }} style={styles.recentBarImage} />
            ) : (
              <View style={styles.recentBarImagePlaceholder}>
                <Text>📦</Text>
              </View>
            )}
            <Text style={styles.recentBarName} numberOfLines={1}>
              {item.product.name.split(' ')[0]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  clearButton: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FF4444',
  },
  loadingText: {
    padding: 20,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#888',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#0a0a0a',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0a0a0a',
  },
  rowImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  rowImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowImagePlaceholderText: {
    fontSize: 24,
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowName: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  rowBrand: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#888',
    marginBottom: 4,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowCalories: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#00FF00',
  },
  rowTime: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  rowArrow: {
    paddingLeft: 8,
  },
  rowArrowText: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#444',
  },
  recentBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  recentBarTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recentBarItems: {
    flexDirection: 'row',
    gap: 12,
  },
  recentBarItem: {
    alignItems: 'center',
    width: 60,
  },
  recentBarImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    marginBottom: 4,
  },
  recentBarImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentBarName: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888',
    textAlign: 'center',
  },
})
