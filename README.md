Sample Ionic android setup
=========================

Trying setup and make ionic, cordova and android SDK works together
I am working on Mac.


Install libraries
-----------------

* brew install node
* npm install -g ionic
* npm install -g cordova
* download and setup android SDK in path: http://cordova.apache.org/docs/en/3.1.0/guide_platforms_android_index.md.html#Android%20Platform%20Guide
* download and setup ant in path: http://ant.apache.org/bindownload.cgi


Create new app and build for android
-----------------

* ionic create hello-world
* cd hello-world
* cordova platform add android
* cordova build


Run the app in Eclipse and Android Emulator
-----------------

the android app will be available in platforms/android

* open Eclipse
* import the android code with "Import Existing Android Code"
* run the application by right click on left hand side project explorer: "Run As" > "Android"
* create a virtual Android device if you haven't. any device size and any model would do


Start modifying code and add features !
---------------

all the source code is in www folder
read [Ionic Tutorials](http://ionicframework.com/tutorials/)

when you develop, you would want to run the page on your dev machine:

    cd www
    python -m SimpleHTTPServer 8000

you may want to use Grunt when you develop the pages on your dev machine, checkout:

    http://devgeeks.org/slides/melbourne-mobile-talk-2013.2.12/