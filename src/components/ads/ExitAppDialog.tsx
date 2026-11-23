import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LogOut, ExternalLink, Sparkles } from 'lucide-react-native';
import { ThemeColors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

interface ExitAppDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
  colors: ThemeColors;
}

export const ExitAppDialog: React.FC<ExitAppDialogProps> = ({
  visible,
  onCancel,
  onConfirmExit,
  colors,
}) => {
  const { width } = useWindowDimensions();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={[styles.dialogCard, { maxWidth: Math.min(width - 40, 360) }]}>
          {/* Header Title */}
          <Text style={styles.title}>Do you want to exit?</Text>

          {/* Featured Sponsor / Ad Preview Card matching reference image */}
          <View style={styles.adCard}>
            <View style={styles.adBadgeRow}>
              <View style={styles.sponsoredBadge}>
                <Sparkles size={11} color="#2563EB" />
                <Text style={styles.sponsoredText}>Sponsor</Text>
              </View>
              <Text style={styles.adLabel}>Ad</Text>
            </View>

            {/* Ad Banner Graphic */}
            <View style={styles.adGraphic}>
              <View style={styles.adBrandRow}>
                <View style={styles.brandIconCircle}>
                  <Sparkles size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adHeadline}>Luma Smart Utilities</Text>
                  <Text style={styles.adTagline}>Discover fast & reliable mobile tools</Text>
                </View>
              </View>
            </View>

            <Text style={styles.adDescription}>
              Thank you for using Luma Torch. High-power LED flashlight with full RGB screen illumination.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.openAdButton}
              onPress={onCancel}
            >
              <Text style={styles.openAdButtonText}>CONTINUE USING APP</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons: No and Yes */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              style={styles.noButton}
            >
              <Text style={styles.noButtonText}>No</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirmExit}
              style={styles.yesButton}
            >
              <Text style={styles.yesButtonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  adCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 20,
  },
  adBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sponsoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sponsoredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  adLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  adGraphic: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  adBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adHeadline: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  adTagline: {
    color: '#94A3B8',
    fontSize: 11,
  },
  adDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  openAdButton: {
    backgroundColor: '#FBBF24',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openAdButtonText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 8,
  },
  noButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  noButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  yesButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  yesButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
});
