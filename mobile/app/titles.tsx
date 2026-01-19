import { View, Text, ScrollView, RefreshControl, Pressable, Modal } from 'react-native';
import { useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SystemWindow } from '@/components/SystemWindow';
import { useTitles, useSetActiveTitle, Title, TitleRarity, getRarityColor, getRarityBgColor } from '@/hooks/useTitles';

interface TitleCardProps {
  title: Title;
  onPress: () => void;
}

function TitleCard({ title, onPress }: TitleCardProps) {
  const textColor = getRarityColor(title.rarity);
  const bgColor = getRarityBgColor(title.rarity);

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <SystemWindow
          variant={title.isActive ? 'success' : title.isEarned ? 'default' : 'warning'}
          style={{
            marginBottom: 12,
            opacity: title.isEarned ? (pressed ? 0.9 : 1) : 0.6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Rarity Indicator */}
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: bgColor,
              borderWidth: 1,
              borderColor: textColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              {title.isEarned ? (
                <Ionicons name="ribbon" size={20} color={textColor} />
              ) : (
                <Ionicons name="lock-closed" size={18} color="#64748B" />
              )}
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{
                  color: title.isEarned ? '#E2E8F0' : '#64748B',
                  fontSize: 15,
                  fontWeight: '600',
                }}>
                  {title.name}
                </Text>
                {title.isActive && (
                  <View style={{
                    backgroundColor: '#4ADE8020',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginLeft: 8,
                  }}>
                    <Text style={{ color: '#4ADE80', fontSize: 10, fontWeight: '600' }}>
                      EQUIPPED
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ color: textColor, fontSize: 11, textTransform: 'capitalize', marginTop: 2 }}>
                {title.rarity}
              </Text>
              <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>
                {title.isEarned ? title.description : title.requirement}
              </Text>
            </View>
          </View>
        </SystemWindow>
      )}
    </Pressable>
  );
}

interface TitleDetailModalProps {
  title: Title | null;
  visible: boolean;
  onClose: () => void;
  onEquip: (titleId: string) => void;
}

function TitleDetailModal({ title, visible, onClose, onEquip }: TitleDetailModalProps) {
  if (!title) return null;

  const textColor = getRarityColor(title.rarity);
  const bgColor = getRarityBgColor(title.rarity);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={28} color="#64748B" />
          </Pressable>
          <Text style={{ color: textColor, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
            {title.rarity}
          </Text>
        </View>

        {/* Title Icon */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: bgColor,
            borderWidth: 2,
            borderColor: textColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            {title.isEarned ? (
              <Ionicons name="ribbon" size={40} color={textColor} />
            ) : (
              <Ionicons name="lock-closed" size={32} color="#64748B" />
            )}
          </View>
          <Text style={{ color: '#E2E8F0', fontSize: 24, fontWeight: '700', textAlign: 'center' }}>
            {title.name}
          </Text>
        </View>

        {/* Details */}
        <SystemWindow variant="default" style={{ marginBottom: 16 }}>
          <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
            DESCRIPTION
          </Text>
          <Text style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 20 }}>
            {title.description}
          </Text>
        </SystemWindow>

        <SystemWindow variant="default" style={{ marginBottom: 16 }}>
          <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
            REQUIREMENT
          </Text>
          <Text style={{ color: title.isEarned ? '#4ADE80' : '#FBBF24', fontSize: 14 }}>
            {title.isEarned ? '✓ ' : ''}{title.requirement}
          </Text>
        </SystemWindow>

        {title.passiveEffect && (
          <SystemWindow variant="success" style={{ marginBottom: 24 }}>
            <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
              PASSIVE EFFECT
            </Text>
            <Text style={{ color: '#4ADE80', fontSize: 14 }}>
              {title.passiveEffect}
            </Text>
          </SystemWindow>
        )}

        {/* Actions */}
        {title.isEarned && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onEquip(title.id);
              onClose();
            }}
            style={({ pressed }) => ({
              backgroundColor: title.isActive ? '#1E293B' : (pressed ? '#60A5FA' : '#60A5FACC'),
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
            })}
            disabled={title.isActive}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
              {title.isActive ? 'Currently Equipped' : 'Equip Title'}
            </Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

export default function TitlesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const { data, isLoading, refetch } = useTitles();
  const setActiveTitleMutation = useSetActiveTitle();

  const titles = data?.titles || [];
  const unlockedCount = data?.totalEarned || 0;
  const totalCount = data?.totalAvailable || 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEquip = async (titleId: string) => {
    await setActiveTitleMutation.mutateAsync(titleId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Sort: active first, then earned, then locked
  const sortedTitles = [...titles].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    if (a.isEarned && !b.isEarned) return -1;
    if (!a.isEarned && b.isEarned) return 1;
    return 0;
  });

  return (
    <>
      <Stack.Screen options={{ title: 'TITLES' }} />
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        {/* Header Stats */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <SystemWindow variant="default">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#64748B', fontSize: 11, letterSpacing: 1 }}>
                  TITLE COLLECTION
                </Text>
                <Text style={{ color: '#E2E8F0', fontSize: 14, marginTop: 2 }}>
                  Achievements that define your journey
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#FBBF24', fontSize: 24, fontWeight: '700' }}>
                  {unlockedCount}
                </Text>
                <Text style={{ color: '#64748B', fontSize: 10 }}>
                  of {totalCount} unlocked
                </Text>
              </View>
            </View>
          </SystemWindow>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
          }
        >
          {isLoading && !refreshing ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#64748B' }}>Loading titles...</Text>
            </View>
          ) : sortedTitles.length > 0 ? (
            sortedTitles.map(title => (
              <TitleCard
                key={title.id}
                title={title}
                onPress={() => setSelectedTitle(title)}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="ribbon-outline" size={32} color="#64748B" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#64748B', fontSize: 14 }}>
                No titles available yet
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Title Detail Modal */}
        <TitleDetailModal
          title={selectedTitle}
          visible={!!selectedTitle}
          onClose={() => setSelectedTitle(null)}
          onEquip={handleEquip}
        />
      </View>
    </>
  );
}
