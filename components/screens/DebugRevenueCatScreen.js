import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useRevenueCat } from '../../hooks/useRevenueCat';
import { 
  purchasePackage, 
  showCustomerCenter,
  getCustomerInfo,
  hasEntitlement,
  ENTITLEMENTS,
  restorePurchases
} from '../../services/revenueCatService';

/**
 * DebugRevenueCatScreen
 * Écran DE TEST pour vérifier que RevenueCat fonctionne
 * À SUPPRIMER en production
 */
const DebugRevenueCatScreen = () => {
  const { isPro, loading, offerings, customerInfo, error, checkProStatus, handleRestorePurchases } = useRevenueCat();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const handlePurchase = async (pkg) => {
    try {
      setPurchasing(true);
      setSelectedPackageId(pkg.identifier);
      
      console.log('🛒 Purchasing package:', pkg.identifier);
      const success = await purchasePackage(pkg);
      
      if (success) {
        Alert.alert('✅ Success', 'Subscription purchased!');
        await checkProStatus();
      } else {
        Alert.alert('⚠️ Cancelled', 'Purchase was cancelled or failed');
      }
    } catch (err) {
      Alert.alert('❌ Error', err.message);
    } finally {
      setPurchasing(false);
      setSelectedPackageId(null);
    }
  };

  const handleOpenCustomerCenter = async () => {
    try {
      console.log('🎫 Opening Customer Center...');
      await showCustomerCenter();
      // Refresh après Customer Center
      await checkProStatus();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ padding: spacing.lg }}>
        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: spacing.lg }}>
          🧪 RevenueCat Debug
        </Text>

        {/* Status */}
        <View style={{ 
          backgroundColor: isPro ? '#DFF0D8' : '#F2DEDE',
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.lg
        }}>
          <Text style={{ fontWeight: '700', marginBottom: spacing.sm }}>
            Subscription Status
          </Text>
          <Text style={{ fontSize: 16 }}>
            {loading ? '⏳ Loading...' : isPro ? '✅ PRO' : '❌ Free'}
          </Text>
        </View>

        {/* Error */}
        {error && (
          <View style={{ 
            backgroundColor: '#FADBD8',
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.lg
          }}>
            <Text style={{ color: '#C0392B', fontWeight: '700' }}>❌ Error:</Text>
            <Text style={{ color: '#C0392B' }}>{error}</Text>
          </View>
        )}

        {/* Customer Info */}
        {customerInfo && (
          <View style={{ 
            backgroundColor: '#EBF5FB',
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.lg
          }}>
            <Text style={{ fontWeight: '700', marginBottom: spacing.sm }}>
              👤 Customer Info
            </Text>
            <Text>User ID: {customerInfo.originalAppUserId || 'N/A'}</Text>
            <Text>Is Anonymous: {customerInfo.isAnonymous ? 'Yes' : 'No'}</Text>
            <Text>
              Active Entitlements: {Object.keys(customerInfo.entitlements.active).length}
            </Text>
          </View>
        )}

        {/* Offerings */}
        {offerings && offerings.availablePackages && (
          <>
            <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: spacing.lg }}>
              📦 Available Packages
            </Text>
            {offerings.availablePackages.map((pkg) => (
              <View
                key={pkg.identifier}
                style={{
                  borderWidth: 1,
                  borderColor: colors.pupyAccent,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.lg,
                }}
              >
                <Text style={{ fontWeight: '700', marginBottom: spacing.sm }}>
                  {pkg.packageType}
                </Text>
                <Text style={{ marginBottom: spacing.sm }}>{pkg.product.title}</Text>
                <Text style={{ marginBottom: spacing.lg }}>
                  ${pkg.product.price}/{pkg.product.subscriptionPeriod}
                </Text>

                <TouchableOpacity
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchasing || loading}
                  style={{
                    backgroundColor: colors.primary,
                    padding: spacing.base,
                    borderRadius: borderRadius.lg,
                    alignItems: 'center',
                    opacity: purchasing && selectedPackageId === pkg.identifier ? 0.6 : 1,
                  }}
                >
                  {purchasing && selectedPackageId === pkg.identifier ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontWeight: '700' }}>
                      Buy Now
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Actions */}
        <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: spacing.lg, marginTop: spacing.lg }}>
          🔧 Actions
        </Text>

        <TouchableOpacity
          onPress={checkProStatus}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            {loading ? 'Loading...' : '🔄 Check Pro Status'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestorePurchases}
          disabled={loading}
          style={{
            backgroundColor: colors.pupyAccent,
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            💾 Restore Purchases
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenCustomerCenter}
          style={{
            backgroundColor: colors.pupyAccent,
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            🎫 Customer Center
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={{ 
          backgroundColor: '#FEF5E7',
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          marginTop: spacing.lg
        }}>
          <Text style={{ fontWeight: '700', marginBottom: spacing.sm }}>
            ℹ️ Debug Info
          </Text>
          <Text style={{ fontSize: 12, marginBottom: spacing.sm }}>
            • Offerings loaded: {offerings ? '✓' : '✗'}
          </Text>
          <Text style={{ fontSize: 12, marginBottom: spacing.sm }}>
            • Customer info: {customerInfo ? '✓' : '✗'}
          </Text>
          <Text style={{ fontSize: 12, marginBottom: spacing.sm }}>
            • API Key: test_JQyUNiWuAjQjUabkBMlDOBEXhBV
          </Text>
          <Text style={{ fontSize: 12 }}>
            • ⚠️ DEV SCREEN - Remove before production
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DebugRevenueCatScreen;
