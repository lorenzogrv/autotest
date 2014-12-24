# Data modeling on iai

## Basis

The basic structure of any data driver is abstracted through different objects, decoupling the external model layer's API from db systems' specific implementations.

The objects are named as follows:

* Connection
* DAO _or Database Access Object_
* Manager
* Schema

## `Connection`

It's a wrapper object, following the *Proxy* pattern. It `open`s an `close`s connections to the database server, storing them as `db`. It's builder is a factory who reads the db engine information from the application conf and returns the proper connection depending on the desired db engine.

Developers should never have to write a `Connection` to work with the data model layer.

## `DAO`

Given some data and already opened `Connection`(s), performs operations on the database. Every DAO should implement `create`, `read`, `update`, and `destroy`.

Developers should allways write their `DAO`s, automatic modeling often leads to non-optimous implementations.

## Manager

The `Manager` is the facade on the Model Layer. Other layers will interact with the model layer through it. The manager also holds the relations between diferent data types, interacting with other Managers for that purpose.

## Schema

The `Schema` is the basic unit for each data type. It defines the structure of data, and validates whatever some input data is valid or not for that type. It is also responsible of cleaning that data when validating, so untrusted data sources become trustable after validated.
