# TODO

TODOs for the upcoming releases of the app.

## Notes

- Maybe move the starter list to a separate route, so we can use the space to show more then one stopwatch at the same time.

## 1.2.0

### Features

- [ ] feat: While the training view, allocating a kart to a driver. Before the driver stopwatch is started, it should be possible to change the kart. After the stopwatch is started, the kart should be locked in for the running stint.
- [x] feat: Add a "trainings view" route where the user can see all trainings that have been created. In this view, the user can also delete trainings.
- [ ] feat: Make laps per stint optional. Currently we need to pass many invalid laps, if the driver is doing less laps then the configured laps per stint. Since this can be common in trainings. We could set the laps per stint to `Infinity`. The UI then should only show the current lap instead of 1 / x laps.
- [x] feat: Add light and dark mode to the app. (PR #11)

### Bugs

- [x] bug: After using the inputs for cones, gates or the invalid lap checkbox, the app keeps focus on the input. This is a problem because it prevents the user from using the keyboard hotkeys.
- [ ] bug: Sometimes, the keyboard hotkeys stop working. This problem is probably related to the user selecting text or when a overflow happens and the page scrolls. The hotkeys should work regardless of the user interaction with the page.
- [ ] bug: When the user opens a trainings view, for a split second, shows that for that UUID there is no training, before showing the correct training. This is a problem because it creates a bad user experience and can cause confusion. The app should show a loading state while the training is being fetched, and only show the "no training" message if the training is not found after the loading state is finished.
- [x] bug: The electron app menu allows the user to open the developer console in production and use the browser specific hotkeys (eg. ctrl + w to close the window). This is a problem because it can cause confusion and can lead to the user accidentally closing the app or opening the developer console. The app menu should be disabled in production, or at least the options that allow the user to open the developer console or use browser specific hotkeys should be disabled. (PR #5)

### Misc

- [x] deps: Update the current used packages to their latest versions (if possible without breaking changes). This will help us to keep the app up to date and to benefit from the latest features and bug fixes of the packages we are using.

## 1.3.0

### Features

- [ ] feat: Add a overall statistics view, where the user can see the overall statistics of all trainings and drivers. This view should show the best lap time, the average lap time, the total time, the total number of laps and the total number of stints for each driver. With maybe some diagrams and charts to visualize the data.

### Bugs

- [ ] bug(refactor): Currently there are two files initializing the database connection. This can lead to problems because if the connection is initialized twice, it can cause conflicts and errors. The app should have a single point of initialization for the database connection to avoid these problems.

### Misc

_Currently none_
