// System for local browser notifications and phishing link interceptor

const NOTIFICATION_PERMISSION_KEY = "radarseguro_notifications_enabled";
const REALTIME_PROTECTION_KEY = "radarseguro_realtime_protection_active";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export function isRealtimeProtectionEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(REALTIME_PROTECTION_KEY);
  return val === null ? true : val === "true"; // Enabled by default
}

export function setRealtimeProtectionEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REALTIME_PROTECTION_KEY, String(enabled));
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
    return permission;
  } catch (err) {
    console.warn("Error requesting notification permission:", err);
    return "denied";
  }
}

export interface SecurityAlertPayload {
  title: string;
  body: string;
  risk: "low" | "medium" | "high" | "critical";
  url?: string;
  category?: string;
  onAction?: () => void;
}

/**
 * Triggers a native browser notification (with fallback to custom in-app audio/toaster)
 */
export function triggerSecurityAlertNotification(payload: SecurityAlertPayload): void {
  if (!isRealtimeProtectionEnabled()) return;

  const { title, body, risk, url } = payload;
  const isHighRisk = risk === "high" || risk === "critical";

  // Native Browser Notification
  if (isNotificationSupported() && Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        body: `${body}${url ? `\nDomínio: ${url}` : ""}`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: url ? `scam-alert-${url}` : `scam-alert-${Date.now()}`,
        requireInteraction: isHighRisk, // Keep on screen if critical
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        if (payload.onAction) {
          payload.onAction();
        }
        notification.close();
      };
    } catch (e) {
      console.warn("Could not dispatch native notification:", e);
    }
  }

  // Play distinctive warning sound using Web Audio API if high risk
  if (isHighRisk) {
    playAlertTone();
  }
}

/**
 * Subtle sound synthesizer for security warning alerts
 */
export function playAlertTone(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First beep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);

    // Second alert beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.18); // C6
    osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.35);
    
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // AudioContext might be blocked before user interaction
  }
}
