# FightEye iPhone beta release

The iOS app wraps the bundled FightEye web app and reads Apple Health body mass with permission. The Health bridge needs a signed build on a physical iPhone; the unsigned CI build checks compilation and packaging only.

## Before uploading

1. Open `FightEyeHealth.xcodeproj` in Xcode on a Mac. Select the FightEyeHealth target, Signing & Capabilities, and your Apple Developer Program team. Set a bundle identifier owned by that team if `com.fighteye.health` is unavailable. Keep HealthKit and Background Modes (HealthKit processing) enabled.
2. Create the corresponding app record in App Store Connect using that bundle identifier. Set the privacy policy URL to `https://github.com/deanmbaxter1973-dotcom/FightEye/blob/main/ios/FightEyeHealth/PRIVACY.md` after checking it accurately describes the release. Provide a feedback email controlled by your team in TestFlight; do not put a private address in this repository.
3. Increment `CURRENT_PROJECT_VERSION` for each subsequent upload. Set the deployment target and version deliberately before archiving. In Xcode select a generic iOS device, Product → Archive, then Distribute App → App Store Connect → Upload. Let Xcode manage signing for the selected team.
4. In App Store Connect, add internal testers, the beta description and testing notes below. External testers may need beta review and additional TestFlight information. Do not invite testers until the physical device checks pass.

## Suggested beta description

FightEye beta: athlete profiles, local club management, events and optional Apple Health body mass sync. Injury records remain on the device.

## What to test

- On a physical iPhone, create two athletes in different clubs, add photos and yearly results, then switch clubs. Confirm each profile and organisation medal record remains distinct after relaunch.
- Grant Apple Health read permission for body mass to one athlete. Add a sample in Health and verify its weight and date appear in that athlete's profile after opening FightEye. Confirm another athlete does not inherit it.
- Turn off Health body mass permission, relaunch and confirm manual weight entry remains usable. Re-enable permission and confirm synchronisation resumes. Test background delivery by adding a new sample while the app is closed, then reopening it.
- Add a local injury record, relaunch and check it persists on that iPhone. Check a second device does not receive it automatically.
- Check event cards and horizontal timeline in portrait and landscape on an iPhone. Open registration and calendar controls. Verify the displayed date and time before adding an event to Calendar.
- Report the iPhone model, iOS version, app build number, steps to reproduce and an optional screenshot through TestFlight feedback. Avoid including sensitive health details in feedback.

## Release evidence

The GitHub `iPhone Health bridge build` workflow validates the web bridge, compiles unsigned simulator and release device targets, and checks bundled files and the icon. It cannot produce a signed archive or verify Apple Health permission and background delivery. Record the signed TestFlight build number and physical device results with the release before wider testing.

## v221 recovery and event checks

- Export an encrypted profile backup from Settings, save it through the iOS share sheet, then restore it on a second test device. Check club membership, photos, annual results and weight provenance. The second device must not gain injury records.
- Enter an incorrect passphrase and a malformed file. Existing profiles and weights must remain untouched. Restore a valid backup only after exporting current test data, because restoration replaces those records.
- Refresh a changed event catalogue and check the date change notice names the event and old/new dates. Dismiss it and confirm it stays dismissed until a further change.
- Check the event carousel on small iPhones in portrait and landscape, at standard and larger text sizes. Each full card should be reachable by horizontal swipe without overlapping its neighbour or the bottom navigation.
- Review TestFlight crash reports and screenshot feedback after the signed physical-device build. Keep the Xcode archive for symbols; record model, iOS version and build number for each issue.
