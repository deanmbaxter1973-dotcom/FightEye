# FightEye iPhone Health connection

Open `FightEyeHealth.xcodeproj` on a Mac with Xcode. Choose a signing team and a unique bundle identifier, then run on an iPhone. The target includes the static FightEye web app from `fighteye_v195_v196` at build time. A GitHub or Netlify update alone does not install or update this native app.

In ClubOS or Athlete Passport, open the athlete's Weight tracker and tap **Connect Apple Health**. Authorise body mass read access. The connection maps this iPhone's Health data to one athlete. The app reads up to 1,000 recent body mass samples from the past three years and refreshes when opened, brought to the foreground, or notified of a change while running. It does not write to Apple Health, upload weights, or read any other Health data type. Manual entries take precedence over Health readings on the same date.

The app copies its bundled web files into a stable Application Support location at launch so the web view continues using the same local storage location after an app update. Sync status shows when Health was last read; **Sync Apple Health now** retries a failed read. A single Health query runs at a time, and a queued refresh runs afterward.

With the HealthKit Background Delivery entitlement, the app registers a body mass observer at launch. When HealthKit wakes it, the observer records only that a refresh is pending and completes the notification. FightEye reads the measurements when the app becomes active and the device permits access; HealthKit may defer delivery, and locked devices may not permit reads. This does not provide a server sync or guarantee instant updates while the app is closed. Disconnect stops the observer and disables background delivery. See [PRIVACY.md](PRIVACY.md).

HealthKit does not tell an app whether read permission was denied. If no entries appear, check Health → Data Access & Devices → FightEye → Body Measurements → Body Mass. Disconnect removes the athlete mapping; it does not erase weights already imported into FightEye. Browser and native app storage are separate. The existing XML import remains available in the browser.

The `iPhone Health bridge build` GitHub Action compiles an unsigned iOS Simulator target and checks that the bundled web files are present. Installing the app still requires Xcode signing and a real iPhone with Health data. The web tests exercise the JavaScript bridge and storage behaviour; neither CI nor the simulator validates the native Health permission prompt or real device delivery.
