Chat Room apps with Cordova, Angularjs & Ionic
=========================

Slides for codeaholics.hk sharing here: (Dec 2013)
[http://www.slideshare.net/EddieLau1/cordova-angularjs-ionic-codeaholics] (http://www.slideshare.net/EddieLau1/cordova-angularjs-ionic-codeaholics)

Trying to make ionic, cordova and mobile SDK works together on my Mac.
And built a Chat Room apps for my coding course students.


Install libraries
-----------------

    brew install node
    npm install -g ionic
    npm install -g cordova
  
* download and setup android SDK in path: http://cordova.apache.org/docs/en/3.1.0/guide_platforms_android_index.md.html#Android%20Platform%20Guide
* download and setup ant in path: http://ant.apache.org/bindownload.cgi


Create new app and build for android / ios
-----------------

    ionic create hello-world
    cd hello-world
    cordova platform add android
    cordova platform add ios
    cordova build


Start modifying code and add features !
---------------

all the source code is in www folder
read [Ionic Tutorials](http://ionicframework.com/tutorials/)


Running as localhost web
----------------------

when you develop, you would want to run the page on your dev machine:

    cd www
    python -m SimpleHTTPServer 8000

you may want to use Grunt when you develop the pages on your dev machine, checkout:

    http://devgeeks.org/slides/melbourne-mobile-talk-2013.2.12/


Running in emulator
----------------

    npm install -g ios-sim
    cordova emulate
    cordova emulate ios    
    cordova emulate android    

Running in connected devices
-------------------

    npm install -g ios-deploy
    cordova run
    cordova run ios 
    cordova run android


Run the app in Eclipse
-----------------

the android project will be available in platforms/android

* open Eclipse
* import the android code with "Import Existing Android Code"
* run the application by right click on left hand side project explorer: "Run As" > "Android"
* create a virtual Android device if you haven't. any device size and any model would do


Run the app in XCode
-----------------

the xcode project file (.xcodeproj) will be available in platforms/ios


Note to myself
---------------

the following doesn't work on mobile:

    <script src="//cdn.firebase.com/v0/firebase.js"></script>
    <script src="//cdn.firebase.com/libs/angularfire/0.3.0/angularfire.min.js"></script>
    
    