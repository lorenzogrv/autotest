## iai-app

This package is suposed to be the future wrapper for iai reusable applications.

**AT THE MOMENT**, it's not.

The entry point of the iai-app package should export the toolset which is
shared by each application (maybe express and express utils?).

Each directory within the package should be a packaged application.

That means that directories should be packages too, exporting the application.

An application should be a function able to handle a request.

(express.Router, i.e.)

The definition for "application" above seems to fit better with a "service".
