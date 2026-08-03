# 📱 Sketchware Implementation Tutorial
## Wrapping Scripture Bible App into a Native Android APK

> **Difficulty:** Beginner-friendly | **Time:** 30–60 minutes | **Result:** Signed APK for Android phones & tablets

---

## Table of Contents

1. [Prerequisites & Tools](#1-prerequisites--tools)
2. [Creating Your Sketchware Project](#2-creating-your-sketchware-project)
3. [Asset Management — Importing index.html](#3-asset-management--importing-indexhtml)
4. [WebView Configuration](#4-webview-configuration)
5. [Android Manifest & Permissions](#5-android-manifest--permissions)
6. [Hardware Acceleration & Performance](#6-hardware-acceleration--performance)
7. [Screen Orientation & Tablet Optimization](#7-screen-orientation--tablet-optimization)
8. [JavaScript Bridge (Android ↔ WebView)](#8-javascript-bridge-android--webview)
9. [Network State Detection](#9-network-state-detection)
10. [APK Build & Signing](#10-apk-build--signing)
11. [Testing on Devices](#11-testing-on-devices)
12. [Publishing & Distribution](#12-publishing--distribution)
13. [Troubleshooting Common Issues](#13-troubleshooting-common-issues)
14. [Alternative: Using Android Studio](#14-alternative-using-android-studio)

---

## 1. Prerequisites & Tools

### Required Apps on Your Android Device

| App | Purpose | Download |
|---|---|---|
| **Sketchware Pro** | Android IDE on your phone | GitHub Releases or trusted APK sites |
| **File Manager** | Moving files to device storage | Built-in or ES File Explorer |
| **USB Debugging** (optional) | Testing on physical device | Developer Options in Android Settings |

### What You'll Need
- ✅ Android device running Android 8.0+ (API 26+)
- ✅ At least 500MB free storage on device
- ✅ The completed `index.html` file (from this project)
- ✅ Basic understanding of Sketchware's block-based IDE
- ✅ (Optional) A signing keystore for release APK

### Understanding the Architecture

```
Your Android APK
    └── MainActivity.java (Sketchware generated)
            └── activity_main.xml
                    └── WebView (Full-screen)
                            └── file:///android_asset/index.html
                                    └── Complete Scripture Bible App
                                            ├── Reads from IndexedDB (DOM Storage)
                                            ├── Fetches Bible text via Internet
                                            └── Saves highlights/notes offline
```

---

## 2. Creating Your Sketchware Project

### Step 2.1: Open Sketchware Pro

1. Launch **Sketchware Pro** on your Android device
2. Tap the **"+"** (plus) button to create a new project
3. Fill in the project details:

```
Project Name:    Scripture Bible App
Package Name:    com.yourname.scripture
  (Example:      com.john.scripturebible)
Version Code:    1
Version Name:    1.0.0
Minimum SDK:     21 (Android 5.0 Lollipop)
Target SDK:      33 (Android 13)
```

> ⚠️ **Package Name Rules:**
> - Must be lowercase letters, numbers, and dots only
> - Format: `com.yourname.appname`
> - Cannot start with a number
> - Must be unique on Google Play Store

### Step 2.2: Set Up the Main Activity

1. After project creation, you'll see the **Activity Designer**
2. Tap **"MainActivity"** to open the design editor
3. We'll configure this in detail in Section 4

---

## 3. Asset Management — Importing index.html

### Step 3.1: Copy index.html to Your Device

**Method A: Via USB Cable**
```
1. Connect device to computer via USB
2. Enable "File Transfer" mode on the device
3. Navigate to: [Device Storage]/Sketchware/mysc/[ProjectID]/files/resource/assets/
4. Copy index.html into this folder
```

**Method B: Via File Manager App on Device**
```
1. Save index.html to your device (Downloads folder)
2. Open a file manager app
3. Navigate to the Sketchware project assets folder:
   Internal Storage → Sketchware → mysc → [Project ID] → files → resource → assets
4. Copy or move index.html into this assets folder
```

**Method C: Via Sketchware Asset Manager (Recommended)**
```
1. In Sketchware, open your project
2. Go to Project Settings (gear icon)
3. Tap "Assets" or "Files" section
4. Tap "+" to import a file
5. Navigate to and select index.html
6. Confirm the import
```

### Step 3.2: Verify the Asset Path

After importing, verify the file appears at:
```
app/
  src/
    main/
      assets/
        index.html    ← Your complete Bible app
```

### Step 3.3: Optional: Add Offline Bible Data

For fully offline operation without any network dependency:

```
assets/
  index.html            ← Main application
  bible-kjv.json        ← (Optional) Pre-downloaded KJV JSON
  icons/
    icon-192.png        ← App icon
    icon-512.png        ← Large icon
```

If you add `bible-kjv.json`, modify the fetch function in `index.html`:

```javascript
// Replace the network fetch URL with:
const resp = await fetch('./bible-kjv.json');  
// This reads from the assets folder in Android WebView
```

---

## 4. WebView Configuration

### Step 4.1: Add WebView to Layout

1. In the **Design** tab of MainActivity, open the **View palette**
2. Find **"WebView"** component
3. Drag it onto the layout canvas
4. Resize to fill the entire screen:
   - Set `layout_width` → `match_parent`
   - Set `layout_height` → `match_parent`
   - Set all margins to `0`
5. Give it an ID: `webview1`

### Step 4.2: Configure WebView via Logic Blocks

In the **Logic** tab of MainActivity:

#### In the `onCreate` event block:

```
[Block 1] Set webview1 WebSettings enableJavaScript: true
[Block 2] Set webview1 WebSettings setDomStorageEnabled: true  
[Block 3] Set webview1 WebSettings setDatabaseEnabled: true
[Block 4] Set webview1 WebSettings setAllowFileAccess: true
[Block 5] Set webview1 WebSettings setAllowFileAccessFromFileURLs: true
[Block 6] Set webview1 WebSettings setAllowUniversalAccessFromFileURLs: true
[Block 7] Set webview1 WebSettings setLoadsImagesAutomatically: true
[Block 8] Set webview1 WebSettings setCacheMode: LOAD_DEFAULT
[Block 9] Set webview1 WebSettings setMixedContentMode: MIXED_CONTENT_ALWAYS_ALLOW
[Block 10] Set webview1 WebSettings setMediaPlaybackRequiresUserGesture: false
[Block 11] Set webview1 WebSettings setSupportZoom: true
[Block 12] Set webview1 WebSettings setBuiltInZoomControls: false
[Block 13] Set webview1 WebSettings setDisplayZoomControls: false
[Block 14] Set webview1 setScrollBarStyle: SCROLLBARS_INSIDE_OVERLAY

[Block 15] webview1.loadUrl("file:///android_asset/index.html")
```

### Step 4.3: Configure via Custom Java Code (Recommended)

In Sketchware Pro, open the **Java** tab and add this to `MainActivity.java`:

```java
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.ConsoleMessage;
import android.net.Uri;

// Inside onCreate(), after setContentView():

WebView webView = (WebView) findViewById(R.id.webview1);
WebSettings webSettings = webView.getSettings();

// ═══════════════════════════════════════════
// JAVASCRIPT & DOM STORAGE — CRITICAL
// ═══════════════════════════════════════════
webSettings.setJavaScriptEnabled(true);
webSettings.setDomStorageEnabled(true);     // Required for localStorage
webSettings.setDatabaseEnabled(true);       // Required for IndexedDB
webSettings.setJavaScriptCanOpenWindowsAutomatically(true);

// ═══════════════════════════════════════════
// FILE ACCESS — Required for local assets
// ═══════════════════════════════════════════
webSettings.setAllowFileAccess(true);
webSettings.setAllowFileAccessFromFileURLs(true);
webSettings.setAllowUniversalAccessFromFileURLs(true);

// ═══════════════════════════════════════════
// VIEWPORT & DISPLAY — Critical for MD3 layout
// ═══════════════════════════════════════════
webSettings.setUseWideViewPort(true);
webSettings.setLoadWithOverviewMode(true);
webSettings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);

// ═══════════════════════════════════════════
// CACHE — For offline Bible text storage
// ═══════════════════════════════════════════
webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

// Set cache database path for large Bible text storage
String cachePath = getApplicationContext().getCacheDir().getAbsolutePath();
webSettings.setAppCachePath(cachePath);

// ═══════════════════════════════════════════
// ZOOM — Disable to prevent accidental zoom
// (Pinch zoom available for maps module)
// ═══════════════════════════════════════════
webSettings.setSupportZoom(true);
webSettings.setBuiltInZoomControls(false);  // Hide ugly zoom buttons
webSettings.setDisplayZoomControls(false);

// ═══════════════════════════════════════════
// MIXED CONTENT — Allow HTTP/HTTPS for AI APIs
// ═══════════════════════════════════════════
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

// ═══════════════════════════════════════════
// MEDIA — Allow audio (for future audio Bible)
// ═══════════════════════════════════════════
webSettings.setMediaPlaybackRequiresUserGesture(false);

// ═══════════════════════════════════════════
// USER AGENT — Identify as Android for responsive CSS
// ═══════════════════════════════════════════
String ua = webSettings.getUserAgentString();
webSettings.setUserAgentString(ua + " ScriptureBibleApp/1.0 Android");

// ═══════════════════════════════════════════
// WEB CLIENT — Handle navigation and errors
// ═══════════════════════════════════════════
webView.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        // Handle external links (open in browser)
        if (url.startsWith("http://") || url.startsWith("https://")) {
            if (!url.contains("openai.com") && 
                !url.contains("googleapis.com") &&
                !url.contains("firebaseio.com") &&
                !url.contains("googleapis.com")) {
                // External link — open in browser
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            }
        }
        return false; // Let WebView handle internal and API calls
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        // Inject device info into the app
        view.evaluateJavascript(
            "window.ANDROID_VERSION = " + android.os.Build.VERSION.SDK_INT + ";",
            null
        );
    }

    @Override
    public void onReceivedError(WebView view, int errorCode, 
                                 String description, String failingUrl) {
        // Handle load errors gracefully
        android.util.Log.e("Scripture", "WebView error: " + description);
    }
});

// ═══════════════════════════════════════════
// CHROME CLIENT — For JavaScript alerts and console
// ═══════════════════════════════════════════
webView.setWebChromeClient(new WebChromeClient() {
    @Override
    public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
        android.util.Log.d("ScriptureJS", 
            consoleMessage.message() + " -- From line " + 
            consoleMessage.lineNumber() + " of " + 
            consoleMessage.sourceId());
        return true;
    }

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
        // You can show a loading indicator here if desired
        super.onProgressChanged(view, newProgress);
    }
});

// ═══════════════════════════════════════════
// SCROLL BARS — Clean look inside WebView
// ═══════════════════════════════════════════
webView.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY);
webView.setScrollbarFadingEnabled(true);

// ═══════════════════════════════════════════
// LOAD THE APP
// ═══════════════════════════════════════════
webView.loadUrl("file:///android_asset/index.html");
```

### Step 4.4: Handle Back Button Navigation

Add back button handling so users can navigate chapter history:

```java
@Override
public void onBackPressed() {
    WebView webView = (WebView) findViewById(R.id.webview1);
    if (webView.canGoBack()) {
        webView.goBack();
    } else {
        // Show exit confirmation dialog
        new android.app.AlertDialog.Builder(this)
            .setTitle("Exit Scripture?")
            .setMessage("Are you sure you want to exit?")
            .setPositiveButton("Exit", (d, w) -> super.onBackPressed())
            .setNegativeButton("Stay", null)
            .show();
    }
}
```

---

## 5. Android Manifest & Permissions

### Step 5.1: Open AndroidManifest.xml

In Sketchware Pro:
1. Go to **Project Settings** → **"Manifest"** tab
2. Or find the file at: `app/src/main/AndroidManifest.xml`

### Step 5.2: Add Required Permissions

Add these permissions **before** the `<application>` tag:

```xml
<!-- REQUIRED: Internet access for Bible text fetch and AI API -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- REQUIRED: Check network status for offline messaging -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- OPTIONAL: WiFi state for smarter sync decisions -->
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

<!-- OPTIONAL: Vibration for haptic feedback on interactions -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- OPTIONAL: Storage for exporting notes (Android 9 and below) -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
```

### Step 5.3: Configure the MainActivity Entry

Update the `<activity>` element in the manifest:

```xml
<application
    android:label="Scripture"
    android:icon="@mipmap/ic_launcher"
    android:theme="@style/AppTheme"
    android:hardwareAccelerated="true"
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">

    <activity
        android:name=".MainActivity"
        android:label="Scripture"
        android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout"
        android:screenOrientation="unspecified"
        android:windowSoftInputMode="adjustResize"
        android:exported="true"
        android:launchMode="singleTop">

        <!-- Make this the launcher activity -->
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>

        <!-- PWA deep link support (optional) -->
        <intent-filter android:autoVerify="true">
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="https" android:host="yourdomain.com" />
        </intent-filter>
    </activity>
</application>
```

### Step 5.4: Network Security Configuration

Create `app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow HTTPS to all domains (for Bible CDN + AI APIs) -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <!-- Allow API calls to AI services -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.openai.com</domain>
        <domain includeSubdomains="true">generativelanguage.googleapis.com</domain>
        <domain includeSubdomains="true">firebaseio.com</domain>
        <domain includeSubdomains="true">firebase.google.com</domain>
        <domain includeSubdomains="true">raw.githubusercontent.com</domain>
        <domain includeSubdomains="true">api.esv.org</domain>
    </domain-config>
</network-security-config>
```

---

## 6. Hardware Acceleration & Performance

### Step 6.1: Enable Hardware Acceleration

Hardware acceleration is **critical** for smooth rendering of:
- The SVG biblical maps
- Smooth chapter transition animations
- The genealogy tree scroll
- Chat message animations

In `AndroidManifest.xml` (already added above):
```xml
<application android:hardwareAccelerated="true" ... >
```

Also add per-activity in some versions:
```xml
<activity android:hardwareAccelerated="true" ... >
```

### Step 6.2: WebView Hardware Layer

In `MainActivity.java`, add after WebView setup:

```java
// Force hardware rendering layer
webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

// For older devices that struggle, use software rendering:
// webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
```

### Step 6.3: Large Storage for IndexedDB

The Bible text cache can be ~50-200MB. Configure adequate storage:

```java
// Increase WebView storage quota (if needed)
webSettings.setAppCacheEnabled(true);

// Set larger database quota via QuotaUpdater (Android API < 19)
// For modern Android, IndexedDB limits are managed by the OS
```

### Step 6.4: Memory Optimization

Add to `MainActivity.java`:

```java
@Override
protected void onPause() {
    super.onPause();
    webView.onPause();
    webView.pauseTimers(); // Stop JavaScript timers to save battery
}

@Override
protected void onResume() {
    super.onResume();
    webView.onResume();
    webView.resumeTimers();
}

@Override
protected void onDestroy() {
    webView.stopLoading();
    webView.clearHistory();
    webView.destroy();
    super.onDestroy();
}
```

### Step 6.5: Smooth Scrolling

In `res/values/styles.xml`, ensure your theme extends a hardware-accelerated variant:

```xml
<resources>
    <style name="AppTheme" parent="Theme.MaterialComponents.Light.NoActionBar">
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowFullscreen">false</item>
        <item name="android:windowTranslucentStatus">false</item>
        <!-- Make status bar transparent for immersive reading -->
        <item name="android:statusBarColor">#1a237e</item>
    </style>
</resources>
```

---

## 7. Screen Orientation & Tablet Optimization

### Step 7.1: Support All Orientations

The Bible app's responsive CSS handles orientation changes automatically. Configure the activity to receive orientation change events instead of restarting:

```xml
<activity
    android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout|uiMode"
    android:screenOrientation="unspecified"
    ... >
```

The `android:configChanges` attribute tells Android: "I'll handle these changes myself — don't restart the activity." This prevents the WebView from reloading `index.html` on rotation!

### Step 7.2: Handle Configuration Changes in Java

```java
@Override
public void onConfigurationChanged(android.content.res.Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    
    WebView webView = (WebView) findViewById(R.id.webview1);
    
    // Notify the web app of orientation change
    String orientation = newConfig.orientation == 
        android.content.res.Configuration.ORIENTATION_LANDSCAPE 
        ? "landscape" : "portrait";
    
    webView.evaluateJavascript(
        "if(window.onOrientationChange) window.onOrientationChange('" + orientation + "');",
        null
    );
    
    // The responsive CSS in index.html handles layout automatically
}
```

### Step 7.3: Tablet-Specific Optimizations

For large screen / foldable support, add to `MainActivity.java`:

```java
// Detect tablet / large screen
private boolean isTablet() {
    return (getResources().getConfiguration().screenLayout & 
            android.content.res.Configuration.SCREENLAYOUT_SIZE_MASK) >= 
            android.content.res.Configuration.SCREENLAYOUT_SIZE_LARGE;
}

// Inject screen information to JavaScript
private void injectDeviceInfo() {
    android.util.DisplayMetrics dm = new android.util.DisplayMetrics();
    getWindowManager().getDefaultDisplay().getMetrics(dm);
    float density = dm.density;
    int widthDp = Math.round(dm.widthPixels / density);
    int heightDp = Math.round(dm.heightPixels / density);
    boolean tablet = isTablet();
    
    String js = String.format(
        "window.DEVICE = { widthDp: %d, heightDp: %d, isTablet: %b, density: %f, platform: 'android' };",
        widthDp, heightDp, tablet, density
    );
    
    webView.evaluateJavascript(js, null);
}

// Call this after onPageFinished
```

### Step 7.4: Status Bar & Edge-to-Edge

For Android 10+ immersive reading experience:

```java
// In onCreate(), after setContentView():
if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
    getWindow().setDecorFitsSystemWindows(false);
    android.view.WindowInsetsController insetsController = getWindow().getInsetsController();
    if (insetsController != null) {
        insetsController.setSystemBarsBehavior(
            android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
    }
}

// For older Android:
getWindow().setFlags(
    android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
    android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
);
```

---

## 8. JavaScript Bridge (Android ↔ WebView)

### Step 8.1: Create Java Interface Class

This allows JavaScript in your Bible app to call Android native features:

```java
// Create ScriptureInterface.java
import android.content.Context;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import android.content.Intent;
import android.net.Uri;

public class ScriptureInterface {
    private Context mContext;
    private MainActivity mActivity;

    public ScriptureInterface(Context context, MainActivity activity) {
        this.mContext = context;
        this.mActivity = activity;
    }

    // Share verse via Android Share Sheet
    @JavascriptInterface
    public void shareText(String text) {
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, text);
        mActivity.startActivity(Intent.createChooser(shareIntent, "Share Verse"));
    }

    // Copy to clipboard
    @JavascriptInterface
    public void copyToClipboard(String text) {
        android.content.ClipboardManager clipboard = 
            (android.content.ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        android.content.ClipData clip = android.content.ClipData.newPlainText("Bible Verse", text);
        clipboard.setPrimaryClip(clip);
        Toast.makeText(mContext, "Verse copied!", Toast.LENGTH_SHORT).show();
    }

    // Show Android Toast notification
    @JavascriptInterface
    public void showToast(String message) {
        Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
    }

    // Get device info for responsive adjustments
    @JavascriptInterface
    public String getDeviceInfo() {
        android.util.DisplayMetrics dm = mContext.getResources().getDisplayMetrics();
        return String.format(
            "{\"width\":%d,\"height\":%d,\"density\":%.1f,\"sdk\":%d,\"model\":\"%s\"}",
            Math.round(dm.widthPixels / dm.density),
            Math.round(dm.heightPixels / dm.density),
            dm.density,
            android.os.Build.VERSION.SDK_INT,
            android.os.Build.MODEL
        );
    }

    // Check network connectivity
    @JavascriptInterface
    public boolean isNetworkAvailable() {
        android.net.ConnectivityManager cm = 
            (android.net.ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
        android.net.NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnected();
    }

    // Haptic feedback
    @JavascriptInterface
    public void vibrate(int milliseconds) {
        android.os.Vibrator vibrator = 
            (android.os.Vibrator) mContext.getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
            vibrator.vibrate(milliseconds);
        }
    }

    // Open external Bible reference URLs
    @JavascriptInterface
    public void openUrl(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        mActivity.startActivity(intent);
    }
}
```

### Step 8.2: Register the Interface

In `MainActivity.java`, add this after WebView setup:

```java
// Register Android bridge
webView.addJavascriptInterface(
    new ScriptureInterface(this, this), 
    "Android"  // Access in JS as: Android.shareText(...)
);
```

### Step 8.3: Use Bridge in JavaScript (index.html)

Modify the `copyVerse()` and `shareVerse()` functions in `index.html`:

```javascript
function copyVerse() {
  const key = APP_STATE.selectedVerseKey;
  if (!key) return;
  const parts = key.split('_');
  const bookMeta = BIBLE_BOOKS.find(b => b.id === parts[0]);
  const text = APP_STATE.bibleData[parts[0]]?.[parts[1]]?.[parts[2]] || '';
  const ref = `${bookMeta.name} ${parts[1]}:${parts[2]} (ESV)`;
  const fullText = `"${text}" — ${ref}`;

  // Use Android bridge if available, else use Clipboard API
  if (window.Android && window.Android.copyToClipboard) {
    window.Android.copyToClipboard(fullText);
  } else {
    navigator.clipboard?.writeText(fullText)
      .then(() => showToast('Verse copied!'))
      .catch(() => showToast('Copy failed'));
  }
  closeContextMenu();
}

function shareVerse() {
  const key = APP_STATE.selectedVerseKey;
  if (!key) return;
  const parts = key.split('_');
  const bookMeta = BIBLE_BOOKS.find(b => b.id === parts[0]);
  const text = APP_STATE.bibleData[parts[0]]?.[parts[1]]?.[parts[2]] || '';
  const ref = `${bookMeta.name} ${parts[1]}:${parts[2]} (ESV)`;
  const fullText = `"${text}" — ${ref}`;

  // Use Android native share sheet if available
  if (window.Android && window.Android.shareText) {
    window.Android.shareText(fullText);
  } else if (navigator.share) {
    navigator.share({ title: ref, text: fullText });
  } else {
    copyVerse();
  }
  closeContextMenu();
}

// Check network status via Android bridge
function checkNetworkStatus() {
  if (window.Android && window.Android.isNetworkAvailable) {
    return window.Android.isNetworkAvailable();
  }
  return navigator.onLine;
}
```

---

## 9. Network State Detection

### Step 9.1: Android Network Callback

Add to `MainActivity.java` to push network changes to JavaScript:

```java
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;

// In onCreate():
ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);

NetworkRequest networkRequest = new NetworkRequest.Builder()
    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    .build();

cm.registerNetworkCallback(networkRequest, new ConnectivityManager.NetworkCallback() {
    @Override
    public void onAvailable(Network network) {
        runOnUiThread(() -> {
            webView.evaluateJavascript(
                "if(window.onNetworkChange) window.onNetworkChange(true);",
                null
            );
        });
    }

    @Override
    public void onLost(Network network) {
        runOnUiThread(() -> {
            webView.evaluateJavascript(
                "if(window.onNetworkChange) window.onNetworkChange(false);",
                null
            );
        });
    }
});
```

### Step 9.2: Handle Network Changes in JavaScript

Add to `index.html`:

```javascript
// Listen for Android network state changes
window.onNetworkChange = function(isOnline) {
  if (isOnline) {
    showToast('Back online — syncing...');
    // Resume any pending Bible text fetches
    fetchAndCacheBook(APP_STATE.currentBook);
    // Sync to Firestore if configured
    // syncToFirestore(currentUser?.uid);
  } else {
    showToast('Offline — reading from cache');
  }
};
```

---

## 10. APK Build & Signing

### Step 10.1: Debug Build (for Testing)

1. In Sketchware Pro, tap the **Build** button (hammer icon)
2. Select **"Export Debug APK"** or **"Build & Install"**
3. Wait for compilation (1–5 minutes depending on device speed)
4. The APK will be saved to:
   ```
   Internal Storage/Sketchware/mysc/[ProjectID]/apk/[ProjectName]-debug.apk
   ```

### Step 10.2: Create a Signing Keystore (for Release)

**Option A: Use Sketchware's Built-in Keystore Manager**
1. Go to Project Settings → **Signing**
2. Tap **"Create Keystore"**
3. Fill in the details:
   ```
   Keystore File: scripture_release.jks
   Keystore Password: [choose strong password]
   Key Alias: scripture_key
   Key Password: [choose strong password]
   Validity: 25 years
   
   Distinguished Name:
     First/Last Name: Your Name
     Organization: Your Organization
     City: Your City
     State: Your State
     Country Code: US
   ```
4. Tap **"Generate"** and save the keystore file securely

> ⚠️ **CRITICAL:** Back up your keystore file! If you lose it, you can NEVER update your app on the Play Store. Store it in multiple secure locations.

**Option B: Generate via Terminal (keytool)**
```bash
keytool -genkey -v \
  -keystore scripture_release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 9125 \
  -alias scripture_key \
  -storepass YOUR_STORE_PASS \
  -keypass YOUR_KEY_PASS \
  -dname "CN=Your Name, OU=Development, O=Your Organization, L=City, S=State, C=US"
```

### Step 10.3: Release Build

1. In Sketchware Pro, go to **Build** → **Export Signed APK**
2. Select your keystore file
3. Enter keystore and key passwords
4. Select key alias
5. Choose output location
6. Tap **Build**

### Step 10.4: APK Optimization

For production APK, enable these optimizations in `build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 
                          'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    
    // Target modern Android for smaller APK
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
}
```

### Step 10.5: App Bundle (for Google Play)

For Google Play submission, build an AAB (Android App Bundle) instead of APK:

```bash
# If using Android Studio/Gradle:
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

---

## 11. Testing on Devices

### Step 11.1: Testing Checklist

#### Phone Testing (< 768px width)
- [ ] Bottom navigation is visible with all 5 tabs
- [ ] Sidebar opens/closes via hamburger menu
- [ ] Verses are readable at default font size (17px)
- [ ] Context menu appears on tap
- [ ] Swipe left/right navigates chapters
- [ ] Dark mode toggle works
- [ ] Notes/highlights persist after app restart
- [ ] AI chat works with API key

#### Tablet Testing (≥ 768px width)
- [ ] Sidebar is always visible (no hamburger needed)
- [ ] Bottom navigation is hidden
- [ ] Right panel (Commentary) can be toggled
- [ ] Dual-pane layout renders correctly
- [ ] Genealogy tree scrolls horizontally without overflow
- [ ] Maps render with all pins visible

#### Offline Testing
1. Install app on device
2. Load Genesis 1 (with internet) — verify it caches
3. Turn off WiFi/Mobile Data completely
4. Close and reopen the app
5. Verify: Genesis 1 still readable from IndexedDB cache ✅
6. Navigate to an uncached book — verify graceful placeholder ✅
7. Turn internet back on — verify book loads and caches ✅

### Step 11.2: Testing with Chrome DevTools (Android)

For debugging JavaScript errors:

1. Enable **USB Debugging** on your Android device:
   ```
   Settings → About Phone → Tap "Build Number" 7 times
   Settings → Developer Options → Enable "USB Debugging"
   ```

2. Connect device to computer via USB

3. On your computer, open Chrome and navigate to:
   ```
   chrome://inspect/#devices
   ```

4. Click **"inspect"** under your app's WebView

5. You now have full Chrome DevTools for debugging:
   - Console for JavaScript errors
   - Network tab for API calls
   - Application tab for IndexedDB/localStorage inspection
   - Elements tab for CSS debugging

### Step 11.3: Performance Profiling

```javascript
// Add to index.html for performance monitoring:
window.addEventListener('load', () => {
  const timing = performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  console.log(`App load time: ${loadTime}ms`);
  
  if (loadTime > 3000) {
    console.warn('Slow load detected. Consider bundling Bible data locally.');
  }
});
```

---

## 12. Publishing & Distribution

### Step 12.1: Google Play Store Submission

1. **Create Developer Account** at play.google.com/console ($25 one-time fee)

2. **Create App Listing:**
   - App name: "Scripture — Complete Bible ESV"
   - Short description (80 chars): "Complete Bible reader with commentary, maps, genealogy & AI scholar"
   - Full description: Detailed feature list
   - Screenshots: Phone (min 2), Tablet (min 1), Feature graphic (1024×500)

3. **Content Rating:** Complete the questionnaire (typically "Everyone")

4. **Upload AAB:** app-release.aab (preferred over APK)

5. **Pricing:** Free (recommended for Bible apps)

6. **Privacy Policy** (required): Describe localStorage/IndexedDB usage and AI API key handling

### Step 12.2: Alternative Distribution Methods

**Direct APK Distribution:**
```
Share signed APK file directly to users
Users must enable "Install from Unknown Sources" in Android settings
Suitable for church distribution, beta testing
```

**GitHub Releases:**
```
Create a GitHub release and attach the signed APK
Provide install instructions in README
```

**Firebase App Distribution (for Beta Testing):**
```
1. Set up Firebase project
2. Enable App Distribution
3. Upload APK
4. Invite testers by email
5. Testers install via Firebase App Distribution app
```

---

## 13. Troubleshooting Common Issues

### Issue 1: "WebView shows blank white screen"

**Cause:** File loading error or JavaScript disabled
**Fix:**
```java
// Verify JavaScript is enabled:
webSettings.setJavaScriptEnabled(true);

// Check the file path:
webView.loadUrl("file:///android_asset/index.html");
// NOT: file://android_asset/index.html (missing slash)

// Enable verbose logging:
WebView.setWebContentsDebuggingEnabled(true);
```

### Issue 2: "IndexedDB / localStorage not working"

**Cause:** DOM storage not enabled
**Fix:**
```java
webSettings.setDomStorageEnabled(true);   // For localStorage
webSettings.setDatabaseEnabled(true);     // For IndexedDB
```

### Issue 3: "API calls to OpenAI/Gemini fail (CORS error)"

**Cause:** Network security configuration blocking HTTPS
**Fix:** Ensure `network_security_config.xml` is properly linked in manifest:
```xml
<application android:networkSecurityConfig="@xml/network_security_config">
```

And `clearTextTrafficPermitted="false"` is set (all AI APIs use HTTPS).

### Issue 4: "App restarts on screen rotation"

**Cause:** Missing `configChanges` in manifest
**Fix:**
```xml
<activity android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout">
```

### Issue 5: "Fonts not loading (Material Icons missing)"

**Cause:** No internet connection on first load
**Fix:** Bundle fonts locally in assets folder:
```
assets/
  fonts/
    MaterialIconsRound.woff2
    Merriweather-Regular.woff2
    ...
```

And update font references in `index.html`:
```css
@font-face {
  font-family: 'Material Icons Round';
  src: url('fonts/MaterialIconsRound.woff2') format('woff2');
}
```

### Issue 6: "App is slow/laggy on older devices"

**Causes & Fixes:**
```java
// For devices with < 2GB RAM, use software rendering:
webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);

// Reduce cache size:
webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);

// In index.html, disable animations:
// Add to CSS:
// @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
```

### Issue 7: "Bible text not caching offline"

**Cause:** Insufficient storage quota or incorrect paths
**Fix:**
```java
// Set explicit database path:
String dbPath = getApplicationContext().getDir("database", Context.MODE_PRIVATE)
                    .getPath();
webSettings.setDatabasePath(dbPath);
webSettings.setDatabaseEnabled(true);

// Also ensure assets can be read:
webSettings.setAllowFileAccess(true);
```

### Issue 8: "App crashes on Android 12+ (package visibility)"

**Cause:** Android 12 requires explicit package visibility declarations
**Fix:** Add to `AndroidManifest.xml`:
```xml
<queries>
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="https" />
    </intent>
    <intent>
        <action android:name="android.intent.action.SEND" />
        <data android:mimeType="text/plain" />
    </intent>
</queries>
```

---

## 14. Alternative: Using Android Studio

For developers who prefer Android Studio over Sketchware:

### Step 14.1: Create New Project

```
File → New → New Project
Template: Empty Activity
Name: Scripture Bible App
Package: com.yourname.scripture
Minimum SDK: API 21
Language: Java (or Kotlin)
```

### Step 14.2: Add index.html to Assets

```bash
# Create assets directory:
mkdir app/src/main/assets/

# Copy your Bible app:
cp index.html app/src/main/assets/
```

### Step 14.3: activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</FrameLayout>
```

### Step 14.4: Build and Run

```bash
# Build debug APK:
./gradlew assembleDebug

# Install on connected device:
./gradlew installDebug

# Build release APK (requires signing config in build.gradle):
./gradlew assembleRelease

# Build App Bundle for Play Store:
./gradlew bundleRelease
```

### Step 14.5: Kotlin Version of MainActivity

```kotlin
class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        webView = findViewById(R.id.webview)
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = false
            displayZoomControls = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
        }
        
        webView.webViewClient = WebViewClient()
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.addJavascriptInterface(ScriptureInterface(this), "Android")
        webView.loadUrl("file:///android_asset/index.html")
    }
    
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack()
        else super.onBackPressed()
    }
    
    override fun onPause() {
        super.onPause()
        webView.onPause()
        webView.pauseTimers()
    }
    
    override fun onResume() {
        super.onResume()
        webView.onResume()
        webView.resumeTimers()
    }
    
    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
```

---

## Appendix A: Minimum build.gradle Configuration

```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.yourname.scripture"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 
                          'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    // No other dependencies needed — the app is entirely self-contained!
}
```

---

## Appendix B: ProGuard Rules for WebView Apps

```
# proguard-rules.pro

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all JavaScript interface classes
-keep class com.yourname.scripture.ScriptureInterface { *; }

# Keep WebViewClient/WebChromeClient
-keep class * extends android.webkit.WebViewClient { *; }
-keep class * extends android.webkit.WebChromeClient { *; }

# Firebase (if used)
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
```

---

*Tutorial Version 2.0 | Last Updated: 2025*
*"Your word is a lamp to my feet and a light to my path." — Psalm 119:105*
