package com.getcapacitor.community.admob.banner;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.RelativeLayout;
import androidx.annotation.NonNull;
import androidx.coordinatorlayout.widget.CoordinatorLayout;
import androidx.core.util.Supplier;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.admob.helpers.AdViewIdHelper;
import com.getcapacitor.community.admob.helpers.RequestHelper;
import com.getcapacitor.community.admob.models.AdMobPluginError;
import com.getcapacitor.community.admob.models.AdMobRevenueData;
import com.getcapacitor.community.admob.models.AdOptions;
import com.getcapacitor.community.admob.models.Executor;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.common.util.BiConsumer;

public class BannerExecutor extends Executor {

    private final JSObject emptyObject = new JSObject();
    private RelativeLayout mAdViewLayout;
    private AdView mAdView;
    private ViewGroup mViewGroup;

    public BannerExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "BannerExecutor");
    }

    private ViewGroup getValidParentViewGroup() {
        Activity activity = activitySupplier != null ? activitySupplier.get() : null;
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            return null;
        }

        View contentView = activity.findViewById(android.R.id.content);
        if (contentView instanceof ViewGroup) {
            ViewGroup contentViewGroup = (ViewGroup) contentView;
            if (contentViewGroup.getChildCount() > 0) {
                View firstChild = contentViewGroup.getChildAt(0);
                if (firstChild instanceof ViewGroup) {
                    mViewGroup = (ViewGroup) firstChild;
                    return mViewGroup;
                }
            }
        }

        if (mViewGroup != null && mViewGroup.getContext() == activity) {
            return mViewGroup;
        }

        return null;
    }

    public void initialize() {
        getValidParentViewGroup();
    }

    public void showBanner(final PluginCall call) {
        final AdOptions adOptions = AdOptions.getFactory().createBannerOptions(call);
        Activity activity = activitySupplier != null ? activitySupplier.get() : null;
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            call.reject("Activity is not available to display banner");
            return;
        }

        Context context = contextSupplier != null ? contextSupplier.get() : null;
        if (context == null) {
            call.reject("Context is not available to display banner");
            return;
        }

        float density = context.getResources().getDisplayMetrics().density;
        int defaultWidthPixels = context.getResources().getDisplayMetrics().widthPixels;

        DisplayMetrics metrics = new DisplayMetrics();
        activity.getWindowManager().getDefaultDisplay().getRealMetrics(metrics);
        int realWidthPixels = metrics.widthPixels;

        boolean fullscreen = false;
        if (activity.getWindow() != null && (activity.getWindow().getAttributes().flags & WindowManager.LayoutParams.FLAG_FULLSCREEN) != 0) {
            fullscreen = true;
        }

        if (mAdView != null) {
            updateExistingAdView(adOptions);
            call.resolve();
            return;
        }

        try {
            mAdView = new AdView(context);

            if (!adOptions.adSize.toString().equals("ADAPTIVE_BANNER")) {
                mAdView.setAdSize(adOptions.adSize.getSize());
            } else {
                // ADAPTIVE BANNER
                mAdView.setAdSize(
                    AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(context, (int) (defaultWidthPixels / density))
                );
            }

            // Setup AdView Layout
            mAdViewLayout = new RelativeLayout(context);
            mAdViewLayout.setHorizontalGravity(Gravity.CENTER_HORIZONTAL);
            mAdViewLayout.setVerticalGravity(Gravity.BOTTOM);

            final CoordinatorLayout.LayoutParams mAdViewLayoutParams = new CoordinatorLayout.LayoutParams(
                CoordinatorLayout.LayoutParams.WRAP_CONTENT,
                CoordinatorLayout.LayoutParams.WRAP_CONTENT
            );

            switch (adOptions.position) {
                case "TOP_CENTER":
                    mAdViewLayoutParams.gravity = Gravity.TOP;
                    break;
                case "CENTER":
                    mAdViewLayoutParams.gravity = Gravity.CENTER;
                    break;
                default:
                    mAdViewLayoutParams.gravity = Gravity.BOTTOM;
                    break;
            }

            mAdViewLayout.setLayoutParams(mAdViewLayoutParams);

            int densityMargin = (int) (adOptions.margin * density);
            int[] margins = new int[] { 0, densityMargin, 0, densityMargin };

            // Center Banner Ads
            int adWidth = (int) (adOptions.adSize.getSize().getWidth() * density);

            if (adWidth <= 0 || adOptions.adSize.toString().equals("ADAPTIVE_BANNER")) {
                int margin = 0;
                if (fullscreen) {
                    margin = (realWidthPixels - defaultWidthPixels) / 2;
                }
                margins[0] = margin;
                margins[2] = margin;
                mAdViewLayoutParams.setMargins(margin, densityMargin, margin, densityMargin);
            } else {
                int sideMargin = ((int) defaultWidthPixels - adWidth) / 2;
                if (fullscreen) {
                    sideMargin = (realWidthPixels - adWidth) / 2;
                }
                margins[0] = sideMargin;
                margins[2] = sideMargin;
                mAdViewLayoutParams.setMargins(sideMargin, densityMargin, sideMargin, densityMargin);
            }

            // set Safe Area only for Android 15+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM && activity.getWindow() != null) {
                View rootView = activity.getWindow().getDecorView();
                rootView.setOnApplyWindowInsetsListener((v, insets) -> {
                    int bottomInset = insets.getSystemWindowInsetBottom();
                    int topInset = insets.getSystemWindowInsetTop();

                    if ("TOP_CENTER".equals(adOptions.position)) {
                        mAdViewLayoutParams.setMargins(margins[0], margins[1] + topInset, margins[2], margins[3]);
                    } else {
                        mAdViewLayoutParams.setMargins(margins[0], margins[1], margins[2], margins[3] + bottomInset);
                    }

                    mAdViewLayout.setLayoutParams(mAdViewLayoutParams);
                    return insets;
                });
            }

            createNewAdView(adOptions);

            call.resolve();
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    public void hideBanner(final PluginCall call) {
        if (mAdView == null) {
            call.reject("You tried to hide a banner that was never shown");
            return;
        }

        try {
            Activity activity = activitySupplier != null ? activitySupplier.get() : null;
            if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
                call.resolve();
                return;
            }
            activity.runOnUiThread(() -> {
                if (mAdViewLayout != null) {
                    mAdViewLayout.setVisibility(View.GONE);
                    if (mAdView != null) {
                        mAdView.pause();
                    }

                    final BannerAdSizeInfo sizeInfo = new BannerAdSizeInfo(0, 0);
                    notifyListeners(BannerAdPluginEvents.SizeChanged.getWebEventName(), sizeInfo);
                }
                call.resolve();
            });
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    public void resumeBanner(final PluginCall call) {
        try {
            Activity activity = activitySupplier != null ? activitySupplier.get() : null;
            if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
                call.resolve();
                return;
            }
            activity.runOnUiThread(() -> {
                if (mAdViewLayout != null && mAdView != null) {
                    mAdViewLayout.setVisibility(View.VISIBLE);
                    mAdView.resume();

                    final BannerAdSizeInfo sizeInfo = new BannerAdSizeInfo(mAdView);
                    notifyListeners(BannerAdPluginEvents.SizeChanged.getWebEventName(), sizeInfo);

                    Log.d(logTag, "Banner AD Resumed");
                }
                call.resolve();
            });
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    public void removeBanner(final PluginCall call) {
        try {
            if (mAdView != null) {
                final AdView adView = mAdView;
                final RelativeLayout adViewLayout = mAdViewLayout;
                Activity activity = activitySupplier != null ? activitySupplier.get() : null;
                if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
                    if (adViewLayout != null && adView != null) {
                        adViewLayout.removeView(adView);
                    }
                    if (adView != null) {
                        adView.destroy();
                    }
                    mAdView = null;
                    if (call != null) call.resolve();
                    return;
                }
                activity.runOnUiThread(() -> {
                    if (mAdView != null) {
                        ViewGroup parent = getValidParentViewGroup();
                        if (parent != null && adViewLayout != null && adViewLayout.getParent() == parent) {
                            parent.removeView(adViewLayout);
                        } else if (adViewLayout != null && adViewLayout.getParent() instanceof ViewGroup) {
                            ((ViewGroup) adViewLayout.getParent()).removeView(adViewLayout);
                        }
                        if (adViewLayout != null && adView != null) {
                            adViewLayout.removeView(adView);
                        }
                        if (adView != null) {
                            adView.destroy();
                        }
                        mAdView = null;
                        Log.d(logTag, "Banner AD Removed");
                        final BannerAdSizeInfo sizeInfo = new BannerAdSizeInfo(0, 0);
                        notifyListeners(BannerAdPluginEvents.SizeChanged.getWebEventName(), sizeInfo);
                    }
                });
            }

            if (call != null) call.resolve();
        } catch (Exception ex) {
            if (call != null) call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    private void updateExistingAdView(AdOptions adOptions) {
        final AdView adView = mAdView;
        Activity activity = activitySupplier != null ? activitySupplier.get() : null;
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            return;
        }
        activity.runOnUiThread(() -> {
            Activity act = activitySupplier != null ? activitySupplier.get() : null;
            if (act == null || act.isFinishing() || act.isDestroyed()) {
                return;
            }
            if (adView == null || adView != mAdView) {
                // Banner was removed or replaced before this task ran.
                return;
            }
            ViewGroup parent = getValidParentViewGroup();
            if (parent != null && mAdViewLayout != null && (mAdViewLayout.getParent() == null || mAdViewLayout.getParent() != parent)) {
                if (mAdViewLayout.getParent() instanceof ViewGroup) {
                    ((ViewGroup) mAdViewLayout.getParent()).removeView(mAdViewLayout);
                }
                parent.addView(mAdViewLayout);
            }
            final AdRequest adRequest = RequestHelper.createRequest(adOptions);
            adView.loadAd(adRequest);
        });
    }

    private void createNewAdView(AdOptions adOptions) {
        final AdView adView = mAdView;
        final RelativeLayout adViewLayout = mAdViewLayout;

        Activity activity = activitySupplier != null ? activitySupplier.get() : null;
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            Log.w(logTag, "Activity is invalid. Aborting createNewAdView.");
            return;
        }

        // Run AdMob In Main UI Thread
        activity.runOnUiThread(() -> {
            Activity currentActivity = activitySupplier != null ? activitySupplier.get() : null;
            if (currentActivity == null || currentActivity.isFinishing() || currentActivity.isDestroyed()) {
                Log.w(logTag, "Activity became invalid before running createNewAdView on UI thread.");
                return;
            }

            if (adView == null || adView != mAdView || adViewLayout == null || adViewLayout != mAdViewLayout) {
                // Banner was removed or replaced before this task ran.
                return;
            }

            ViewGroup parent = getValidParentViewGroup();
            if (parent == null) {
                Log.w(logTag, "Parent ViewGroup is null or invalid. Aborting banner attachment.");
                return;
            }

            final Context context = contextSupplier != null ? contextSupplier.get() : currentActivity;
            final AdRequest adRequest = RequestHelper.createRequest(adOptions);
            // Assign the correct id needed
            AdViewIdHelper.assignIdToAdView(adView, adOptions, adRequest, logTag, context);

            // Safely attach adView to adViewLayout
            if (adView.getParent() != null && adView.getParent() instanceof ViewGroup) {
                ((ViewGroup) adView.getParent()).removeView(adView);
            }
            adViewLayout.addView(adView);

            // Start loading the ad.
            adView.loadAd(adRequest);
            adView.setAdListener(
                new AdListener() {
                    @Override
                    public void onAdLoaded() {
                        Activity act = activitySupplier != null ? activitySupplier.get() : null;
                        if (act == null || act.isFinishing() || act.isDestroyed()) {
                            return;
                        }
                        if (adView != mAdView) {
                            return;
                        }
                        final BannerAdSizeInfo sizeInfo = new BannerAdSizeInfo(adView);

                        notifyListeners(BannerAdPluginEvents.SizeChanged.getWebEventName(), sizeInfo);
                        notifyListeners(BannerAdPluginEvents.Loaded.getWebEventName(), emptyObject);
                        super.onAdLoaded();
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError adError) {
                        if (adView != mAdView) {
                            super.onAdFailedToLoad(adError);
                            return;
                        }

                        ViewGroup currentParent = getValidParentViewGroup();
                        if (currentParent != null && adViewLayout.getParent() == currentParent) {
                            currentParent.removeView(adViewLayout);
                        } else if (adViewLayout.getParent() instanceof ViewGroup) {
                            ((ViewGroup) adViewLayout.getParent()).removeView(adViewLayout);
                        }

                        if (adView.getParent() == adViewLayout) {
                            adViewLayout.removeView(adView);
                        }
                        adView.destroy();
                        mAdView = null;

                        final BannerAdSizeInfo sizeInfo = new BannerAdSizeInfo(0, 0);
                        notifyListeners(BannerAdPluginEvents.SizeChanged.getWebEventName(), sizeInfo);

                        final AdMobPluginError adMobPluginError = new AdMobPluginError(adError);
                        notifyListeners(BannerAdPluginEvents.FailedToLoad.getWebEventName(), adMobPluginError);

                        super.onAdFailedToLoad(adError);
                    }

                    @Override
                    public void onAdOpened() {
                        Activity act = activitySupplier != null ? activitySupplier.get() : null;
                        if (act == null || act.isFinishing() || act.isDestroyed()) {
                            return;
                        }
                        notifyListeners(BannerAdPluginEvents.Opened.getWebEventName(), emptyObject);
                        super.onAdOpened();
                    }

                    @Override
                    public void onAdClosed() {
                        Activity act = activitySupplier != null ? activitySupplier.get() : null;
                        if (act == null || act.isFinishing() || act.isDestroyed()) {
                            return;
                        }
                        notifyListeners(BannerAdPluginEvents.Closed.getWebEventName(), emptyObject);
                        super.onAdClosed();
                    }

                    @Override
                    public void onAdImpression() {
                        Activity act = activitySupplier != null ? activitySupplier.get() : null;
                        if (act == null || act.isFinishing() || act.isDestroyed()) {
                            return;
                        }
                        notifyListeners(BannerAdPluginEvents.AdImpression.getWebEventName(), emptyObject);
                        super.onAdImpression();
                    }
                }
            );

            adView.setOnPaidEventListener((adValue) -> {
                if (adView != mAdView) {
                    return;
                }
                Activity act = activitySupplier != null ? activitySupplier.get() : null;
                if (act == null || act.isFinishing() || act.isDestroyed()) {
                    return;
                }
                String networkName = "";
                String impressionId = "";
                if (adView.getResponseInfo() != null) {
                    networkName = adView.getResponseInfo().getMediationAdapterClassName();
                    if (networkName == null) networkName = "";
                    impressionId = adView.getResponseInfo().getResponseId();
                    if (impressionId == null) impressionId = "";
                }
                AdMobRevenueData revenueData = new AdMobRevenueData(adValue, adView.getAdUnitId(), networkName, impressionId);
                notifyListeners(BannerAdPluginEvents.AdPaid.getWebEventName(), revenueData);
            });

            // Add AdViewLayout on top of the WebView only if parent exists and is valid
            if (adViewLayout.getParent() != null && adViewLayout.getParent() instanceof ViewGroup) {
                ((ViewGroup) adViewLayout.getParent()).removeView(adViewLayout);
            }
            parent.addView(adViewLayout);
        });
    }
}
