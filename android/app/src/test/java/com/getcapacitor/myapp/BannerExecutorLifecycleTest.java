package com.getcapacitor.myapp;

import static org.junit.Assert.*;

import android.app.Activity;
import android.content.Context;
import androidx.core.util.Supplier;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.admob.banner.BannerExecutor;
import org.junit.Before;
import org.junit.Test;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

public class BannerExecutorLifecycleTest {

    private AtomicBoolean notificationSent;
    private AtomicReference<String> lastEventName;

    @Before
    public void setUp() {
        notificationSent = new AtomicBoolean(false);
        lastEventName = new AtomicReference<>(null);
    }

    private BannerExecutor createExecutorWithActivity(Supplier<Context> contextSupplier, Supplier<Activity> activitySupplier) {
        return new BannerExecutor(
            contextSupplier,
            activitySupplier,
            (eventName, data) -> {
                notificationSent.set(true);
                lastEventName.set(eventName);
            },
            "AdMobTest"
        );
    }

    @Test
    public void testInitializeWithNullActivity_DoesNotCrash() {
        BannerExecutor executor = createExecutorWithActivity(() -> null, () -> null);
        try {
            executor.initialize();
            assertTrue(true);
        } catch (Exception e) {
            fail("initialize() threw exception with null Activity: " + e.getMessage());
        }
    }

    @Test
    public void testShowBannerWithNullActivity_RejectsWithoutCrash() {
        BannerExecutor executor = createExecutorWithActivity(() -> null, () -> null);
        AtomicBoolean rejected = new AtomicBoolean(false);

        PluginCall mockCall = new PluginCall(null, "AdMob", "callbackId", "showBanner", new JSObject()) {
            @Override
            public void reject(String msg) {
                rejected.set(true);
            }
            @Override
            public void reject(String msg, String code, Exception ex) {
                rejected.set(true);
            }
            @Override
            public void reject(String msg, Exception ex) {
                rejected.set(true);
            }
        };

        try {
            executor.showBanner(mockCall);
            assertTrue("Expected showBanner to safely reject when Activity is unavailable", rejected.get());
        } catch (Exception e) {
            fail("showBanner() threw exception instead of safe rejection: " + e.getMessage());
        }
    }

    @Test
    public void testHideBannerWithNullActivity_DoesNotCrash() {
        BannerExecutor executor = createExecutorWithActivity(() -> null, () -> null);
        AtomicBoolean rejected = new AtomicBoolean(false);

        PluginCall mockCall = new PluginCall(null, "AdMob", "callbackId", "hideBanner", new JSObject()) {
            @Override
            public void reject(String msg) {
                rejected.set(true);
            }
            @Override
            public void resolve() {}
        };

        try {
            executor.hideBanner(mockCall);
            assertTrue(true);
        } catch (Exception e) {
            fail("hideBanner() threw exception with null Activity: " + e.getMessage());
        }
    }

    @Test
    public void testRemoveBannerWithNullActivity_DoesNotCrash() {
        BannerExecutor executor = createExecutorWithActivity(() -> null, () -> null);
        AtomicBoolean resolved = new AtomicBoolean(false);

        PluginCall mockCall = new PluginCall(null, "AdMob", "callbackId", "removeBanner", new JSObject()) {
            @Override
            public void resolve() {
                resolved.set(true);
            }
            @Override
            public void reject(String msg, Exception ex) {
                fail("removeBanner should not reject on null Activity: " + msg);
            }
        };

        try {
            executor.removeBanner(mockCall);
            assertTrue("Expected removeBanner to resolve safely", resolved.get());
        } catch (Exception e) {
            fail("removeBanner() threw exception with null Activity: " + e.getMessage());
        }
    }

    @Test
    public void testResumeBannerWithNullActivity_DoesNotCrash() {
        BannerExecutor executor = createExecutorWithActivity(() -> null, () -> null);
        AtomicBoolean resolved = new AtomicBoolean(false);

        PluginCall mockCall = new PluginCall(null, "AdMob", "callbackId", "resumeBanner", new JSObject()) {
            @Override
            public void resolve() {
                resolved.set(true);
            }
        };

        try {
            executor.resumeBanner(mockCall);
            assertTrue("Expected resumeBanner to resolve safely", resolved.get());
        } catch (Exception e) {
            fail("resumeBanner() threw exception with null Activity: " + e.getMessage());
        }
    }

    @Test
    public void testRepeatedLifecycleCalls_DoesNotThrowNPE() {
        BannerExecutor executor = createExecutorWithActivity(() -> null, () -> null);
        PluginCall dummyCall = new PluginCall(null, "AdMob", "cbId", "dummy", new JSObject()) {
            @Override
            public void resolve() {}
            @Override
            public void reject(String msg) {}
            @Override
            public void reject(String msg, Exception ex) {}
            @Override
            public void reject(String msg, String code, Exception ex) {}
        };

        try {
            for (int i = 0; i < 5; i++) {
                executor.initialize();
                executor.showBanner(dummyCall);
                executor.hideBanner(dummyCall);
                executor.removeBanner(dummyCall);
                executor.resumeBanner(dummyCall);
            }
            assertTrue("Repeated lifecycle calls completed without crash", true);
        } catch (NullPointerException npe) {
            fail("NullPointerException encountered during rapid lifecycle calls: " + npe.getMessage());
        }
    }
}
