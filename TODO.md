# TODO

TODOs for the upcoming releases of the app.

## 1.3.0

### Features

- [x] feat: While the training view, allocating a kart to a driver. Before the driver stopwatch is started, it should be possible to change the kart. After the stopwatch is started, the kart should be locked in for the running stint.
- [ ] feat: Add a overall statistics view, where the user can see the overall statistics of all trainings and drivers. This view should show the best lap time, the average lap time, the total time, the total number of laps and the total number of stints for each driver. With maybe some diagrams and charts to visualize the data.

### Bugs

- [x] bug(refactor): Currently there are two files initializing the database connection. This can lead to problems because if the connection is initialized twice, it can cause conflicts and errors. The app should have a single point of initialization for the database connection to avoid these problems.

### Misc

_Currently none_

## 1.4.0

- [ ] feat: Championship mode: In this mode, the user can create a championship and add trainings to the championship. The app then calculates the points for each driver based on their performance in the trainings and shows the championship standings. This can be a great feature for users who want to organize a series of trainings and keep track of the performance of their drivers over time.
