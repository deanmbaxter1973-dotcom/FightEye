# FightEye iPhone Health connection

Open `FightEyeHealth.xcodeproj` on a Mac with Xcode. Choose a signing team and a unique bundle identifier, then run on an iPhone. The target includes the static FightEye web app from `fighteye_v195_v196` at build time. A GitHub or Netlify update alone does not install or update this native app.

In ClubOS or Athlete Passport, open the athlete's Weight tracker and tap **Connect Apple Health**. Authorise body mass read access. The connection maps this iPhone's Health data to one athlete. The app reads up to 1,000 recent body mass samples from the past three years and refreshes when opened, brought to the foreground, or notified of a change while running. It does not write to Apple Health, upload weights, or read any other Health data type. Manual entries take precedence over Health readings on the same date.

HealthKit does not tell an app whether read permission was denied. If no entries appear, check Health → Data Access & Devices → FightEye → Body Measurements → Body Mass. Disconnect removes the athlete mapping; it does not erase weights already imported into FightEye. Browser and native app storage are separate. The existing XML import remains available in the browser.

Build validation requires Xcode on macOS and a real iPhone with Health data. The web tests exercise the JavaScript bridge and storage behaviour; they cannot validate signing, the native permission prompt, or device delivery.
