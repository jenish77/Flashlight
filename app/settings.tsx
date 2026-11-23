import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Moon,
  Sun,
  Smartphone,
  ShieldCheck,
  Info,
  ExternalLink,
  Camera,
  Sliders,
} from 'lucide-react-native';

import { useThemePreference } from '../src/hooks/useThemePreference';
import { ThemePreference } from '../src/types';
import { Layout } from '../src/constants/layout';
import {
  loadUserPreferences,
  saveRestoreBrightnessPreference,
} from '../src/utils/storage';
import { isExpoGo } from '../src/utils/environment';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, theme, setTheme } = useThemePreference();

  const [restoreBrightness, setRestoreBrightness] = useState<boolean>(true);

  useEffect(() => {
    async function init() {
      const prefs = await loadUserPreferences();
      setRestoreBrightness(prefs.restoreBrightness);
    }
    init();
  }, []);

  const handleToggleRestoreBrightness = async (val: boolean) => {
    setRestoreBrightness(val);
    await saveRestoreBrightnessPreference(val);
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Luma Torch Privacy & Data Notice:\n\n' +
        '1. Camera Access: Luma Torch requests camera access solely to control the rear LED flash. It never accesses, records, or stores any photo or video data.\n\n' +
        '2. Advertising: The app uses Google AdMob. AdMob may process device identifiers and approximate technical data to serve advertisements in compliance with Google Play Developer Policies.\n\n' +
        '3. Personal Data: Luma Torch does not require login, accounts, or collection of personal user details.',
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const themeOptions: { id: ThemePreference; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon size={16} color={theme === 'dark' ? '#FFFFFF' : colors.textSecondary} />,
    },
    {
      id: 'light',
      label: 'Light',
      icon: <Sun size={16} color={theme === 'light' ? '#FFFFFF' : colors.textSecondary} />,
    },
    {
      id: 'system',
      label: 'System',
      icon: <Smartphone size={16} color={theme === 'system' ? '#FFFFFF' : colors.textSecondary} />,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.surfaceBorder },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Theme Preference
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Choose visual style (Dark theme is recommended)
            </Text>

            <View style={styles.themeSelector}>
              {themeOptions.map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => setTheme(opt.id)}
                    style={[
                      styles.themeTab,
                      isSelected && [
                        styles.activeThemeTab,
                        { backgroundColor: colors.primary },
                      ],
                    ]}
                  >
                    {opt.icon}
                    <Text
                      style={[
                        styles.themeTabText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Behavior Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SCREEN LIGHT BEHAVIOR
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <View style={styles.iconTitleRow}>
                  <Sliders size={18} color={colors.secondary} strokeWidth={2.2} />
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    Restore Screen Brightness
                  </Text>
                </View>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  Revert to previous system brightness level when exiting Screen Light mode
                </Text>
              </View>
              <Switch
                value={restoreBrightness}
                onValueChange={handleToggleRestoreBrightness}
                trackColor={{ false: '#334155', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Privacy & Hardware Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PERMISSIONS & PRIVACY
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Camera size={18} color={colors.textSecondary} strokeWidth={2.2} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
                  Camera Hardware Access
                </Text>
                <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
                  Required only for controlling the rear flash LED. No photos or video recordings are ever captured.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={showPrivacyPolicy}
              style={styles.clickableRow}
            >
              <View style={styles.infoRow}>
                <ShieldCheck size={18} color={colors.success} strokeWidth={2.2} />
                <Text style={[styles.clickableLabel, { color: colors.textPrimary }]}>
                  Read Privacy Policy
                </Text>
              </View>
              <ExternalLink size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About App Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Application
              </Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                Luma Torch
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Version
              </Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                1.0.0 (Release 1)
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Environment
              </Text>
              <Text style={[styles.metaValue, { color: colors.textAccent }]}>
                {isExpoGo ? 'Expo Go (Ads Disabled)' : 'Native Standalone'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: '#0A0E17',
    borderRadius: Layout.radius.md,
    padding: 4,
    gap: 4,
  },
  themeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Layout.radius.sm,
    gap: 6,
  },
  activeThemeTab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  themeTabText: {
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: 12,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  clickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  clickableLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
