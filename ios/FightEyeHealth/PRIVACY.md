# FightEye Apple Health privacy notice

FightEye asks for permission to **read body mass** from Apple Health only when you tap **Connect Apple Health** for an athlete. Connect the profile of the person whose Health data is on that iPhone. FightEye does not ask to read other Health categories or write to Apple Health.

The iPhone app copies recent body mass dates and weights into that athlete's local weight tracker. The records remain in FightEye's app storage on that device and are not sent to FightEye servers or included in the team roster export. Apple Health may notify the app of changes in the background; FightEye reads the measurements when the device permits it. Manual entries on a date take precedence over imported Health entries on that date.

You can explicitly export a weight-only JSON backup through the iPhone share sheet or import it into another FightEye installation. The backup contains the selected athlete's name, ID, dates, weights and their source. Treat the file as sensitive and choose a destination you trust. Injury records are never included. A complete Health refresh may remove previously synced Health entries that no longer appear in Health; manual weights and XML imports remain.

**Disconnect** stops the app's future Apple Health reads and background notifications for that athlete. It does not delete measurements already copied into FightEye. You can remove individual weight entries in the tracker. Removing the app also removes its local app data, subject to the iPhone's normal backup and restore settings.

The web version cannot connect directly to HealthKit. If you choose to import an Apple Health `export.xml` file, FightEye reads it on your device and stores only the body mass entries for the athlete you select. The file is not uploaded by the importer.

This notice describes the Apple Health features in FightEye v220. For general questions, use the [FightEye issue tracker](https://github.com/deanmbaxter1973-dotcom/FightEye/issues). Do not post personal health information in a public issue.
