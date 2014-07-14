Talk2: Location-based Chat Room app with Cordova, Angularjs & Ionic
=========================

Forked from Firebase-Angular Chat app  (http://www.slideshare.net/EddieLau1/cordova-angularjs-ionic-codeaholics)




Install libraries
-----------------

    brew install node
    npm install -g ionic
    npm install -g cordova
  
* download and setup android SDK in path: http://cordova.apache.org/docs/en/3.1.0/guide_platforms_android_index.md.html#Android%20Platform%20Guide
* download and setup ant in path: http://ant.apache.org/bindownload.cgi


Create new app and build for  ios
-----------------

    In your apps folder's terminal run:
    cordova create talk2 talk2.talk2 talk2

    (replace your app's name with talk2)

    cd into the directory

    Run:

    cordova platform add ios

    cd to platforms/ios/www

    Run:

    cordova plugin add org.apache.cordova.geolocation
    cordova plugin add org.apache.cordova.device
    cordova plugin add org.apache.cordova.dialogs
    cordova plugin add org.apache.cordova.network-information






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
    
    