# SmartCall

SmartCall is an AI platform for creating intelligent task scheduler applications. The idea behind this platform is to prepare the base for the developers of Smart Scheduling applications by taking care of all the mandatory functionalities (authentication, task creation, assign constraints to tasks, setting up scheduler, switching between schedulers, notification, customize schedule, etc ...) and let for the developer only the task of creating the *scheduler*, and **more than that**, during the development of this platform we made sure to make it the most easy to **plug-in** or to **swap** schedulers.

## How to make it work !

First download the project :

    $ git clone https://github.com/FouadWahabi/SmartCal smartcall_core

Once downloaded the projects, you're just a few steps away from starting working with `SmartCall`.

Now we just need to install dependencies, run this from the application folder from the command line :

    $ npm install

And here we go, hit start !

    $ npm start


## How it works ?

### Domain Model and brief explanation of the different elements

![](https://i.imgur.com/jKe2nk2.png)

So as you can see, each user has his own context which defines : The state of the user, a user specific scheduler configuration and the *Scheduler* used by the user.

Each user has a list of tasks, and actions.

The task, action, state and configuration has a specific schema which is defines by the Scheduler. Added to this the Scheduler defines the schema of the parameters that he receives from the user to get the schedule.

### How to create a scheduler and define the different schemas ?

To create the scheduler, we need to send a `POST` request to `/api/schedulers/insertScheduler` mentioning the `name`, the REST API endpoint `path`, the `layout`, and the different schemas : `configschemaId`, `taskschemaId`, `stateschemaId`, `scheduleschemaId`, `scheduleparamschemaId`.

And you need make sure that the REST API endpoint of the scheduler has this interface : 

 - /clients/registerClient : the registration endpoint to register the user to the scheduler.
 - /clients/setConfig : to set the user Scheduler configuration.
 - /clients/setState : to set the user state.
 - /clients/getSchedule : to request the user schedule.

### Scheduler Example :

You can take a look at the [GreedyScheduler](https://github.com/SmartCal/GreedyScheduler) example. It's a scheduler based on a greedy algorithm based on the user and the task attributes : energy, money, mood.

You can find in the `config` folder the different schemas for this Scheduler.

## Built With

[StrongLoop Loopback](https://loopback.io/): NodeJs framework.

## Contributing

Thanks for thinking in contributing to this system. Please email me with any suggestions: [Dear Fouad,](mailto:fouad.wahabi@gmail.com) 


## Authors

* **Fouad Wahabi** - Computer Guru  - [LinkedIn](https://www.linkedin.com/in/wfouad) - [Email](mailto:fouad.wahabi@gmail.com) - [Website](wfouad.com)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

