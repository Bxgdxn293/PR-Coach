import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useAuth } from './AuthContext';

// react-native-purchases is native only: never run it in the web build (friends test version).
const Purchases: typeof import('react-native-purchases').default =
  Platform.OS === 'web' ? (null as never) : require('react-native-purchases').default;

// Must match the entitlement identifier you create in the RevenueCat dashboard.
export const ENTITLEMENT = 'premium';

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
});

type PremiumCtx = {
  isPremium: boolean;
  ready: boolean;
  configured: boolean;
  packages: PurchasesPackage[];
  buy: (pkg: PurchasesPackage) => Promise<string | null>;
  restore: () => Promise<string | null>;
};

const Ctx = createContext<PremiumCtx>(null as unknown as PremiumCtx);
export const usePremium = () => useContext(Ctx);

// Test switch: unlocks Premium screens in the client while developing (Expo Go) or in the web test build.
// Store builds are native and not __DEV__, so this can never ship in the App Store / Play Store. The server still checks profiles.is_premium for the Form Check.
const DEV_PREMIUM = (__DEV__ || Platform.OS === 'web') && process.env.EXPO_PUBLIC_DEV_PREMIUM === '1';

let configuredOnce = false;

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [ready, setReady] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const configured = !!apiKey;

  const apply = useCallback((info: CustomerInfo) => {
    setIsPremium(info.entitlements.active[ENTITLEMENT] !== undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsPremium(false); // never carry premium over from the previous account
    setPackages([]);
    async function init() {
      if (!apiKey || !user) {
        setIsPremium(false);
        setPackages([]);
        setReady(true);
        return;
      }
      try {
        if (!configuredOnce) {
          Purchases.configure({ apiKey, appUserID: user.id });
          configuredOnce = true;
        } else {
          await Purchases.logIn(user.id);
        }
        const info = await Purchases.getCustomerInfo();
        const offerings = await Purchases.getOfferings();
        if (cancelled) return;
        apply(info);
        setPackages(offerings.current?.availablePackages ?? []);
      } catch {
        // keep free tier if the store is unreachable
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [user, apply]);

  useEffect(() => {
    // Purchases.configure() runs in the effect above (when a user exists), so only subscribe afterwards.
    if (!configured || !user) return;
    const listener = (info: CustomerInfo) => apply(info);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [configured, user, apply]);

  const buy = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      apply(customerInfo);
      return null;
    } catch (e: any) {
      if (e?.userCancelled) return null;
      return e?.message ?? 'Purchase failed.';
    }
  };

  const restore = async () => {
    try {
      const info = await Purchases.restorePurchases();
      apply(info);
      return info.entitlements.active[ENTITLEMENT] ? null : 'No active subscription found.';
    } catch (e: any) {
      return e?.message ?? 'Restore failed.';
    }
  };

  return (
    <Ctx.Provider value={{ isPremium: isPremium || DEV_PREMIUM, ready, configured, packages, buy, restore }}>{children}</Ctx.Provider>
  );
}
