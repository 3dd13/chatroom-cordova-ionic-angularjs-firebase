/*!
 * Copyright 2013 Drifty Co.
 * http://drifty.com/
 *
 * Ionic, v0.9.14
 * A powerful HTML5 mobile app framework.
 * http://ionicframework.com/
 *
 * By @maxlynch, @helloimben, @adamdbradley <3
 *
 * Licensed under the MIT license. Please see LICENSE for more information.
 *
 */;

// Create namespaces 
window.ionic = {
  controllers: {},
  views: {},
  version: '0.9.14'
};;
(function(ionic) {

  var bezierCoord = function (x,y) {
    if(!x) x=0;
    if(!y) y=0;
    return {x: x, y: y};
  };

  function B1(t) { return t*t*t; }
  function B2(t) { return 3*t*t*(1-t); }
  function B3(t) { return 3*t*(1-t)*(1-t); }
  function B4(t) { return (1-t)*(1-t)*(1-t); }

  ionic.Animator = {
    // Quadratic bezier solver
    getQuadraticBezier: function(percent,C1,C2,C3,C4) {
      var pos = new bezierCoord();
      pos.x = C1.x*B1(percent) + C2.x*B2(percent) + C3.x*B3(percent) + C4.x*B4(percent);
      pos.y = C1.y*B1(percent) + C2.y*B2(percent) + C3.y*B3(percent) + C4.y*B4(percent);
      return pos;
    },

    // Cubic bezier solver from https://github.com/arian/cubic-bezier (MIT)
    getCubicBezier: function(x1, y1, x2, y2, duration) {
      // Precision
      epsilon = (1000 / 60 / duration) / 4;

      var curveX = function(t){
        var v = 1 - t;
        return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
      };

      var curveY = function(t){
        var v = 1 - t;
        return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
      };

      var derivativeCurveX = function(t){
        var v = 1 - t;
        return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
      };

      return function(t) {

        var x = t, t0, t1, t2, x2, d2, i;

        // First try a few iterations of Newton's method -- normally very fast.
        for (t2 = x, i = 0; i < 8; i++){
          x2 = curveX(t2) - x;
          if (Math.abs(x2) < epsilon) return curveY(t2);
          d2 = derivativeCurveX(t2);
          if (Math.abs(d2) < 1e-6) break;
          t2 = t2 - x2 / d2;
        }

        t0 = 0, t1 = 1, t2 = x;

        if (t2 < t0) return curveY(t0);
        if (t2 > t1) return curveY(t1);

        // Fallback to the bisection method for reliability.
        while (t0 < t1){
          x2 = curveX(t2);
          if (Math.abs(x2 - x) < epsilon) return curveY(t2);
          if (x > x2) t0 = t2;
          else t1 = t2;
          t2 = (t1 - t0) * 0.5 + t0;
        }

        // Failure
        return curveY(t2);
      };
    },

    animate: function(element, className, fn) {
      return {
        leave: function() {
          var endFunc = function() {

            element.classList.remove('leave');
            element.classList.remove('leave-active');

            element.removeEventListener('webkitTransitionEnd', endFunc);
            element.removeEventListener('transitionEnd', endFunc);
          };
          element.addEventListener('webkitTransitionEnd', endFunc);
          element.addEventListener('transitionEnd', endFunc);

          element.classList.add('leave');
          element.classList.add('leave-active');
          return this;
        },
        enter: function() {
          var endFunc = function() {

            element.classList.remove('enter');
            element.classList.remove('enter-active');

            element.removeEventListener('webkitTransitionEnd', endFunc);
            element.removeEventListener('transitionEnd', endFunc);
          };
          element.addEventListener('webkitTransitionEnd', endFunc);
          element.addEventListener('transitionEnd', endFunc);

          element.classList.add('enter');
          element.classList.add('enter-active');

          return this;
        }
      };
    }
  };
})(ionic);
;
(function(ionic) {
  ionic.DomUtil = {
    getTextBounds: function(textNode) {
      if(document.createRange) {
        var range = document.createRange();
        range.selectNodeContents(textNode);
        if(range.getBoundingClientRect) {
          var rect = range.getBoundingClientRect();

          var sx = window.scrollX;
          var sy = window.scrollY;

          return {
            top: rect.top + sy,
            left: rect.left + sx,
            right: rect.left + sx + rect.width,
            bottom: rect.top + sy + rect.height,
            width: rect.width,
            height: rect.height
          };
        }
      }
      return null;
    },

    getChildIndex: function(element, type) {
      if(type) {
        var ch = element.parentNode.children;
        var c;
        for(var i = 0, k = 0, j = ch.length; i < j; i++) {
          c = ch[i];
          if(c.nodeName && c.nodeName.toLowerCase() == type) {
            if(c == element) {
              return k;
            }
            k++;
          }
        }
      }
      return Array.prototype.slice.call(element.parentNode.children).indexOf(element);
    },
    swapNodes: function(src, dest) {
      dest.parentNode.insertBefore(src, dest);
    },
    /**
     * {returns} the closest parent matching the className
     */
    getParentWithClass: function(e, className) {
      while(e.parentNode) {
        if(e.parentNode.classList && e.parentNode.classList.contains(className)) {
          return e.parentNode;
        }
        e = e.parentNode;
      }
      return null;
    },
    /**
     * {returns} the closest parent or self matching the className
     */
    getParentOrSelfWithClass: function(e, className) {
      while(e) {
        if(e.classList && e.classList.contains(className)) {
          return e;
        }
        e = e.parentNode;
      }
      return null;
    }
  };
})(window.ionic);
;
/**
 * ion-events.js
 *
 * Author: Max Lynch <max@drifty.com>
 *
 * Framework events handles various mobile browser events, and 
 * detects special events like tap/swipe/etc. and emits them
 * as custom events that can be used in an app.
 *
 * Portions lovingly adapted from github.com/maker/ratchet and github.com/alexgibson/tap.js - thanks guys!
 */

(function(ionic) {

  // Custom event polyfill
  if(!window.CustomEvent) {
    (function() {
      var CustomEvent;

      CustomEvent = function(event, params) {
        var evt;
        params = params || {
          bubbles: false,
          cancelable: false,
          detail: undefined
        };
        evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      };

      CustomEvent.prototype = window.Event.prototype;

      window.CustomEvent = CustomEvent;
    })();
  }

  ionic.EventController = {
    VIRTUALIZED_EVENTS: ['tap', 'swipe', 'swiperight', 'swipeleft', 'drag', 'hold', 'release'],

    // Trigger a new event
    trigger: function(eventType, data) {
      var event = new CustomEvent(eventType, { detail: data });

      // Make sure to trigger the event on the given target, or dispatch it from
      // the window if we don't have an event target
      data && data.target && data.target.dispatchEvent(event) || window.dispatchEvent(event);
    },
  
    // Bind an event
    on: function(type, callback, element) {
      var e = element || window;

      // Bind a gesture if it's a virtual event
      for(var i = 0, j = this.VIRTUALIZED_EVENTS.length; i < j; i++) {
        if(type == this.VIRTUALIZED_EVENTS[i]) {
          var gesture = new ionic.Gesture(element);
          gesture.on(type, callback);
          return gesture;
        }
      }

      // Otherwise bind a normal event
      e.addEventListener(type, callback);
    },

    off: function(type, callback, element) {
      element.removeEventListener(type, callback);
    },

    // Register for a new gesture event on the given element
    onGesture: function(type, callback, element) {
      var gesture = new ionic.Gesture(element);
      gesture.on(type, callback);
      return gesture;
    },

    // Unregister a previous gesture event
    offGesture: function(gesture, type, callback) {
      gesture.off(type, callback);
    },

    handlePopState: function(event) {
    },
  };
  
  
  // Map some convenient top-level functions for event handling
  ionic.on = function() { ionic.EventController.on.apply(ionic.EventController, arguments); };
  ionic.off = function() { ionic.EventController.off.apply(ionic.EventController, arguments); };
  ionic.trigger = ionic.EventController.trigger;//function() { ionic.EventController.trigger.apply(ionic.EventController.trigger, arguments); };
  ionic.onGesture = function() { return ionic.EventController.onGesture.apply(ionic.EventController.onGesture, arguments); };
  ionic.offGesture = function() { return ionic.EventController.offGesture.apply(ionic.EventController.offGesture, arguments); };

})(window.ionic);
;
/**
  * Simple gesture controllers with some common gestures that emit
  * gesture events.
  *
  * Ported from github.com/EightMedia/ionic.Gestures.js - thanks!
  */
(function(ionic) {
  
  /**
   * ionic.Gestures
   * use this to create instances
   * @param   {HTMLElement}   element
   * @param   {Object}        options
   * @returns {ionic.Gestures.Instance}
   * @constructor
   */
  ionic.Gesture = function(element, options) {
    return new ionic.Gestures.Instance(element, options || {});
  };

  ionic.Gestures = {};

  // default settings
  ionic.Gestures.defaults = {
    // add styles and attributes to the element to prevent the browser from doing
    // its native behavior. this doesnt prevent the scrolling, but cancels
    // the contextmenu, tap highlighting etc
    // set to false to disable this
    stop_browser_behavior: {
      // this also triggers onselectstart=false for IE
      userSelect: 'none',
      // this makes the element blocking in IE10 >, you could experiment with the value
      // see for more options this issue; https://github.com/EightMedia/hammer.js/issues/241
      touchAction: 'none',
      touchCallout: 'none',
      contentZooming: 'none',
      userDrag: 'none',
      tapHighlightColor: 'rgba(0,0,0,0)'
    }

                           // more settings are defined per gesture at gestures.js
  };

  // detect touchevents
  ionic.Gestures.HAS_POINTEREVENTS = window.navigator.pointerEnabled || window.navigator.msPointerEnabled;
  ionic.Gestures.HAS_TOUCHEVENTS = ('ontouchstart' in window);

  // dont use mouseevents on mobile devices
  ionic.Gestures.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android|silk/i;
  ionic.Gestures.NO_MOUSEEVENTS = ionic.Gestures.HAS_TOUCHEVENTS && window.navigator.userAgent.match(ionic.Gestures.MOBILE_REGEX);

  // eventtypes per touchevent (start, move, end)
  // are filled by ionic.Gestures.event.determineEventTypes on setup
  ionic.Gestures.EVENT_TYPES = {};

  // direction defines
  ionic.Gestures.DIRECTION_DOWN = 'down';
  ionic.Gestures.DIRECTION_LEFT = 'left';
  ionic.Gestures.DIRECTION_UP = 'up';
  ionic.Gestures.DIRECTION_RIGHT = 'right';

  // pointer type
  ionic.Gestures.POINTER_MOUSE = 'mouse';
  ionic.Gestures.POINTER_TOUCH = 'touch';
  ionic.Gestures.POINTER_PEN = 'pen';

  // touch event defines
  ionic.Gestures.EVENT_START = 'start';
  ionic.Gestures.EVENT_MOVE = 'move';
  ionic.Gestures.EVENT_END = 'end';

  // hammer document where the base events are added at
  ionic.Gestures.DOCUMENT = window.document;

  // plugins namespace
  ionic.Gestures.plugins = {};

  // if the window events are set...
  ionic.Gestures.READY = false;

  /**
   * setup events to detect gestures on the document
   */
  function setup() {
    if(ionic.Gestures.READY) {
      return;
    }

    // find what eventtypes we add listeners to
    ionic.Gestures.event.determineEventTypes();

    // Register all gestures inside ionic.Gestures.gestures
    for(var name in ionic.Gestures.gestures) {
      if(ionic.Gestures.gestures.hasOwnProperty(name)) {
        ionic.Gestures.detection.register(ionic.Gestures.gestures[name]);
      }
    }

    // Add touch events on the document
    ionic.Gestures.event.onTouch(ionic.Gestures.DOCUMENT, ionic.Gestures.EVENT_MOVE, ionic.Gestures.detection.detect);
    ionic.Gestures.event.onTouch(ionic.Gestures.DOCUMENT, ionic.Gestures.EVENT_END, ionic.Gestures.detection.detect);

    // ionic.Gestures is ready...!
    ionic.Gestures.READY = true;
  }

  /**
   * create new hammer instance
   * all methods should return the instance itself, so it is chainable.
   * @param   {HTMLElement}       element
   * @param   {Object}            [options={}]
   * @returns {ionic.Gestures.Instance}
   * @constructor
   */
  ionic.Gestures.Instance = function(element, options) {
    var self = this;

    // A null element was passed into the instance, which means
    // whatever lookup was done to find this element failed to find it
    // so we can't listen for events on it.
    if(element === null) {
      console.error('Null element passed to gesture (element does not exist). Not listening for gesture');
      return;
    }

    // setup ionic.GesturesJS window events and register all gestures
    // this also sets up the default options
    setup();

    this.element = element;

    // start/stop detection option
    this.enabled = true;

    // merge options
    this.options = ionic.Gestures.utils.extend(
        ionic.Gestures.utils.extend({}, ionic.Gestures.defaults),
        options || {});

    // add some css to the element to prevent the browser from doing its native behavoir
    if(this.options.stop_browser_behavior) {
      ionic.Gestures.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior);
    }

    // start detection on touchstart
    ionic.Gestures.event.onTouch(element, ionic.Gestures.EVENT_START, function(ev) {
      if(self.enabled) {
        ionic.Gestures.detection.startDetect(self, ev);
      }
    });

    // return instance
    return this;
  };


  ionic.Gestures.Instance.prototype = {
    /**
     * bind events to the instance
     * @param   {String}      gesture
     * @param   {Function}    handler
     * @returns {ionic.Gestures.Instance}
     */
    on: function onEvent(gesture, handler){
      var gestures = gesture.split(' ');
      for(var t=0; t<gestures.length; t++) {
        this.element.addEventListener(gestures[t], handler, false);
      }
      return this;
    },


    /**
     * unbind events to the instance
     * @param   {String}      gesture
     * @param   {Function}    handler
     * @returns {ionic.Gestures.Instance}
     */
    off: function offEvent(gesture, handler){
      var gestures = gesture.split(' ');
      for(var t=0; t<gestures.length; t++) {
        this.element.removeEventListener(gestures[t], handler, false);
      }
      return this;
    },


    /**
     * trigger gesture event
     * @param   {String}      gesture
     * @param   {Object}      eventData
     * @returns {ionic.Gestures.Instance}
     */
    trigger: function triggerEvent(gesture, eventData){
      // create DOM event
      var event = ionic.Gestures.DOCUMENT.createEvent('Event');
      event.initEvent(gesture, true, true);
      event.gesture = eventData;

      // trigger on the target if it is in the instance element,
      // this is for event delegation tricks
      var element = this.element;
      if(ionic.Gestures.utils.hasParent(eventData.target, element)) {
        element = eventData.target;
      }

      element.dispatchEvent(event);
      return this;
    },


    /**
     * enable of disable hammer.js detection
     * @param   {Boolean}   state
     * @returns {ionic.Gestures.Instance}
     */
    enable: function enable(state) {
      this.enabled = state;
      return this;
    }
  };

  /**
   * this holds the last move event,
   * used to fix empty touchend issue
   * see the onTouch event for an explanation
   * @type {Object}
   */
  var last_move_event = null;


  /**
   * when the mouse is hold down, this is true
   * @type {Boolean}
   */
  var enable_detect = false;


  /**
   * when touch events have been fired, this is true
   * @type {Boolean}
   */
  var touch_triggered = false;


  ionic.Gestures.event = {
    /**
     * simple addEventListener
     * @param   {HTMLElement}   element
     * @param   {String}        type
     * @param   {Function}      handler
     */
    bindDom: function(element, type, handler) {
      var types = type.split(' ');
      for(var t=0; t<types.length; t++) {
        element.addEventListener(types[t], handler, false);
      }
    },


    /**
     * touch events with mouse fallback
     * @param   {HTMLElement}   element
     * @param   {String}        eventType        like ionic.Gestures.EVENT_MOVE
     * @param   {Function}      handler
     */
    onTouch: function onTouch(element, eventType, handler) {
      var self = this;

      this.bindDom(element, ionic.Gestures.EVENT_TYPES[eventType], function bindDomOnTouch(ev) {
        var sourceEventType = ev.type.toLowerCase();

        // onmouseup, but when touchend has been fired we do nothing.
        // this is for touchdevices which also fire a mouseup on touchend
        if(sourceEventType.match(/mouse/) && touch_triggered) {
          return;
        }

        // mousebutton must be down or a touch event
        else if( sourceEventType.match(/touch/) ||   // touch events are always on screen
          sourceEventType.match(/pointerdown/) || // pointerevents touch
          (sourceEventType.match(/mouse/) && ev.which === 1)   // mouse is pressed
          ){
            enable_detect = true;
          }

        // mouse isn't pressed
        else if(sourceEventType.match(/mouse/) && ev.which !== 1) {
          enable_detect = false;
        }


        // we are in a touch event, set the touch triggered bool to true,
        // this for the conflicts that may occur on ios and android
        if(sourceEventType.match(/touch|pointer/)) {
          touch_triggered = true;
        }

        // count the total touches on the screen
        var count_touches = 0;

        // when touch has been triggered in this detection session
        // and we are now handling a mouse event, we stop that to prevent conflicts
        if(enable_detect) {
          // update pointerevent
          if(ionic.Gestures.HAS_POINTEREVENTS && eventType != ionic.Gestures.EVENT_END) {
            count_touches = ionic.Gestures.PointerEvent.updatePointer(eventType, ev);
          }
          // touch
          else if(sourceEventType.match(/touch/)) {
            count_touches = ev.touches.length;
          }
          // mouse
          else if(!touch_triggered) {
            count_touches = sourceEventType.match(/up/) ? 0 : 1;
          }

          // if we are in a end event, but when we remove one touch and
          // we still have enough, set eventType to move
          if(count_touches > 0 && eventType == ionic.Gestures.EVENT_END) {
            eventType = ionic.Gestures.EVENT_MOVE;
          }
          // no touches, force the end event
          else if(!count_touches) {
            eventType = ionic.Gestures.EVENT_END;
          }

          // store the last move event
          if(count_touches || last_move_event === null) {
            last_move_event = ev;
          }

          // trigger the handler
          handler.call(ionic.Gestures.detection, self.collectEventData(element, eventType, self.getTouchList(last_move_event, eventType), ev));

          // remove pointerevent from list
          if(ionic.Gestures.HAS_POINTEREVENTS && eventType == ionic.Gestures.EVENT_END) {
            count_touches = ionic.Gestures.PointerEvent.updatePointer(eventType, ev);
          }
        }

        //debug(sourceEventType +" "+ eventType);

        // on the end we reset everything
        if(!count_touches) {
          last_move_event = null;
          enable_detect = false;
          touch_triggered = false;
          ionic.Gestures.PointerEvent.reset();
        }
      });
    },


    /**
     * we have different events for each device/browser
     * determine what we need and set them in the ionic.Gestures.EVENT_TYPES constant
     */
    determineEventTypes: function determineEventTypes() {
      // determine the eventtype we want to set
      var types;

      // pointerEvents magic
      if(ionic.Gestures.HAS_POINTEREVENTS) {
        types = ionic.Gestures.PointerEvent.getEvents();
      }
      // on Android, iOS, blackberry, windows mobile we dont want any mouseevents
      else if(ionic.Gestures.NO_MOUSEEVENTS) {
        types = [
          'touchstart',
          'touchmove',
          'touchend touchcancel'];
      }
      // for non pointer events browsers and mixed browsers,
      // like chrome on windows8 touch laptop
      else {
        types = [
          'touchstart mousedown',
          'touchmove mousemove',
          'touchend touchcancel mouseup'];
      }

      ionic.Gestures.EVENT_TYPES[ionic.Gestures.EVENT_START]  = types[0];
      ionic.Gestures.EVENT_TYPES[ionic.Gestures.EVENT_MOVE]   = types[1];
      ionic.Gestures.EVENT_TYPES[ionic.Gestures.EVENT_END]    = types[2];
    },


    /**
     * create touchlist depending on the event
     * @param   {Object}    ev
     * @param   {String}    eventType   used by the fakemultitouch plugin
     */
    getTouchList: function getTouchList(ev/*, eventType*/) {
      // get the fake pointerEvent touchlist
      if(ionic.Gestures.HAS_POINTEREVENTS) {
        return ionic.Gestures.PointerEvent.getTouchList();
      }
      // get the touchlist
      else if(ev.touches) {
        return ev.touches;
      }
      // make fake touchlist from mouse position
      else {
        ev.indentifier = 1;
        return [ev];
      }
    },


    /**
     * collect event data for ionic.Gestures js
     * @param   {HTMLElement}   element
     * @param   {String}        eventType        like ionic.Gestures.EVENT_MOVE
     * @param   {Object}        eventData
     */
    collectEventData: function collectEventData(element, eventType, touches, ev) {

      // find out pointerType
      var pointerType = ionic.Gestures.POINTER_TOUCH;
      if(ev.type.match(/mouse/) || ionic.Gestures.PointerEvent.matchType(ionic.Gestures.POINTER_MOUSE, ev)) {
        pointerType = ionic.Gestures.POINTER_MOUSE;
      }

      return {
        center      : ionic.Gestures.utils.getCenter(touches),
                    timeStamp   : new Date().getTime(),
                    target      : ev.target,
                    touches     : touches,
                    eventType   : eventType,
                    pointerType : pointerType,
                    srcEvent    : ev,

                    /**
                     * prevent the browser default actions
                     * mostly used to disable scrolling of the browser
                     */
                    preventDefault: function() {
                      if(this.srcEvent.preventManipulation) {
                        this.srcEvent.preventManipulation();
                      }

                      if(this.srcEvent.preventDefault) {
                        //this.srcEvent.preventDefault();
                      }
                    },

                    /**
                     * stop bubbling the event up to its parents
                     */
                    stopPropagation: function() {
                      this.srcEvent.stopPropagation();
                    },

                    /**
                     * immediately stop gesture detection
                     * might be useful after a swipe was detected
                     * @return {*}
                     */
                    stopDetect: function() {
                      return ionic.Gestures.detection.stopDetect();
                    }
      };
    }
  };

  ionic.Gestures.PointerEvent = {
    /**
     * holds all pointers
     * @type {Object}
     */
    pointers: {},

    /**
     * get a list of pointers
     * @returns {Array}     touchlist
     */
    getTouchList: function() {
      var self = this;
      var touchlist = [];

      // we can use forEach since pointerEvents only is in IE10
      Object.keys(self.pointers).sort().forEach(function(id) {
        touchlist.push(self.pointers[id]);
      });
      return touchlist;
    },

    /**
     * update the position of a pointer
     * @param   {String}   type             ionic.Gestures.EVENT_END
     * @param   {Object}   pointerEvent
     */
    updatePointer: function(type, pointerEvent) {
      if(type == ionic.Gestures.EVENT_END) {
        this.pointers = {};
      }
      else {
        pointerEvent.identifier = pointerEvent.pointerId;
        this.pointers[pointerEvent.pointerId] = pointerEvent;
      }

      return Object.keys(this.pointers).length;
    },

    /**
     * check if ev matches pointertype
     * @param   {String}        pointerType     ionic.Gestures.POINTER_MOUSE
     * @param   {PointerEvent}  ev
     */
    matchType: function(pointerType, ev) {
      if(!ev.pointerType) {
        return false;
      }

      var types = {};
      types[ionic.Gestures.POINTER_MOUSE] = (ev.pointerType == ev.MSPOINTER_TYPE_MOUSE || ev.pointerType == ionic.Gestures.POINTER_MOUSE);
      types[ionic.Gestures.POINTER_TOUCH] = (ev.pointerType == ev.MSPOINTER_TYPE_TOUCH || ev.pointerType == ionic.Gestures.POINTER_TOUCH);
      types[ionic.Gestures.POINTER_PEN] = (ev.pointerType == ev.MSPOINTER_TYPE_PEN || ev.pointerType == ionic.Gestures.POINTER_PEN);
      return types[pointerType];
    },


    /**
     * get events
     */
    getEvents: function() {
      return [
        'pointerdown MSPointerDown',
      'pointermove MSPointerMove',
      'pointerup pointercancel MSPointerUp MSPointerCancel'
        ];
    },

    /**
     * reset the list
     */
    reset: function() {
      this.pointers = {};
    }
  };


  ionic.Gestures.utils = {
    /**
     * extend method,
     * also used for cloning when dest is an empty object
     * @param   {Object}    dest
     * @param   {Object}    src
     * @parm	{Boolean}	merge		do a merge
     * @returns {Object}    dest
     */
    extend: function extend(dest, src, merge) {
      for (var key in src) {
        if(dest[key] !== undefined && merge) {
          continue;
        }
        dest[key] = src[key];
      }
      return dest;
    },


    /**
     * find if a node is in the given parent
     * used for event delegation tricks
     * @param   {HTMLElement}   node
     * @param   {HTMLElement}   parent
     * @returns {boolean}       has_parent
     */
    hasParent: function(node, parent) {
      while(node){
        if(node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    },


    /**
     * get the center of all the touches
     * @param   {Array}     touches
     * @returns {Object}    center
     */
    getCenter: function getCenter(touches) {
      var valuesX = [], valuesY = [];

      for(var t= 0,len=touches.length; t<len; t++) {
        valuesX.push(touches[t].pageX);
        valuesY.push(touches[t].pageY);
      }

      return {
        pageX: ((Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2),
          pageY: ((Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2)
      };
    },


    /**
     * calculate the velocity between two points
     * @param   {Number}    delta_time
     * @param   {Number}    delta_x
     * @param   {Number}    delta_y
     * @returns {Object}    velocity
     */
    getVelocity: function getVelocity(delta_time, delta_x, delta_y) {
      return {
        x: Math.abs(delta_x / delta_time) || 0,
        y: Math.abs(delta_y / delta_time) || 0
      };
    },


    /**
     * calculate the angle between two coordinates
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {Number}    angle
     */
    getAngle: function getAngle(touch1, touch2) {
      var y = touch2.pageY - touch1.pageY,
      x = touch2.pageX - touch1.pageX;
      return Math.atan2(y, x) * 180 / Math.PI;
    },


    /**
     * angle to direction define
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {String}    direction constant, like ionic.Gestures.DIRECTION_LEFT
     */
    getDirection: function getDirection(touch1, touch2) {
      var x = Math.abs(touch1.pageX - touch2.pageX),
      y = Math.abs(touch1.pageY - touch2.pageY);

      if(x >= y) {
        return touch1.pageX - touch2.pageX > 0 ? ionic.Gestures.DIRECTION_LEFT : ionic.Gestures.DIRECTION_RIGHT;
      }
      else {
        return touch1.pageY - touch2.pageY > 0 ? ionic.Gestures.DIRECTION_UP : ionic.Gestures.DIRECTION_DOWN;
      }
    },


    /**
     * calculate the distance between two touches
     * @param   {Touch}     touch1
     * @param   {Touch}     touch2
     * @returns {Number}    distance
     */
    getDistance: function getDistance(touch1, touch2) {
      var x = touch2.pageX - touch1.pageX,
      y = touch2.pageY - touch1.pageY;
      return Math.sqrt((x*x) + (y*y));
    },


    /**
     * calculate the scale factor between two touchLists (fingers)
     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
     * @param   {Array}     start
     * @param   {Array}     end
     * @returns {Number}    scale
     */
    getScale: function getScale(start, end) {
      // need two fingers...
      if(start.length >= 2 && end.length >= 2) {
        return this.getDistance(end[0], end[1]) /
          this.getDistance(start[0], start[1]);
      }
      return 1;
    },


    /**
     * calculate the rotation degrees between two touchLists (fingers)
     * @param   {Array}     start
     * @param   {Array}     end
     * @returns {Number}    rotation
     */
    getRotation: function getRotation(start, end) {
      // need two fingers
      if(start.length >= 2 && end.length >= 2) {
        return this.getAngle(end[1], end[0]) -
          this.getAngle(start[1], start[0]);
      }
      return 0;
    },


    /**
     * boolean if the direction is vertical
     * @param    {String}    direction
     * @returns  {Boolean}   is_vertical
     */
    isVertical: function isVertical(direction) {
      return (direction == ionic.Gestures.DIRECTION_UP || direction == ionic.Gestures.DIRECTION_DOWN);
    },


    /**
     * stop browser default behavior with css props
     * @param   {HtmlElement}   element
     * @param   {Object}        css_props
     */
    stopDefaultBrowserBehavior: function stopDefaultBrowserBehavior(element, css_props) {
      var prop,
      vendors = ['webkit','khtml','moz','Moz','ms','o',''];

      if(!css_props || !element.style) {
        return;
      }

      // with css properties for modern browsers
      for(var i = 0; i < vendors.length; i++) {
        for(var p in css_props) {
          if(css_props.hasOwnProperty(p)) {
            prop = p;

            // vender prefix at the property
            if(vendors[i]) {
              prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
            }

            // set the style
            element.style[prop] = css_props[p];
          }
        }
      }

      // also the disable onselectstart
      if(css_props.userSelect == 'none') {
        element.onselectstart = function() {
          return false;
        };
      }
    }
  };


  ionic.Gestures.detection = {
    // contains all registred ionic.Gestures.gestures in the correct order
    gestures: [],

    // data of the current ionic.Gestures.gesture detection session
    current: null,

    // the previous ionic.Gestures.gesture session data
    // is a full clone of the previous gesture.current object
    previous: null,

    // when this becomes true, no gestures are fired
    stopped: false,


    /**
     * start ionic.Gestures.gesture detection
     * @param   {ionic.Gestures.Instance}   inst
     * @param   {Object}            eventData
     */
    startDetect: function startDetect(inst, eventData) {
      // already busy with a ionic.Gestures.gesture detection on an element
      if(this.current) {
        return;
      }

      this.stopped = false;

      this.current = {
        inst        : inst, // reference to ionic.GesturesInstance we're working for
        startEvent  : ionic.Gestures.utils.extend({}, eventData), // start eventData for distances, timing etc
        lastEvent   : false, // last eventData
        name        : '' // current gesture we're in/detected, can be 'tap', 'hold' etc
      };

      this.detect(eventData);
    },


    /**
     * ionic.Gestures.gesture detection
     * @param   {Object}    eventData
     */
    detect: function detect(eventData) {
      if(!this.current || this.stopped) {
        return;
      }

      // extend event data with calculations about scale, distance etc
      eventData = this.extendEventData(eventData);

      // instance options
      var inst_options = this.current.inst.options;

      // call ionic.Gestures.gesture handlers
      for(var g=0,len=this.gestures.length; g<len; g++) {
        var gesture = this.gestures[g];

        // only when the instance options have enabled this gesture
        if(!this.stopped && inst_options[gesture.name] !== false) {
          // if a handler returns false, we stop with the detection
          if(gesture.handler.call(gesture, eventData, this.current.inst) === false) {
            this.stopDetect();
            break;
          }
        }
      }

      // store as previous event event
      if(this.current) {
        this.current.lastEvent = eventData;
      }

      // endevent, but not the last touch, so dont stop
      if(eventData.eventType == ionic.Gestures.EVENT_END && !eventData.touches.length-1) {
        this.stopDetect();
      }

      return eventData;
    },


    /**
     * clear the ionic.Gestures.gesture vars
     * this is called on endDetect, but can also be used when a final ionic.Gestures.gesture has been detected
     * to stop other ionic.Gestures.gestures from being fired
     */
    stopDetect: function stopDetect() {
      // clone current data to the store as the previous gesture
      // used for the double tap gesture, since this is an other gesture detect session
      this.previous = ionic.Gestures.utils.extend({}, this.current);

      // reset the current
      this.current = null;

      // stopped!
      this.stopped = true;
    },


    /**
     * extend eventData for ionic.Gestures.gestures
     * @param   {Object}   ev
     * @returns {Object}   ev
     */
    extendEventData: function extendEventData(ev) {
      var startEv = this.current.startEvent;

      // if the touches change, set the new touches over the startEvent touches
      // this because touchevents don't have all the touches on touchstart, or the
      // user must place his fingers at the EXACT same time on the screen, which is not realistic
      // but, sometimes it happens that both fingers are touching at the EXACT same time
      if(startEv && (ev.touches.length != startEv.touches.length || ev.touches === startEv.touches)) {
        // extend 1 level deep to get the touchlist with the touch objects
        startEv.touches = [];
        for(var i=0,len=ev.touches.length; i<len; i++) {
          startEv.touches.push(ionic.Gestures.utils.extend({}, ev.touches[i]));
        }
      }

      var delta_time = ev.timeStamp - startEv.timeStamp,
          delta_x = ev.center.pageX - startEv.center.pageX,
          delta_y = ev.center.pageY - startEv.center.pageY,
          velocity = ionic.Gestures.utils.getVelocity(delta_time, delta_x, delta_y);

      ionic.Gestures.utils.extend(ev, {
        deltaTime   : delta_time,

        deltaX      : delta_x,
        deltaY      : delta_y,

        velocityX   : velocity.x,
        velocityY   : velocity.y,

        distance    : ionic.Gestures.utils.getDistance(startEv.center, ev.center),
        angle       : ionic.Gestures.utils.getAngle(startEv.center, ev.center),
        direction   : ionic.Gestures.utils.getDirection(startEv.center, ev.center),

        scale       : ionic.Gestures.utils.getScale(startEv.touches, ev.touches),
        rotation    : ionic.Gestures.utils.getRotation(startEv.touches, ev.touches),

        startEvent  : startEv
      });

      return ev;
    },


    /**
     * register new gesture
     * @param   {Object}    gesture object, see gestures.js for documentation
     * @returns {Array}     gestures
     */
    register: function register(gesture) {
      // add an enable gesture options if there is no given
      var options = gesture.defaults || {};
      if(options[gesture.name] === undefined) {
        options[gesture.name] = true;
      }

      // extend ionic.Gestures default options with the ionic.Gestures.gesture options
      ionic.Gestures.utils.extend(ionic.Gestures.defaults, options, true);

      // set its index
      gesture.index = gesture.index || 1000;

      // add ionic.Gestures.gesture to the list
      this.gestures.push(gesture);

      // sort the list by index
      this.gestures.sort(function(a, b) {
        if (a.index < b.index) {
          return -1;
        }
        if (a.index > b.index) {
          return 1;
        }
        return 0;
      });

      return this.gestures;
    }
  };


  ionic.Gestures.gestures = ionic.Gestures.gestures || {};

  /**
   * Custom gestures
   * ==============================
   *
   * Gesture object
   * --------------------
   * The object structure of a gesture:
   *
   * { name: 'mygesture',
   *   index: 1337,
   *   defaults: {
   *     mygesture_option: true
   *   }
   *   handler: function(type, ev, inst) {
   *     // trigger gesture event
   *     inst.trigger(this.name, ev);
   *   }
   * }

   * @param   {String}    name
   * this should be the name of the gesture, lowercase
   * it is also being used to disable/enable the gesture per instance config.
   *
   * @param   {Number}    [index=1000]
   * the index of the gesture, where it is going to be in the stack of gestures detection
   * like when you build an gesture that depends on the drag gesture, it is a good
   * idea to place it after the index of the drag gesture.
   *
   * @param   {Object}    [defaults={}]
   * the default settings of the gesture. these are added to the instance settings,
   * and can be overruled per instance. you can also add the name of the gesture,
   * but this is also added by default (and set to true).
   *
   * @param   {Function}  handler
   * this handles the gesture detection of your custom gesture and receives the
   * following arguments:
   *
   *      @param  {Object}    eventData
   *      event data containing the following properties:
   *          timeStamp   {Number}        time the event occurred
   *          target      {HTMLElement}   target element
   *          touches     {Array}         touches (fingers, pointers, mouse) on the screen
   *          pointerType {String}        kind of pointer that was used. matches ionic.Gestures.POINTER_MOUSE|TOUCH
   *          center      {Object}        center position of the touches. contains pageX and pageY
   *          deltaTime   {Number}        the total time of the touches in the screen
   *          deltaX      {Number}        the delta on x axis we haved moved
   *          deltaY      {Number}        the delta on y axis we haved moved
   *          velocityX   {Number}        the velocity on the x
   *          velocityY   {Number}        the velocity on y
   *          angle       {Number}        the angle we are moving
   *          direction   {String}        the direction we are moving. matches ionic.Gestures.DIRECTION_UP|DOWN|LEFT|RIGHT
   *          distance    {Number}        the distance we haved moved
   *          scale       {Number}        scaling of the touches, needs 2 touches
   *          rotation    {Number}        rotation of the touches, needs 2 touches *
   *          eventType   {String}        matches ionic.Gestures.EVENT_START|MOVE|END
   *          srcEvent    {Object}        the source event, like TouchStart or MouseDown *
   *          startEvent  {Object}        contains the same properties as above,
   *                                      but from the first touch. this is used to calculate
   *                                      distances, deltaTime, scaling etc
   *
   *      @param  {ionic.Gestures.Instance}    inst
   *      the instance we are doing the detection for. you can get the options from
   *      the inst.options object and trigger the gesture event by calling inst.trigger
   *
   *
   * Handle gestures
   * --------------------
   * inside the handler you can get/set ionic.Gestures.detectionic.current. This is the current
   * detection sessionic. It has the following properties
   *      @param  {String}    name
   *      contains the name of the gesture we have detected. it has not a real function,
  *      only to check in other gestures if something is detected.
    *      like in the drag gesture we set it to 'drag' and in the swipe gesture we can
    *      check if the current gesture is 'drag' by accessing ionic.Gestures.detectionic.current.name
    *
    *      @readonly
    *      @param  {ionic.Gestures.Instance}    inst
    *      the instance we do the detection for
    *
    *      @readonly
    *      @param  {Object}    startEvent
    *      contains the properties of the first gesture detection in this sessionic.
    *      Used for calculations about timing, distance, etc.
    *
    *      @readonly
    *      @param  {Object}    lastEvent
    *      contains all the properties of the last gesture detect in this sessionic.
    *
    * after the gesture detection session has been completed (user has released the screen)
    * the ionic.Gestures.detectionic.current object is copied into ionic.Gestures.detectionic.previous,
    * this is usefull for gestures like doubletap, where you need to know if the
      * previous gesture was a tap
      *
      * options that have been set by the instance can be received by calling inst.options
      *
      * You can trigger a gesture event by calling inst.trigger("mygesture", event).
      * The first param is the name of your gesture, the second the event argument
      *
      *
      * Register gestures
      * --------------------
      * When an gesture is added to the ionic.Gestures.gestures object, it is auto registered
      * at the setup of the first ionic.Gestures instance. You can also call ionic.Gestures.detectionic.register
      * manually and pass your gesture object as a param
      *
      */

      /**
       * Hold
       * Touch stays at the same place for x time
       * @events  hold
       */
      ionic.Gestures.gestures.Hold = {
        name: 'hold',
        index: 10,
        defaults: {
          hold_timeout	: 500,
          hold_threshold	: 1
        },
        timer: null,
        handler: function holdGesture(ev, inst) {
          switch(ev.eventType) {
            case ionic.Gestures.EVENT_START:
              // clear any running timers
              clearTimeout(this.timer);

              // set the gesture so we can check in the timeout if it still is
              ionic.Gestures.detection.current.name = this.name;

              // set timer and if after the timeout it still is hold,
              // we trigger the hold event
              this.timer = setTimeout(function() {
                if(ionic.Gestures.detection.current.name == 'hold') {
                  inst.trigger('hold', ev);
                }
              }, inst.options.hold_timeout);
              break;

              // when you move or end we clear the timer
            case ionic.Gestures.EVENT_MOVE:
              if(ev.distance > inst.options.hold_threshold) {
                clearTimeout(this.timer);
              }
              break;

            case ionic.Gestures.EVENT_END:
              clearTimeout(this.timer);
              break;
          }
        }
      };


  /**
   * Tap/DoubleTap
   * Quick touch at a place or double at the same place
   * @events  tap, doubletap
   */
  ionic.Gestures.gestures.Tap = {
    name: 'tap',
    index: 100,
    defaults: {
      tap_max_touchtime	: 250,
      tap_max_distance	: 10,
      tap_always			: true,
      doubletap_distance	: 20,
      doubletap_interval	: 300
    },
    handler: function tapGesture(ev, inst) {
      if(ev.eventType == ionic.Gestures.EVENT_END) {
        // previous gesture, for the double tap since these are two different gesture detections
        var prev = ionic.Gestures.detection.previous,
        did_doubletap = false;

        // when the touchtime is higher then the max touch time
        // or when the moving distance is too much
        if(ev.deltaTime > inst.options.tap_max_touchtime ||
            ev.distance > inst.options.tap_max_distance) {
              return;
            }

        // check if double tap
        if(prev && prev.name == 'tap' &&
            (ev.timeStamp - prev.lastEvent.timeStamp) < inst.options.doubletap_interval &&
            ev.distance < inst.options.doubletap_distance) {
              inst.trigger('doubletap', ev);
              did_doubletap = true;
            }

        // do a single tap
        if(!did_doubletap || inst.options.tap_always) {
          ionic.Gestures.detection.current.name = 'tap';
          inst.trigger(ionic.Gestures.detection.current.name, ev);
        }
      }
    }
  };


  /**
   * Swipe
   * triggers swipe events when the end velocity is above the threshold
   * @events  swipe, swipeleft, swiperight, swipeup, swipedown
   */
  ionic.Gestures.gestures.Swipe = {
    name: 'swipe',
    index: 40,
    defaults: {
      // set 0 for unlimited, but this can conflict with transform
      swipe_max_touches  : 1,
      swipe_velocity     : 0.7
    },
    handler: function swipeGesture(ev, inst) {
      if(ev.eventType == ionic.Gestures.EVENT_END) {
        // max touches
        if(inst.options.swipe_max_touches > 0 &&
            ev.touches.length > inst.options.swipe_max_touches) {
              return;
            }

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(ev.velocityX > inst.options.swipe_velocity ||
            ev.velocityY > inst.options.swipe_velocity) {
              // trigger swipe events
              inst.trigger(this.name, ev);
              inst.trigger(this.name + ev.direction, ev);
            }
      }
    }
  };


  /**
   * Drag
   * Move with x fingers (default 1) around on the page. Blocking the scrolling when
   * moving left and right is a good practice. When all the drag events are blocking
   * you disable scrolling on that area.
   * @events  drag, drapleft, dragright, dragup, dragdown
   */
  ionic.Gestures.gestures.Drag = {
    name: 'drag',
    index: 50,
    defaults: {
      drag_min_distance : 10,
      // Set correct_for_drag_min_distance to true to make the starting point of the drag
      // be calculated from where the drag was triggered, not from where the touch started.
      // Useful to avoid a jerk-starting drag, which can make fine-adjustments
      // through dragging difficult, and be visually unappealing.
      correct_for_drag_min_distance : true,
      // set 0 for unlimited, but this can conflict with transform
      drag_max_touches  : 1,
      // prevent default browser behavior when dragging occurs
      // be careful with it, it makes the element a blocking element
      // when you are using the drag gesture, it is a good practice to set this true
      drag_block_horizontal   : true,
      drag_block_vertical     : true,
      // drag_lock_to_axis keeps the drag gesture on the axis that it started on,
      // It disallows vertical directions if the initial direction was horizontal, and vice versa.
      drag_lock_to_axis       : false,
      // drag lock only kicks in when distance > drag_lock_min_distance
      // This way, locking occurs only when the distance has become large enough to reliably determine the direction
      drag_lock_min_distance : 25
    },
    triggered: false,
    handler: function dragGesture(ev, inst) {
      // current gesture isnt drag, but dragged is true
      // this means an other gesture is busy. now call dragend
      if(ionic.Gestures.detection.current.name != this.name && this.triggered) {
        inst.trigger(this.name +'end', ev);
        this.triggered = false;
        return;
      }

      // max touches
      if(inst.options.drag_max_touches > 0 &&
          ev.touches.length > inst.options.drag_max_touches) {
            return;
          }

      switch(ev.eventType) {
        case ionic.Gestures.EVENT_START:
          this.triggered = false;
          break;

        case ionic.Gestures.EVENT_MOVE:
          // when the distance we moved is too small we skip this gesture
          // or we can be already in dragging
          if(ev.distance < inst.options.drag_min_distance &&
              ionic.Gestures.detection.current.name != this.name) {
                return;
              }

          // we are dragging!
          if(ionic.Gestures.detection.current.name != this.name) {
            ionic.Gestures.detection.current.name = this.name;
            if (inst.options.correct_for_drag_min_distance) {
              // When a drag is triggered, set the event center to drag_min_distance pixels from the original event center.
              // Without this correction, the dragged distance would jumpstart at drag_min_distance pixels instead of at 0.
              // It might be useful to save the original start point somewhere
              var factor = Math.abs(inst.options.drag_min_distance/ev.distance);
              ionic.Gestures.detection.current.startEvent.center.pageX += ev.deltaX * factor;
              ionic.Gestures.detection.current.startEvent.center.pageY += ev.deltaY * factor;

              // recalculate event data using new start point
              ev = ionic.Gestures.detection.extendEventData(ev);
            }
          }

          // lock drag to axis?
          if(ionic.Gestures.detection.current.lastEvent.drag_locked_to_axis || (inst.options.drag_lock_to_axis && inst.options.drag_lock_min_distance<=ev.distance)) {
            ev.drag_locked_to_axis = true;
          }
          var last_direction = ionic.Gestures.detection.current.lastEvent.direction;
          if(ev.drag_locked_to_axis && last_direction !== ev.direction) {
            // keep direction on the axis that the drag gesture started on
            if(ionic.Gestures.utils.isVertical(last_direction)) {
              ev.direction = (ev.deltaY < 0) ? ionic.Gestures.DIRECTION_UP : ionic.Gestures.DIRECTION_DOWN;
            }
            else {
              ev.direction = (ev.deltaX < 0) ? ionic.Gestures.DIRECTION_LEFT : ionic.Gestures.DIRECTION_RIGHT;
            }
          }

          // first time, trigger dragstart event
          if(!this.triggered) {
            inst.trigger(this.name +'start', ev);
            this.triggered = true;
          }

          // trigger normal event
          inst.trigger(this.name, ev);

          // direction event, like dragdown
          inst.trigger(this.name + ev.direction, ev);

          // block the browser events
          if( (inst.options.drag_block_vertical && ionic.Gestures.utils.isVertical(ev.direction)) ||
              (inst.options.drag_block_horizontal && !ionic.Gestures.utils.isVertical(ev.direction))) {
                ev.preventDefault();
              }
          break;

        case ionic.Gestures.EVENT_END:
          // trigger dragend
          if(this.triggered) {
            inst.trigger(this.name +'end', ev);
          }

          this.triggered = false;
          break;
      }
    }
  };


  /**
   * Transform
   * User want to scale or rotate with 2 fingers
   * @events  transform, pinch, pinchin, pinchout, rotate
   */
  ionic.Gestures.gestures.Transform = {
    name: 'transform',
    index: 45,
    defaults: {
      // factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
      transform_min_scale     : 0.01,
      // rotation in degrees
      transform_min_rotation  : 1,
      // prevent default browser behavior when two touches are on the screen
      // but it makes the element a blocking element
      // when you are using the transform gesture, it is a good practice to set this true
      transform_always_block  : false
    },
    triggered: false,
    handler: function transformGesture(ev, inst) {
      // current gesture isnt drag, but dragged is true
      // this means an other gesture is busy. now call dragend
      if(ionic.Gestures.detection.current.name != this.name && this.triggered) {
        inst.trigger(this.name +'end', ev);
        this.triggered = false;
        return;
      }

      // atleast multitouch
      if(ev.touches.length < 2) {
        return;
      }

      // prevent default when two fingers are on the screen
      if(inst.options.transform_always_block) {
        ev.preventDefault();
      }

      switch(ev.eventType) {
        case ionic.Gestures.EVENT_START:
          this.triggered = false;
          break;

        case ionic.Gestures.EVENT_MOVE:
          var scale_threshold = Math.abs(1-ev.scale);
          var rotation_threshold = Math.abs(ev.rotation);

          // when the distance we moved is too small we skip this gesture
          // or we can be already in dragging
          if(scale_threshold < inst.options.transform_min_scale &&
              rotation_threshold < inst.options.transform_min_rotation) {
                return;
              }

          // we are transforming!
          ionic.Gestures.detection.current.name = this.name;

          // first time, trigger dragstart event
          if(!this.triggered) {
            inst.trigger(this.name +'start', ev);
            this.triggered = true;
          }

          inst.trigger(this.name, ev); // basic transform event

          // trigger rotate event
          if(rotation_threshold > inst.options.transform_min_rotation) {
            inst.trigger('rotate', ev);
          }

          // trigger pinch event
          if(scale_threshold > inst.options.transform_min_scale) {
            inst.trigger('pinch', ev);
            inst.trigger('pinch'+ ((ev.scale < 1) ? 'in' : 'out'), ev);
          }
          break;

        case ionic.Gestures.EVENT_END:
          // trigger dragend
          if(this.triggered) {
            inst.trigger(this.name +'end', ev);
          }

          this.triggered = false;
          break;
      }
    }
  };


  /**
   * Touch
   * Called as first, tells the user has touched the screen
   * @events  touch
   */
  ionic.Gestures.gestures.Touch = {
    name: 'touch',
    index: -Infinity,
    defaults: {
      // call preventDefault at touchstart, and makes the element blocking by
      // disabling the scrolling of the page, but it improves gestures like
      // transforming and dragging.
      // be careful with using this, it can be very annoying for users to be stuck
      // on the page
      prevent_default: false,

      // disable mouse events, so only touch (or pen!) input triggers events
      prevent_mouseevents: false
    },
    handler: function touchGesture(ev, inst) {
      if(inst.options.prevent_mouseevents && ev.pointerType == ionic.Gestures.POINTER_MOUSE) {
        ev.stopDetect();
        return;
      }

      if(inst.options.prevent_default) {
        ev.preventDefault();
      }

      if(ev.eventType ==  ionic.Gestures.EVENT_START) {
        inst.trigger(this.name, ev);
      }
    }
  };


  /**
   * Release
   * Called as last, tells the user has released the screen
   * @events  release
   */
  ionic.Gestures.gestures.Release = {
    name: 'release',
    index: Infinity,
    handler: function releaseGesture(ev, inst) {
      if(ev.eventType ==  ionic.Gestures.EVENT_END) {
        inst.trigger(this.name, ev);
      }
    }
  };
})(window.ionic);
;
(function(ionic) {

  ionic.Platform = {
    detect: function() {
      var platforms = [];

      this._checkPlatforms(platforms);

      var classify = function() {
        if(!document.body) { return; }

        for(var i = 0; i < platforms.length; i++) {
          document.body.classList.add('platform-' + platforms[i]);
        }
      };

      document.addEventListener( "DOMContentLoaded", function(){
        classify();
      });

      classify();
    },
    _checkPlatforms: function(platforms) {
      if(this.isCordova()) {
        platforms.push('cordova');
      }
      if(this.isIOS7()) {
        platforms.push('ios7');
      }
      if(this.isIPad()) {
        platforms.push('ipad');
      }
      if(this.isAndroid()) {
        platforms.push('android');
      }
    },

    // Check if we are running in Cordova, which will have
    // window.device available.
    isCordova: function() {
      return (window.cordova || window.PhoneGap || window.phonegap);
      //&& /^file:\/{3}[^\/]/i.test(window.location.href) 
      //&& /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
    },
    isIPad: function() {
      return navigator.userAgent.toLowerCase().indexOf('ipad') >= 0;
    },
    isIOS7: function() {
      if(!window.device) {
        return false;
      }
      return parseFloat(window.device.version) >= 7.0;
    },
    isAndroid: function() {
      if(!window.device) {
        return navigator.userAgent.toLowerCase().indexOf('android') >= 0;
      }
      return device.platform === "Android";
    }
  };

  ionic.Platform.detect();
})(window.ionic);
;
(function(window, document, ionic) {
  'use strict';

  // From the man himself, Mr. Paul Irish.
  // The requestAnimationFrame polyfill
  window.rAF = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // Ionic CSS polyfills
  ionic.CSS = {};
  
  (function() {
    var d = document.createElement('div');
    var keys = ['webkitTransform', 'transform', '-webkit-transform', 'webkit-transform',
                '-moz-transform', 'moz-transform', 'MozTransform', 'mozTransform'];

    for(var i = 0; i < keys.length; i++) {
      if(d.style[keys[i]] !== undefined) {
        ionic.CSS.TRANSFORM = keys[i];
        break;
      }
    }
  })();

  // polyfill use to simulate native "tap"
  function inputTapPolyfill(ele, e) {
    if(ele.type === "radio") {
      ele.checked = !ele.checked;
      ionic.trigger('click', {
        target: ele
      });
    } else if(ele.type === "checkbox") {
      ele.checked = !ele.checked;
      ionic.trigger('change', {
        target: ele
      });
    } else if(ele.type === "submit" || ele.type === "button") {
      ionic.trigger('click', {
        target: ele
      });
    } else {
      ele.focus();
    }
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  function tapPolyfill(e) {
    // if the source event wasn't from a touch event then don't use this polyfill
    if(!e.gesture || e.gesture.pointerType !== "touch" || !e.gesture.srcEvent) return;

    // An internal Ionic indicator for angular directives that contain
    // elements that normally need poly behavior, but are already processed
    // (like the radio directive that has a radio button in it, but handles
    // the tap stuff itself). This is in contrast to preventDefault which will
    // mess up other operations like change events and such
    if(e.alreadyHandled) {
      return;
    }

    e = e.gesture.srcEvent; // evaluate the actual source event, not the created event by gestures.js

    var ele = e.target;

    while(ele) {
      if( ele.tagName === "INPUT" || ele.tagName === "TEXTAREA" || ele.tagName === "SELECT" ) {
        return inputTapPolyfill(ele, e);
      } else if( ele.tagName === "LABEL" ) {
        if(ele.control) {
          return inputTapPolyfill(ele.control, e);
        }
      } else if( ele.tagName === "A" || ele.tagName === "BUTTON" ) {
        ionic.trigger('click', {
          target: ele
        });
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      ele = ele.parentElement;
    }

    // they didn't tap one of the above elements
    // if the currently active element is an input, and they tapped outside
    // of the current input, then unset its focus (blur) so the keyboard goes away
    var activeElement = document.activeElement;
    if(activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.tagName === "SELECT")) {
      activeElement.blur();
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  }

  // global tap event listener polyfill for HTML elements that were "tapped" by the user
  ionic.on("tap", tapPolyfill, window);

})(this, document, ionic);
;
(function(ionic) {
  
  /**
   * Various utilities used throughout Ionic
   *
   * Some of these are adopted from underscore.js and backbone.js, both also MIT licensed.
   */
  ionic.Utils = {

    arrayMove: function (arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length;
        while ((k--) + 1) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr;
    },

    /**
     * Return a function that will be called with the given context
     */
    proxy: function(func, context) {
      var args = Array.prototype.slice.call(arguments, 2);
      return function() {
        return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
      };
    },

    /**
     * Only call a function once in the given interval.
     * 
     * @param func {Function} the function to call
     * @param wait {int} how long to wait before/after to allow function calls
     * @param immediate {boolean} whether to call immediately or after the wait interval
     */
     debounce: function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      return function() {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function() {
          var last = (new Date()) - timestamp;
          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow) result = func.apply(context, args);
        return result;
      };
    },

    /**
     * Throttle the given fun, only allowing it to be
     * called at most every `wait` ms.
     */
    throttle: function(func, wait, options) {
      var context, args, result;
      var timeout = null;
      var previous = 0;
      options || (options = {});
      var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
      };
      return function() {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },
     // Borrowed from Backbone.js's extend
     // Helper function to correctly set up the prototype chain, for subclasses.
     // Similar to `goog.inherits`, but uses a hash of prototype properties and
     // class properties to be extended.
    inherit: function(protoProps, staticProps) {
      var parent = this;
      var child;

      // The constructor function for the new subclass is either defined by you
      // (the "constructor" property in your `extend` definition), or defaulted
      // by us to simply call the parent's constructor.
      if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
      } else {
        child = function(){ return parent.apply(this, arguments); };
      }

      // Add static properties to the constructor function, if supplied.
      ionic.extend(child, parent, staticProps);

      // Set the prototype chain to inherit from `parent`, without calling
      // `parent`'s constructor function.
      var Surrogate = function(){ this.constructor = child; };
      Surrogate.prototype = parent.prototype;
      child.prototype = new Surrogate;

      // Add prototype properties (instance properties) to the subclass,
      // if supplied.
      if (protoProps) ionic.extend(child.prototype, protoProps);

      // Set a convenience property in case the parent's prototype is needed
      // later.
      child.__super__ = parent.prototype;

      return child;
    },

    // Extend adapted from Underscore.js
    extend: function(obj) {
       var args = Array.prototype.slice.call(arguments, 1);
       for(var i = 0; i < args.length; i++) {
         var source = args[i];
         if (source) {
           for (var prop in source) {
             obj[prop] = source[prop];
           }
         }
       }
       return obj;
    }
  };

  // Bind a few of the most useful functions to the ionic scope
  ionic.inherit = ionic.Utils.inherit;
  ionic.extend = ionic.Utils.extend;
  ionic.throttle = ionic.Utils.throttle;
  ionic.proxy = ionic.Utils.proxy;
  ionic.debounce = ionic.Utils.debounce;

})(window.ionic);
;
(function(ionic) {
'use strict';
  ionic.views.View = function() {
    this.initialize.apply(this, arguments);
  };

  ionic.views.View.inherit = ionic.inherit;

  ionic.extend(ionic.views.View.prototype, {
    initialize: function() {}
  });

})(window.ionic);
;
/*
 * Scroller
 * http://github.com/zynga/scroller
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/scroller/master/MIT-LICENSE.txt
 *
 * Based on the work of: Unify Project (unify-project.org)
 * http://unify-project.org
 * Copyright 2011, Deutsche Telekom AG
 * License: MIT + Apache (V2)
 */

/**
 * Generic animation class with support for dropped frames both optional easing and duration.
 *
 * Optional duration is useful when the lifetime is defined by another condition than time
 * e.g. speed of an animating object, etc.
 *
 * Dropped frame logic allows to keep using the same updater logic independent from the actual
 * rendering. This eases a lot of cases where it might be pretty complex to break down a state
 * based on the pure time difference.
 */
(function(global) {
	var time = Date.now || function() {
		return +new Date();
	};
	var desiredFrames = 60;
	var millisecondsPerSecond = 1000;
	var running = {};
	var counter = 1;

	// Create namespaces
	if (!global.core) {
		global.core = { effect : {} };

	} else if (!core.effect) {
		core.effect = {};
	}

	core.effect.Animate = {

		/**
		 * A requestAnimationFrame wrapper / polyfill.
		 *
		 * @param callback {Function} The callback to be invoked before the next repaint.
		 * @param root {HTMLElement} The root element for the repaint
		 */
		requestAnimationFrame: (function() {

			// Check for request animation Frame support
			var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
			var isNative = !!requestFrame;

			if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
				isNative = false;
			}

			if (isNative) {
				return function(callback, root) {
					requestFrame(callback, root)
				};
			}

			var TARGET_FPS = 60;
			var requests = {};
			var requestCount = 0;
			var rafHandle = 1;
			var intervalHandle = null;
			var lastActive = +new Date();

			return function(callback, root) {
				var callbackHandle = rafHandle++;

				// Store callback
				requests[callbackHandle] = callback;
				requestCount++;

				// Create timeout at first request
				if (intervalHandle === null) {

					intervalHandle = setInterval(function() {

						var time = +new Date();
						var currentRequests = requests;

						// Reset data structure before executing callbacks
						requests = {};
						requestCount = 0;

						for(var key in currentRequests) {
							if (currentRequests.hasOwnProperty(key)) {
								currentRequests[key](time);
								lastActive = time;
							}
						}

						// Disable the timeout when nothing happens for a certain
						// period of time
						if (time - lastActive > 2500) {
							clearInterval(intervalHandle);
							intervalHandle = null;
						}

					}, 1000 / TARGET_FPS);
				}

				return callbackHandle;
			};

		})(),


		/**
		 * Stops the given animation.
		 *
		 * @param id {Integer} Unique animation ID
		 * @return {Boolean} Whether the animation was stopped (aka, was running before)
		 */
		stop: function(id) {
			var cleared = running[id] != null;
			if (cleared) {
				running[id] = null;
			}

			return cleared;
		},


		/**
		 * Whether the given animation is still running.
		 *
		 * @param id {Integer} Unique animation ID
		 * @return {Boolean} Whether the animation is still running
		 */
		isRunning: function(id) {
			return running[id] != null;
		},


		/**
		 * Start the animation.
		 *
		 * @param stepCallback {Function} Pointer to function which is executed on every step.
		 *   Signature of the method should be `function(percent, now, virtual) { return continueWithAnimation; }`
		 * @param verifyCallback {Function} Executed before every animation step.
		 *   Signature of the method should be `function() { return continueWithAnimation; }`
		 * @param completedCallback {Function}
		 *   Signature of the method should be `function(droppedFrames, finishedAnimation) {}`
		 * @param duration {Integer} Milliseconds to run the animation
		 * @param easingMethod {Function} Pointer to easing function
		 *   Signature of the method should be `function(percent) { return modifiedValue; }`
		 * @param root {Element ? document.body} Render root, when available. Used for internal
		 *   usage of requestAnimationFrame.
		 * @return {Integer} Identifier of animation. Can be used to stop it any time.
		 */
		start: function(stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {

			var start = time();
			var lastFrame = start;
			var percent = 0;
			var dropCounter = 0;
			var id = counter++;

			if (!root) {
				root = document.body;
			}

			// Compacting running db automatically every few new animations
			if (id % 20 === 0) {
				var newRunning = {};
				for (var usedId in running) {
					newRunning[usedId] = true;
				}
				running = newRunning;
			}

			// This is the internal step method which is called every few milliseconds
			var step = function(virtual) {

				// Normalize virtual value
				var render = virtual !== true;

				// Get current time
				var now = time();

				// Verification is executed before next animation step
				if (!running[id] || (verifyCallback && !verifyCallback(id))) {

					running[id] = null;
					completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, false);
					return;

				}

				// For the current rendering to apply let's update omitted steps in memory.
				// This is important to bring internal state variables up-to-date with progress in time.
				if (render) {

					var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
					for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
						step(true);
						dropCounter++;
					}

				}

				// Compute percent value
				if (duration) {
					percent = (now - start) / duration;
					if (percent > 1) {
						percent = 1;
					}
				}

				// Execute step callback, then...
				var value = easingMethod ? easingMethod(percent) : percent;
				if ((stepCallback(value, now, render) === false || percent === 1) && render) {
					running[id] = null;
					completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, percent === 1 || duration == null);
				} else if (render) {
					lastFrame = now;
					core.effect.Animate.requestAnimationFrame(step, root);
				}
			};

			// Mark as running
			running[id] = true;

			// Init first step
			core.effect.Animate.requestAnimationFrame(step, root);

			// Return unique animation ID
			return id;
		}
	};
})(this);

/*
 * Scroller
 * http://github.com/zynga/scroller
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/scroller/master/MIT-LICENSE.txt
 *
 * Based on the work of: Unify Project (unify-project.org)
 * http://unify-project.org
 * Copyright 2011, Deutsche Telekom AG
 * License: MIT + Apache (V2)
 */

var Scroller;

(function(ionic) {
	var NOOP = function(){};

	// Easing Equations (c) 2003 Robert Penner, all rights reserved.
	// Open source under the BSD License.

	/**
	 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
	**/
	var easeOutCubic = function(pos) {
		return (Math.pow((pos - 1), 3) + 1);
	};

	/**
	 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
	**/
	var easeInOutCubic = function(pos) {
		if ((pos /= 0.5) < 1) {
			return 0.5 * Math.pow(pos, 3);
		}

		return 0.5 * (Math.pow((pos - 2), 3) + 2);
	};


	/**
	 * A pure logic 'component' for 'virtual' scrolling/zooming.
	 */
ionic.views.Scroll = ionic.views.View.inherit({
  initialize: function(options) {
    var self = this;

    this.__container = options.el;
    this.__content = options.el.firstElementChild;


		this.options = {

			/** Disable scrolling on x-axis by default */
			scrollingX: false,

			/** Enable scrolling on y-axis */
			scrollingY: true,

			/** Enable animations for deceleration, snap back, zooming and scrolling */
			animating: true,

			/** duration for animations triggered by scrollTo/zoomTo */
			animationDuration: 250,

			/** Enable bouncing (content can be slowly moved outside and jumps back after releasing) */
			bouncing: true,

			/** Enable locking to the main axis if user moves only slightly on one of them at start */
			locking: true,

			/** Enable pagination mode (switching between full page content panes) */
			paging: false,

			/** Enable snapping of content to a configured pixel grid */
			snapping: false,

			/** Enable zooming of content via API, fingers and mouse wheel */
			zooming: false,

			/** Minimum zoom level */
			minZoom: 0.5,

			/** Maximum zoom level */
			maxZoom: 3,

			/** Multiply or decrease scrolling speed **/
			speedMultiplier: 1,

			/** Callback that is fired on the later of touch end or deceleration end,
				provided that another scrolling action has not begun. Used to know
				when to fade out a scrollbar. */
			scrollingComplete: NOOP,
			
			/** This configures the amount of change applied to deceleration when reaching boundaries  **/
      penetrationDeceleration : 0.03,

      /** This configures the amount of change applied to acceleration when reaching boundaries  **/
      penetrationAcceleration : 0.08,

      // The ms interval for triggering scroll events
      scrollEventInterval: 50
		};

		for (var key in options) {
			this.options[key] = options[key];
		}

    this.hintResize = ionic.debounce(function() {
      self.resize();
    }, 1000, true);

    this.triggerScrollEvent = ionic.throttle(function() {
      ionic.trigger('scroll', {
        scrollTop: self.__scrollTop,
        scrollLeft: self.__scrollLeft,
        target: self.__container
      });
    }, this.options.scrollEventInterval);

    this.triggerScrollEndEvent = function() {
      ionic.trigger('scrollend', {
        scrollTop: self.__scrollTop,
        scrollLeft: self.__scrollLeft,
        target: self.__container
      });
    };

    // Get the render update function, initialize event handlers,
    // and calculate the size of the scroll container
		this.__callback = this.getRenderFn();
    this.__initEventHandlers();
    this.resize();
	},



  /*
  ---------------------------------------------------------------------------
    INTERNAL FIELDS :: STATUS
  ---------------------------------------------------------------------------
  */

  /** {Boolean} Whether only a single finger is used in touch handling */
  __isSingleTouch: false,

  /** {Boolean} Whether a touch event sequence is in progress */
  __isTracking: false,

  /** {Boolean} Whether a deceleration animation went to completion. */
  __didDecelerationComplete: false,

  /**
   * {Boolean} Whether a gesture zoom/rotate event is in progress. Activates when
   * a gesturestart event happens. This has higher priority than dragging.
   */
  __isGesturing: false,

  /**
   * {Boolean} Whether the user has moved by such a distance that we have enabled
   * dragging mode. Hint: It's only enabled after some pixels of movement to
   * not interrupt with clicks etc.
   */
  __isDragging: false,

  /**
   * {Boolean} Not touching and dragging anymore, and smoothly animating the
   * touch sequence using deceleration.
   */
  __isDecelerating: false,

  /**
   * {Boolean} Smoothly animating the currently configured change
   */
  __isAnimating: false,



  /*
  ---------------------------------------------------------------------------
    INTERNAL FIELDS :: DIMENSIONS
  ---------------------------------------------------------------------------
  */

  /** {Integer} Available outer left position (from document perspective) */
  __clientLeft: 0,

  /** {Integer} Available outer top position (from document perspective) */
  __clientTop: 0,

  /** {Integer} Available outer width */
  __clientWidth: 0,

  /** {Integer} Available outer height */
  __clientHeight: 0,

  /** {Integer} Outer width of content */
  __contentWidth: 0,

  /** {Integer} Outer height of content */
  __contentHeight: 0,

  /** {Integer} Snapping width for content */
  __snapWidth: 100,

  /** {Integer} Snapping height for content */
  __snapHeight: 100,

  /** {Integer} Height to assign to refresh area */
  __refreshHeight: null,

  /** {Boolean} Whether the refresh process is enabled when the event is released now */
  __refreshActive: false,

  /** {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release */
  __refreshActivate: null,

  /** {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled */
  __refreshDeactivate: null,

  /** {Function} Callback to execute to start the actual refresh. Call {@link #refreshFinish} when done */
  __refreshStart: null,

  /** {Number} Zoom level */
  __zoomLevel: 1,

  /** {Number} Scroll position on x-axis */
  __scrollLeft: 0,

  /** {Number} Scroll position on y-axis */
  __scrollTop: 0,

  /** {Integer} Maximum allowed scroll position on x-axis */
  __maxScrollLeft: 0,

  /** {Integer} Maximum allowed scroll position on y-axis */
  __maxScrollTop: 0,

  /* {Number} Scheduled left position (final position when animating) */
  __scheduledLeft: 0,

  /* {Number} Scheduled top position (final position when animating) */
  __scheduledTop: 0,

  /* {Number} Scheduled zoom level (final scale when animating) */
  __scheduledZoom: 0,



  /*
  ---------------------------------------------------------------------------
    INTERNAL FIELDS :: LAST POSITIONS
  ---------------------------------------------------------------------------
  */

  /** {Number} Left position of finger at start */
  __lastTouchLeft: null,

  /** {Number} Top position of finger at start */
  __lastTouchTop: null,

  /** {Date} Timestamp of last move of finger. Used to limit tracking range for deceleration speed. */
  __lastTouchMove: null,

  /** {Array} List of positions, uses three indexes for each state: left, top, timestamp */
  __positions: null,



  /*
  ---------------------------------------------------------------------------
    INTERNAL FIELDS :: DECELERATION SUPPORT
  ---------------------------------------------------------------------------
  */

  /** {Integer} Minimum left scroll position during deceleration */
  __minDecelerationScrollLeft: null,

  /** {Integer} Minimum top scroll position during deceleration */
  __minDecelerationScrollTop: null,

  /** {Integer} Maximum left scroll position during deceleration */
  __maxDecelerationScrollLeft: null,

  /** {Integer} Maximum top scroll position during deceleration */
  __maxDecelerationScrollTop: null,

  /** {Number} Current factor to modify horizontal scroll position with on every step */
  __decelerationVelocityX: null,

  /** {Number} Current factor to modify vertical scroll position with on every step */
  __decelerationVelocityY: null,


  __initEventHandlers: function() {
    var self = this;

    // Event Handler
    var container = this.__container;
    
    if ('ontouchstart' in window) {
      
      container.addEventListener("touchstart", function(e) {
        // Don't react if initial down happens on a form element
        if (e.target.tagName.match(/input|textarea|select/i)) {
          return;
        }
        
        self.doTouchStart(e.touches, e.timeStamp);
        e.preventDefault();
      }, false);

      document.addEventListener("touchmove", function(e) {
        if(e.defaultPrevented) {
          return;
        }
        self.doTouchMove(e.touches, e.timeStamp);
      }, false);

      document.addEventListener("touchend", function(e) {
        self.doTouchEnd(e.timeStamp);
      }, false);
      
    } else {
      
      var mousedown = false;

      container.addEventListener("mousedown", function(e) {
        // Don't react if initial down happens on a form element
        if (e.target.tagName.match(/input|textarea|select/i)) {
          return;
        }
        
        self.doTouchStart([{
          pageX: e.pageX,
          pageY: e.pageY
        }], e.timeStamp);

        mousedown = true;
      }, false);

      document.addEventListener("mousemove", function(e) {
        if (!mousedown || e.defaultPrevented) {
          return;
        }

        self.doTouchMove([{
          pageX: e.pageX,
          pageY: e.pageY
        }], e.timeStamp);

        mousedown = true;
      }, false);

      document.addEventListener("mouseup", function(e) {
        if (!mousedown) {
          return;
        }

        self.doTouchEnd(e.timeStamp);

        mousedown = false;
      }, false);
      
    }
  },


  resize: function() {
    // Update Scroller dimensions for changed content
    // Add padding to bottom of content
    this.setDimensions(
    	this.__container.clientWidth,
    	this.__container.clientHeight,
    	this.__content.offsetWidth, 
    	this.__content.offsetHeight+20);
  },
  /*
  ---------------------------------------------------------------------------
    PUBLIC API
  ---------------------------------------------------------------------------
  */

  getRenderFn: function() {
    var self = this;

    var content = this.__content;

	  var docStyle = document.documentElement.style;

    var engine;
    if ('MozAppearance' in docStyle) {
      engine = 'gecko';
    } else if ('WebkitAppearance' in docStyle) {
      engine = 'webkit';
    } else if (typeof navigator.cpuClass === 'string') {
      engine = 'trident';
    }
    
    var vendorPrefix = {
      trident: 'ms',
      gecko: 'Moz',
      webkit: 'Webkit',
      presto: 'O'
    }[engine];
    
    var helperElem = document.createElement("div");
    var undef;

    var perspectiveProperty = vendorPrefix + "Perspective";
    var transformProperty = vendorPrefix + "Transform";
    
    if (helperElem.style[perspectiveProperty] !== undef) {
      
      return function(left, top, zoom) {
        content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0)';
         self.triggerScrollEvent();
      };	
      
    } else if (helperElem.style[transformProperty] !== undef) {
      
      return function(left, top, zoom) {
        content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px)';
         self.triggerScrollEvent();
      };
      
    } else {
      
      return function(left, top, zoom) {
        content.style.marginLeft = left ? (-left/zoom) + 'px' : '';
        content.style.marginTop = top ? (-top/zoom) + 'px' : '';
        content.style.zoom = zoom || '';
        self.triggerScrollEvent();
      };
      
    }
  },


  /**
   * Configures the dimensions of the client (outer) and content (inner) elements.
   * Requires the available space for the outer element and the outer size of the inner element.
   * All values which are falsy (null or zero etc.) are ignored and the old value is kept.
   *
   * @param clientWidth {Integer ? null} Inner width of outer element
   * @param clientHeight {Integer ? null} Inner height of outer element
   * @param contentWidth {Integer ? null} Outer width of inner element
   * @param contentHeight {Integer ? null} Outer height of inner element
   */
  setDimensions: function(clientWidth, clientHeight, contentWidth, contentHeight) {

    var self = this;

    // Only update values which are defined
    if (clientWidth === +clientWidth) {
      self.__clientWidth = clientWidth;
    }

    if (clientHeight === +clientHeight) {
      self.__clientHeight = clientHeight;
    }

    if (contentWidth === +contentWidth) {
      self.__contentWidth = contentWidth;
    }

    if (contentHeight === +contentHeight) {
      self.__contentHeight = contentHeight;
    }

    // Refresh maximums
    self.__computeScrollMax();

    // Refresh scroll position
    self.scrollTo(self.__scrollLeft, self.__scrollTop, true);

  },


  /**
   * Sets the client coordinates in relation to the document.
   *
   * @param left {Integer ? 0} Left position of outer element
   * @param top {Integer ? 0} Top position of outer element
   */
  setPosition: function(left, top) {

    var self = this;

    self.__clientLeft = left || 0;
    self.__clientTop = top || 0;

  },


  /**
   * Configures the snapping (when snapping is active)
   *
   * @param width {Integer} Snapping width
   * @param height {Integer} Snapping height
   */
  setSnapSize: function(width, height) {

    var self = this;

    self.__snapWidth = width;
    self.__snapHeight = height;

  },


  /**
   * Activates pull-to-refresh. A special zone on the top of the list to start a list refresh whenever
   * the user event is released during visibility of this zone. This was introduced by some apps on iOS like
   * the official Twitter client.
   *
   * @param height {Integer} Height of pull-to-refresh zone on top of rendered list
   * @param activateCallback {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release.
   * @param deactivateCallback {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled.
   * @param startCallback {Function} Callback to execute to start the real async refresh action. Call {@link #finishPullToRefresh} after finish of refresh.
   */
  activatePullToRefresh: function(height, activateCallback, deactivateCallback, startCallback) {

    var self = this;

    self.__refreshHeight = height;
    self.__refreshActivate = activateCallback;
    self.__refreshDeactivate = deactivateCallback;
    self.__refreshStart = startCallback;

  },


  /**
   * Starts pull-to-refresh manually.
   */
  triggerPullToRefresh: function() {
    // Use publish instead of scrollTo to allow scrolling to out of boundary position
    // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
    this.__publish(this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);

    if (this.__refreshStart) {
      this.__refreshStart();
    }
  },


  /**
   * Signalizes that pull-to-refresh is finished.
   */
  finishPullToRefresh: function() {

    var self = this;

    self.__refreshActive = false;
    if (self.__refreshDeactivate) {
      self.__refreshDeactivate();
    }

    self.scrollTo(self.__scrollLeft, self.__scrollTop, true);

  },


  /**
   * Returns the scroll position and zooming values
   *
   * @return {Map} `left` and `top` scroll position and `zoom` level
   */
  getValues: function() {

    var self = this;

    return {
      left: self.__scrollLeft,
      top: self.__scrollTop,
      zoom: self.__zoomLevel
    };

  },


  /**
   * Returns the maximum scroll values
   *
   * @return {Map} `left` and `top` maximum scroll values
   */
  getScrollMax: function() {

    var self = this;

    return {
      left: self.__maxScrollLeft,
      top: self.__maxScrollTop
    };

  },


  /**
   * Zooms to the given level. Supports optional animation. Zooms
   * the center when no coordinates are given.
   *
   * @param level {Number} Level to zoom to
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? null} Zoom in at given left coordinate
   * @param originTop {Number ? null} Zoom in at given top coordinate
   */
  zoomTo: function(level, animate, originLeft, originTop) {

    var self = this;

    if (!self.options.zooming) {
      throw new Error("Zooming is not enabled!");
    }

    // Stop deceleration
    if (self.__isDecelerating) {
      core.effect.Animate.stop(self.__isDecelerating);
      self.__isDecelerating = false;
    }

    var oldLevel = self.__zoomLevel;

    // Normalize input origin to center of viewport if not defined
    if (originLeft == null) {
      originLeft = self.__clientWidth / 2;
    }

    if (originTop == null) {
      originTop = self.__clientHeight / 2;
    }

    // Limit level according to configuration
    level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);

    // Recompute maximum values while temporary tweaking maximum scroll ranges
    self.__computeScrollMax(level);

    // Recompute left and top coordinates based on new zoom level
    var left = ((originLeft + self.__scrollLeft) * level / oldLevel) - originLeft;
    var top = ((originTop + self.__scrollTop) * level / oldLevel) - originTop;

    // Limit x-axis
    if (left > self.__maxScrollLeft) {
      left = self.__maxScrollLeft;
    } else if (left < 0) {
      left = 0;
    }

    // Limit y-axis
    if (top > self.__maxScrollTop) {
      top = self.__maxScrollTop;
    } else if (top < 0) {
      top = 0;
    }

    // Push values out
    self.__publish(left, top, level, animate);

  },


  /**
   * Zooms the content by the given factor.
   *
   * @param factor {Number} Zoom by given factor
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? 0} Zoom in at given left coordinate
   * @param originTop {Number ? 0} Zoom in at given top coordinate
   */
  zoomBy: function(factor, animate, originLeft, originTop) {

    var self = this;

    self.zoomTo(self.__zoomLevel * factor, animate, originLeft, originTop);

  },


  /**
   * Scrolls to the given position. Respect limitations and snapping automatically.
   *
   * @param left {Number?null} Horizontal scroll position, keeps current if value is <code>null</code>
   * @param top {Number?null} Vertical scroll position, keeps current if value is <code>null</code>
   * @param animate {Boolean?false} Whether the scrolling should happen using an animation
   * @param zoom {Number?null} Zoom level to go to
   */
  scrollTo: function(left, top, animate, zoom) {

    var self = this;

    // Stop deceleration
    if (self.__isDecelerating) {
      core.effect.Animate.stop(self.__isDecelerating);
      self.__isDecelerating = false;
    }

    // Correct coordinates based on new zoom level
    if (zoom != null && zoom !== self.__zoomLevel) {

      if (!self.options.zooming) {
        throw new Error("Zooming is not enabled!");
      }

      left *= zoom;
      top *= zoom;

      // Recompute maximum values while temporary tweaking maximum scroll ranges
      self.__computeScrollMax(zoom);

    } else {

      // Keep zoom when not defined
      zoom = self.__zoomLevel;

    }

    if (!self.options.scrollingX) {

      left = self.__scrollLeft;

    } else {

      if (self.options.paging) {
        left = Math.round(left / self.__clientWidth) * self.__clientWidth;
      } else if (self.options.snapping) {
        left = Math.round(left / self.__snapWidth) * self.__snapWidth;
      }

    }

    if (!self.options.scrollingY) {

      top = self.__scrollTop;

    } else {

      if (self.options.paging) {
        top = Math.round(top / self.__clientHeight) * self.__clientHeight;
      } else if (self.options.snapping) {
        top = Math.round(top / self.__snapHeight) * self.__snapHeight;
      }

    }

    // Limit for allowed ranges
    left = Math.max(Math.min(self.__maxScrollLeft, left), 0);
    top = Math.max(Math.min(self.__maxScrollTop, top), 0);

    // Don't animate when no change detected, still call publish to make sure
    // that rendered position is really in-sync with internal data
    if (left === self.__scrollLeft && top === self.__scrollTop) {
      animate = false;
    }

    // Publish new values
    self.__publish(left, top, zoom, animate);

  },


  /**
   * Scroll by the given offset
   *
   * @param left {Number ? 0} Scroll x-axis by given offset
   * @param top {Number ? 0} Scroll x-axis by given offset
   * @param animate {Boolean ? false} Whether to animate the given change
   */
  scrollBy: function(left, top, animate) {

    var self = this;

    var startLeft = self.__isAnimating ? self.__scheduledLeft : self.__scrollLeft;
    var startTop = self.__isAnimating ? self.__scheduledTop : self.__scrollTop;

    self.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);

  },



  /*
  ---------------------------------------------------------------------------
    EVENT CALLBACKS
  ---------------------------------------------------------------------------
  */

  /**
   * Mouse wheel handler for zooming support
   */
  doMouseZoom: function(wheelDelta, timeStamp, pageX, pageY) {

    var self = this;
    var change = wheelDelta > 0 ? 0.97 : 1.03;

    return self.zoomTo(self.__zoomLevel * change, false, pageX - self.__clientLeft, pageY - self.__clientTop);

  },


  /**
   * Touch start handler for scrolling support
   */
  doTouchStart: function(touches, timeStamp) {
    this.hintResize();

    // Array-like check is enough here
    if (touches.length == null) {
      throw new Error("Invalid touch list: " + touches);
    }

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }

    var self = this;

    // Reset interruptedAnimation flag
    self.__interruptedAnimation = true;

    // Stop deceleration
    if (self.__isDecelerating) {
      core.effect.Animate.stop(self.__isDecelerating);
      self.__isDecelerating = false;
      self.__interruptedAnimation = true;
    }

    // Stop animation
    if (self.__isAnimating) {
      core.effect.Animate.stop(self.__isAnimating);
      self.__isAnimating = false;
      self.__interruptedAnimation = true;
    }

    // Use center point when dealing with two fingers
    var currentTouchLeft, currentTouchTop;
    var isSingleTouch = touches.length === 1;
    if (isSingleTouch) {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    } else {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    }

    // Store initial positions
    self.__initialTouchLeft = currentTouchLeft;
    self.__initialTouchTop = currentTouchTop;

    // Store current zoom level
    self.__zoomLevelStart = self.__zoomLevel;

    // Store initial touch positions
    self.__lastTouchLeft = currentTouchLeft;
    self.__lastTouchTop = currentTouchTop;

    // Store initial move time stamp
    self.__lastTouchMove = timeStamp;

    // Reset initial scale
    self.__lastScale = 1;

    // Reset locking flags
    self.__enableScrollX = !isSingleTouch && self.options.scrollingX;
    self.__enableScrollY = !isSingleTouch && self.options.scrollingY;

    // Reset tracking flag
    self.__isTracking = true;

    // Reset deceleration complete flag
    self.__didDecelerationComplete = false;

    // Dragging starts directly with two fingers, otherwise lazy with an offset
    self.__isDragging = !isSingleTouch;

    // Some features are disabled in multi touch scenarios
    self.__isSingleTouch = isSingleTouch;

    // Clearing data structure
    self.__positions = [];

  },


  /**
   * Touch move handler for scrolling support
   */
  doTouchMove: function(touches, timeStamp, scale) {

    // Array-like check is enough here
    if (touches.length == null) {
      throw new Error("Invalid touch list: " + touches);
    }

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }

    var self = this;

    // Ignore event when tracking is not enabled (event might be outside of element)
    if (!self.__isTracking) {
      return;
    }


    var currentTouchLeft, currentTouchTop;

    // Compute move based around of center of fingers
    if (touches.length === 2) {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    } else {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    }

    var positions = self.__positions;

    // Are we already is dragging mode?
    if (self.__isDragging) {

      // Compute move distance
      var moveX = currentTouchLeft - self.__lastTouchLeft;
      var moveY = currentTouchTop - self.__lastTouchTop;

      // Read previous scroll position and zooming
      var scrollLeft = self.__scrollLeft;
      var scrollTop = self.__scrollTop;
      var level = self.__zoomLevel;

      // Work with scaling
      if (scale != null && self.options.zooming) {

        var oldLevel = level;

        // Recompute level based on previous scale and new scale
        level = level / self.__lastScale * scale;

        // Limit level according to configuration
        level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);

        // Only do further compution when change happened
        if (oldLevel !== level) {

          // Compute relative event position to container
          var currentTouchLeftRel = currentTouchLeft - self.__clientLeft;
          var currentTouchTopRel = currentTouchTop - self.__clientTop;

          // Recompute left and top coordinates based on new zoom level
          scrollLeft = ((currentTouchLeftRel + scrollLeft) * level / oldLevel) - currentTouchLeftRel;
          scrollTop = ((currentTouchTopRel + scrollTop) * level / oldLevel) - currentTouchTopRel;

          // Recompute max scroll values
          self.__computeScrollMax(level);

        }
      }

      if (self.__enableScrollX) {

        scrollLeft -= moveX * this.options.speedMultiplier;
        var maxScrollLeft = self.__maxScrollLeft;

        if (scrollLeft > maxScrollLeft || scrollLeft < 0) {

          // Slow down on the edges
          if (self.options.bouncing) {

            scrollLeft += (moveX / 2  * this.options.speedMultiplier);

          } else if (scrollLeft > maxScrollLeft) {

            scrollLeft = maxScrollLeft;

          } else {

            scrollLeft = 0;

          }
        }
      }

      // Compute new vertical scroll position
      if (self.__enableScrollY) {

        scrollTop -= moveY * this.options.speedMultiplier;
        var maxScrollTop = self.__maxScrollTop;

        if (scrollTop > maxScrollTop || scrollTop < 0) {

          // Slow down on the edges
          if (self.options.bouncing) {

            scrollTop += (moveY / 2 * this.options.speedMultiplier);

            // Support pull-to-refresh (only when only y is scrollable)
            if (!self.__enableScrollX && self.__refreshHeight != null) {

              if (!self.__refreshActive && scrollTop <= -self.__refreshHeight) {

                self.__refreshActive = true;
                if (self.__refreshActivate) {
                  self.__refreshActivate();
                }

              } else if (self.__refreshActive && scrollTop > -self.__refreshHeight) {

                self.__refreshActive = false;
                if (self.__refreshDeactivate) {
                  self.__refreshDeactivate();
                }

              }
            }

          } else if (scrollTop > maxScrollTop) {

            scrollTop = maxScrollTop;

          } else {

            scrollTop = 0;

          }
        }
      }

      // Keep list from growing infinitely (holding min 10, max 20 measure points)
      if (positions.length > 60) {
        positions.splice(0, 30);
      }

      // Track scroll movement for decleration
      positions.push(scrollLeft, scrollTop, timeStamp);

      // Sync scroll position
      self.__publish(scrollLeft, scrollTop, level);

    // Otherwise figure out whether we are switching into dragging mode now.
    } else {

      var minimumTrackingForScroll = self.options.locking ? 3 : 0;
      var minimumTrackingForDrag = 5;

      var distanceX = Math.abs(currentTouchLeft - self.__initialTouchLeft);
      var distanceY = Math.abs(currentTouchTop - self.__initialTouchTop);

      self.__enableScrollX = self.options.scrollingX && distanceX >= minimumTrackingForScroll;
      self.__enableScrollY = self.options.scrollingY && distanceY >= minimumTrackingForScroll;

      positions.push(self.__scrollLeft, self.__scrollTop, timeStamp);

      self.__isDragging = (self.__enableScrollX || self.__enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
      if (self.__isDragging) {
        self.__interruptedAnimation = false;
      }

    }

    // Update last touch positions and time stamp for next event
    self.__lastTouchLeft = currentTouchLeft;
    self.__lastTouchTop = currentTouchTop;
    self.__lastTouchMove = timeStamp;
    self.__lastScale = scale;

  },


  /**
   * Touch end handler for scrolling support
   */
  doTouchEnd: function(timeStamp) {

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }

    var self = this;

    // Ignore event when tracking is not enabled (no touchstart event on element)
    // This is required as this listener ('touchmove') sits on the document and not on the element itself.
    if (!self.__isTracking) {
      return;
    }

    // Not touching anymore (when two finger hit the screen there are two touch end events)
    self.__isTracking = false;

    // Be sure to reset the dragging flag now. Here we also detect whether
    // the finger has moved fast enough to switch into a deceleration animation.
    if (self.__isDragging) {

      // Reset dragging flag
      self.__isDragging = false;

      // Start deceleration
      // Verify that the last move detected was in some relevant time frame
      if (self.__isSingleTouch && self.options.animating && (timeStamp - self.__lastTouchMove) <= 100) {

        // Then figure out what the scroll position was about 100ms ago
        var positions = self.__positions;
        var endPos = positions.length - 1;
        var startPos = endPos;

        // Move pointer to position measured 100ms ago
        for (var i = endPos; i > 0 && positions[i] > (self.__lastTouchMove - 100); i -= 3) {
          startPos = i;
        }

        // If start and stop position is identical in a 100ms timeframe,
        // we cannot compute any useful deceleration.
        if (startPos !== endPos) {

          // Compute relative movement between these two points
          var timeOffset = positions[endPos] - positions[startPos];
          var movedLeft = self.__scrollLeft - positions[startPos - 2];
          var movedTop = self.__scrollTop - positions[startPos - 1];

          // Based on 50ms compute the movement to apply for each render step
          self.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
          self.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);

          // How much velocity is required to start the deceleration
          var minVelocityToStartDeceleration = self.options.paging || self.options.snapping ? 4 : 1;

          // Verify that we have enough velocity to start deceleration
          if (Math.abs(self.__decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs(self.__decelerationVelocityY) > minVelocityToStartDeceleration) {

            // Deactivate pull-to-refresh when decelerating
            if (!self.__refreshActive) {
              self.__startDeceleration(timeStamp);
            }
          }
        } else {
          self.options.scrollingComplete();
        }
      } else if ((timeStamp - self.__lastTouchMove) > 100) {
        self.options.scrollingComplete();
      }
    }

    // If this was a slower move it is per default non decelerated, but this
    // still means that we want snap back to the bounds which is done here.
    // This is placed outside the condition above to improve edge case stability
    // e.g. touchend fired without enabled dragging. This should normally do not
    // have modified the scroll positions or even showed the scrollbars though.
    if (!self.__isDecelerating) {

      if (self.__refreshActive && self.__refreshStart) {

        // Use publish instead of scrollTo to allow scrolling to out of boundary position
        // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
        self.__publish(self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);

        if (self.__refreshStart) {
          self.__refreshStart();
        }

      } else {

        if (self.__interruptedAnimation || self.__isDragging) {
          self.options.scrollingComplete();
        }
        self.scrollTo(self.__scrollLeft, self.__scrollTop, true, self.__zoomLevel);

        // Directly signalize deactivation (nothing todo on refresh?)
        if (self.__refreshActive) {

          self.__refreshActive = false;
          if (self.__refreshDeactivate) {
            self.__refreshDeactivate();
          }

        }
      }
    }

    // Fully cleanup list
    self.__positions.length = 0;

  },



  /*
  ---------------------------------------------------------------------------
    PRIVATE API
  ---------------------------------------------------------------------------
  */

  /**
   * Applies the scroll position to the content element
   *
   * @param left {Number} Left scroll position
   * @param top {Number} Top scroll position
   * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
   */
  __publish: function(left, top, zoom, animate) {

    var self = this;

    // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation
    var wasAnimating = self.__isAnimating;
    if (wasAnimating) {
      core.effect.Animate.stop(wasAnimating);
      self.__isAnimating = false;
    }

    if (animate && self.options.animating) {

      // Keep scheduled positions for scrollBy/zoomBy functionality
      self.__scheduledLeft = left;
      self.__scheduledTop = top;
      self.__scheduledZoom = zoom;

      var oldLeft = self.__scrollLeft;
      var oldTop = self.__scrollTop;
      var oldZoom = self.__zoomLevel;

      var diffLeft = left - oldLeft;
      var diffTop = top - oldTop;
      var diffZoom = zoom - oldZoom;

      var step = function(percent, now, render) {

        if (render) {

          self.__scrollLeft = oldLeft + (diffLeft * percent);
          self.__scrollTop = oldTop + (diffTop * percent);
          self.__zoomLevel = oldZoom + (diffZoom * percent);

          // Push values out
          if (self.__callback) {
            self.__callback(self.__scrollLeft, self.__scrollTop, self.__zoomLevel);
          }

        }
      };

      var verify = function(id) {
        return self.__isAnimating === id;
      };

      var completed = function(renderedFramesPerSecond, animationId, wasFinished) {
        if (animationId === self.__isAnimating) {
          self.__isAnimating = false;
        }
        if (self.__didDecelerationComplete || wasFinished) {
          self.options.scrollingComplete();
        }

        if (self.options.zooming) {
          self.__computeScrollMax();
        }
      };

      // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out
      self.__isAnimating = core.effect.Animate.start(step, verify, completed, self.options.animationDuration, wasAnimating ? easeOutCubic : easeInOutCubic);

    } else {

      self.__scheduledLeft = self.__scrollLeft = left;
      self.__scheduledTop = self.__scrollTop = top;
      self.__scheduledZoom = self.__zoomLevel = zoom;

      // Push values out
      if (self.__callback) {
        self.__callback(left, top, zoom);
      }

      // Fix max scroll ranges
      if (self.options.zooming) {
        self.__computeScrollMax();
      }
    }
  },


  /**
   * Recomputes scroll minimum values based on client dimensions and content dimensions.
   */
  __computeScrollMax: function(zoomLevel) {

    var self = this;

    if (zoomLevel == null) {
      zoomLevel = self.__zoomLevel;
    }

    self.__maxScrollLeft = Math.max((self.__contentWidth * zoomLevel) - self.__clientWidth, 0);
    self.__maxScrollTop = Math.max((self.__contentHeight * zoomLevel) - self.__clientHeight, 0);

  },



  /*
  ---------------------------------------------------------------------------
    ANIMATION (DECELERATION) SUPPORT
  ---------------------------------------------------------------------------
  */

  /**
   * Called when a touch sequence end and the speed of the finger was high enough
   * to switch into deceleration mode.
   */
  __startDeceleration: function(timeStamp) {

    var self = this;

    if (self.options.paging) {

      var scrollLeft = Math.max(Math.min(self.__scrollLeft, self.__maxScrollLeft), 0);
      var scrollTop = Math.max(Math.min(self.__scrollTop, self.__maxScrollTop), 0);
      var clientWidth = self.__clientWidth;
      var clientHeight = self.__clientHeight;

      // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
      // Each page should have exactly the size of the client area.
      self.__minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
      self.__minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
      self.__maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
      self.__maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;

    } else {

      self.__minDecelerationScrollLeft = 0;
      self.__minDecelerationScrollTop = 0;
      self.__maxDecelerationScrollLeft = self.__maxScrollLeft;
      self.__maxDecelerationScrollTop = self.__maxScrollTop;

    }

    // Wrap class method
    var step = function(percent, now, render) {
      self.__stepThroughDeceleration(render);
    };

    // How much velocity is required to keep the deceleration running
    var minVelocityToKeepDecelerating = self.options.snapping ? 4 : 0.1;

    // Detect whether it's still worth to continue animating steps
    // If we are already slow enough to not being user perceivable anymore, we stop the whole process here.
    var verify = function() {
      var shouldContinue = Math.abs(self.__decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs(self.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
      if (!shouldContinue) {
        self.__didDecelerationComplete = true;
      }
      return shouldContinue;
    };

    var completed = function(renderedFramesPerSecond, animationId, wasFinished) {
      self.__isDecelerating = false;
      if (self.__didDecelerationComplete) {
        self.options.scrollingComplete();
      }

      // Animate to grid when snapping is active, otherwise just fix out-of-boundary positions
      self.scrollTo(self.__scrollLeft, self.__scrollTop, self.options.snapping);
    };

    // Start animation and switch on flag
    self.__isDecelerating = core.effect.Animate.start(step, verify, completed);

  },


  /**
   * Called on every step of the animation
   *
   * @param inMemory {Boolean?false} Whether to not render the current step, but keep it in memory only. Used internally only!
   */
  __stepThroughDeceleration: function(render) {

    var self = this;


    //
    // COMPUTE NEXT SCROLL POSITION
    //

    // Add deceleration to scroll position
    var scrollLeft = self.__scrollLeft + self.__decelerationVelocityX;
    var scrollTop = self.__scrollTop + self.__decelerationVelocityY;


    //
    // HARD LIMIT SCROLL POSITION FOR NON BOUNCING MODE
    //

    if (!self.options.bouncing) {

      var scrollLeftFixed = Math.max(Math.min(self.__maxDecelerationScrollLeft, scrollLeft), self.__minDecelerationScrollLeft);
      if (scrollLeftFixed !== scrollLeft) {
        scrollLeft = scrollLeftFixed;
        self.__decelerationVelocityX = 0;
      }

      var scrollTopFixed = Math.max(Math.min(self.__maxDecelerationScrollTop, scrollTop), self.__minDecelerationScrollTop);
      if (scrollTopFixed !== scrollTop) {
        scrollTop = scrollTopFixed;
        self.__decelerationVelocityY = 0;
      }

    }


    //
    // UPDATE SCROLL POSITION
    //

    if (render) {

      self.__publish(scrollLeft, scrollTop, self.__zoomLevel);

    } else {

      self.__scrollLeft = scrollLeft;
      self.__scrollTop = scrollTop;

    }


    //
    // SLOW DOWN
    //

    // Slow down velocity on every iteration
    if (!self.options.paging) {

      // This is the factor applied to every iteration of the animation
      // to slow down the process. This should emulate natural behavior where
      // objects slow down when the initiator of the movement is removed
      var frictionFactor = 0.95;

      self.__decelerationVelocityX *= frictionFactor;
      self.__decelerationVelocityY *= frictionFactor;

    }


    //
    // BOUNCING SUPPORT
    //

    if (self.options.bouncing) {

      var scrollOutsideX = 0;
      var scrollOutsideY = 0;

      // This configures the amount of change applied to deceleration/acceleration when reaching boundaries
      var penetrationDeceleration = self.options.penetrationDeceleration; 
      var penetrationAcceleration = self.options.penetrationAcceleration; 

      // Check limits
      if (scrollLeft < self.__minDecelerationScrollLeft) {
        scrollOutsideX = self.__minDecelerationScrollLeft - scrollLeft;
      } else if (scrollLeft > self.__maxDecelerationScrollLeft) {
        scrollOutsideX = self.__maxDecelerationScrollLeft - scrollLeft;
      }

      if (scrollTop < self.__minDecelerationScrollTop) {
        scrollOutsideY = self.__minDecelerationScrollTop - scrollTop;
      } else if (scrollTop > self.__maxDecelerationScrollTop) {
        scrollOutsideY = self.__maxDecelerationScrollTop - scrollTop;
      }

      // Slow down until slow enough, then flip back to snap position
      if (scrollOutsideX !== 0) {
        if (scrollOutsideX * self.__decelerationVelocityX <= 0) {
          self.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
        } else {
          self.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
        }
      }

      if (scrollOutsideY !== 0) {
        if (scrollOutsideY * self.__decelerationVelocityY <= 0) {
          self.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
        } else {
          self.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
        }
      }
    }
  }
});

})(ionic);
;
(function(ionic) {
'use strict';
  /**
   * An ActionSheet is the slide up menu popularized on iOS.
   *
   * You see it all over iOS apps, where it offers a set of options 
   * triggered after an action.
   */
  ionic.views.ActionSheet = ionic.views.View.inherit({
    initialize: function(opts) {
      this.el = opts.el;
    },
    show: function() {
      // Force a reflow so the animation will actually run
      this.el.offsetWidth;

      this.el.classList.add('active');
    },
    hide: function() {
      // Force a reflow so the animation will actually run
      this.el.offsetWidth;
      this.el.classList.remove('active');
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';

  ionic.views.HeaderBar = ionic.views.View.inherit({
    initialize: function(opts) {
      this.el = opts.el;

      ionic.extend(this, {
        alignTitle: 'center'
      }, opts);

      this.align();
    },

    /**
     * Align the title text given the buttons in the header
     * so that the header text size is maximized and aligned
     * correctly as long as possible.
     */
    align: function() {
      var _this = this;

      window.rAF(ionic.proxy(function() {
        var i, c, childSize;
        var childNodes = this.el.childNodes;

        // Find the title element
        var title = this.el.querySelector('.title');
        if(!title) {
          return;
        }
      
        var leftWidth = 0;
        var rightWidth = 0;
        var titlePos = Array.prototype.indexOf.call(childNodes, title);

        // Compute how wide the left children are
        for(i = 0; i < titlePos; i++) {
          childSize = null;
          c = childNodes[i];
          if(c.nodeType == 3) {
            childSize = ionic.DomUtil.getTextBounds(c);
          } else if(c.nodeType == 1) {
            childSize = c.getBoundingClientRect();
          }
          if(childSize) {
            leftWidth += childSize.width;
          }
        }

        // Compute how wide the right children are
        for(i = titlePos + 1; i < childNodes.length; i++) {
          childSize = null;
          c = childNodes[i];
          if(c.nodeType == 3) {
            childSize = ionic.DomUtil.getTextBounds(c);
          } else if(c.nodeType == 1) {
            childSize = c.getBoundingClientRect();
          }
          if(childSize) {
            rightWidth += childSize.width;
          }
        }

        var margin = Math.max(leftWidth, rightWidth) + 10;

        // Size and align the header title based on the sizes of the left and
        // right children, and the desired alignment mode
        if(this.alignTitle == 'center') {
          if(margin > 10) {
            title.style.left = margin + 'px';
            title.style.right = margin + 'px';
          }
          if(title.offsetWidth < title.scrollWidth) {
            if(rightWidth > 0) {
              title.style.right = (rightWidth + 5) + 'px';
            }
          }
        } else if(this.alignTitle == 'left') {
          title.classList.add('title-left');
          if(leftWidth > 0) {
            title.style.left = (leftWidth + 15) + 'px';
          }
        } else if(this.alignTitle == 'right') {
          title.classList.add('title-right');
          if(rightWidth > 0) {
            title.style.right = (rightWidth + 15) + 'px';
          }
        }
      }, this));
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';

  var ITEM_CLASS = 'item';
  var ITEM_CONTENT_CLASS = 'item-content';
  var ITEM_SLIDING_CLASS = 'item-sliding';
  var ITEM_OPTIONS_CLASS = 'item-options';
  var ITEM_PLACEHOLDER_CLASS = 'item-placeholder';
  var ITEM_REORDERING_CLASS = 'item-reordering';
  var ITEM_DRAG_CLASS = 'item-drag';

  var DragOp = function() {};
  DragOp.prototype = {
    start: function(e) {
    },
    drag: function(e) {
    },
    end: function(e) {
    }
  };



  var SlideDrag = function(opts) {
    this.dragThresholdX = opts.dragThresholdX || 10;
    this.el = opts.el;
  };

  SlideDrag.prototype = new DragOp();
  SlideDrag.prototype.start = function(e) {
    var content, buttons, offsetX, buttonsWidth;

    if(e.target.classList.contains(ITEM_CONTENT_CLASS)) {
      content = e.target;
    } else if(e.target.classList.contains(ITEM_CLASS)) {
      content = e.target.querySelector('.' + ITEM_CONTENT_CLASS);
    }

    // If we don't have a content area as one of our children (or ourselves), skip
    if(!content) {
      return;
    }

    // Make sure we aren't animating as we slide
    content.classList.remove(ITEM_SLIDING_CLASS);

    // Grab the starting X point for the item (for example, so we can tell whether it is open or closed to start)
    offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;

    // Grab the buttons
    buttons = content.parentNode.querySelector('.' + ITEM_OPTIONS_CLASS);
    if(!buttons) {
      return;
    }
      
    buttonsWidth = buttons.offsetWidth;

    this._currentDrag = {
      buttonsWidth: buttonsWidth,
      content: content,
      startOffsetX: offsetX
    };
  };

  SlideDrag.prototype.drag = function(e) {
    var _this = this, buttonsWidth;

    window.rAF(function() {
      // We really aren't dragging
      if(!_this._currentDrag) {
        return;
      }

      // Check if we should start dragging. Check if we've dragged past the threshold,
      // or we are starting from the open state.
      if(!_this._isDragging &&
          ((Math.abs(e.gesture.deltaX) > _this.dragThresholdX) ||
          (Math.abs(_this._currentDrag.startOffsetX) > 0)))
      {
        _this._isDragging = true;
      }

      if(_this._isDragging) {
        buttonsWidth = _this._currentDrag.buttonsWidth;

        // Grab the new X point, capping it at zero
        var newX = Math.min(0, _this._currentDrag.startOffsetX + e.gesture.deltaX);

        // If the new X position is past the buttons, we need to slow down the drag (rubber band style)
        if(newX < -buttonsWidth) {
          // Calculate the new X position, capped at the top of the buttons
          newX = Math.min(-buttonsWidth, -buttonsWidth + (((e.gesture.deltaX + buttonsWidth) * 0.4)));
        }

        _this._currentDrag.content.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
      }
    });
  };

  SlideDrag.prototype.end = function(e, doneCallback) {
    var _this = this;

    // There is no drag, just end immediately
    if(!this._currentDrag) {
      doneCallback && doneCallback();
      return;
    }

    // If we are currently dragging, we want to snap back into place
    // The final resting point X will be the width of the exposed buttons
    var restingPoint = -this._currentDrag.buttonsWidth;

    // Check if the drag didn't clear the buttons mid-point 
    // and we aren't moving fast enough to swipe open
    if(e.gesture.deltaX > -(this._currentDrag.buttonsWidth/2)) {

      // If we are going left but too slow, or going right, go back to resting
      if(e.gesture.direction == "left" && Math.abs(e.gesture.velocityX) < 0.3) {
        restingPoint = 0;
      } else if(e.gesture.direction == "right") {
        restingPoint = 0;
      }

    }

    var content = this._currentDrag.content;

    var onRestingAnimationEnd = function(e) {
      if(e.propertyName == '-webkit-transform') {
        content.classList.remove(ITEM_SLIDING_CLASS);
      }
      e.target.removeEventListener('webkitTransitionEnd', onRestingAnimationEnd);
    };

    window.rAF(function() {
      var currentX = parseFloat(_this._currentDrag.content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
      if(currentX !== restingPoint) {
        _this._currentDrag.content.classList.add(ITEM_SLIDING_CLASS);
        _this._currentDrag.content.addEventListener('webkitTransitionEnd', onRestingAnimationEnd);
      }
      _this._currentDrag.content.style.webkitTransform = 'translate3d(' + restingPoint + 'px, 0, 0)';

      // Kill the current drag
      _this._currentDrag = null;


      // We are done, notify caller
      doneCallback && doneCallback();
    });
  };

  var ReorderDrag = function(opts) {
    this.dragThresholdY = opts.dragThresholdY || 0;
    this.onReorder = opts.onReorder;
    this.el = opts.el;
  };

  ReorderDrag.prototype = new DragOp();

  ReorderDrag.prototype.start = function(e) {
    var content;


    // Grab the starting Y point for the item
    var offsetY = this.el.offsetTop;//parseFloat(this.el.style.webkitTransform.replace('translate3d(', '').split(',')[1]) || 0;

    var startIndex = ionic.DomUtil.getChildIndex(this.el, this.el.nodeName.toLowerCase());

    var placeholder = this.el.cloneNode(true);

    placeholder.classList.add(ITEM_PLACEHOLDER_CLASS);

    this.el.parentNode.insertBefore(placeholder, this.el);

    this.el.classList.add(ITEM_REORDERING_CLASS);

    this._currentDrag = {
      startOffsetTop: offsetY,
      startIndex: startIndex,
      placeholder: placeholder
    };
  };

  ReorderDrag.prototype.drag = function(e) {
    var _this = this;

    window.rAF(function() {
      // We really aren't dragging
      if(!_this._currentDrag) {
        return;
      }

      // Check if we should start dragging. Check if we've dragged past the threshold,
      // or we are starting from the open state.
      if(!_this._isDragging && Math.abs(e.gesture.deltaY) > _this.dragThresholdY) {
        _this._isDragging = true;
      }

      if(_this._isDragging) {
        var newY = _this._currentDrag.startOffsetTop + e.gesture.deltaY;
        
        _this.el.style.top = newY + 'px';

        _this._currentDrag.currentY = newY;

        _this._reorderItems();
      }
    });
  };

  // When an item is dragged, we need to reorder any items for sorting purposes
  ReorderDrag.prototype._reorderItems = function() {
    var placeholder = this._currentDrag.placeholder;
    var siblings = Array.prototype.slice.call(this._currentDrag.placeholder.parentNode.children);
    
    // Remove the floating element from the child search list
    siblings.splice(siblings.indexOf(this.el), 1);

    var index = siblings.indexOf(this._currentDrag.placeholder);
    var topSibling = siblings[Math.max(0, index - 1)];
    var bottomSibling = siblings[Math.min(siblings.length, index+1)];
    var thisOffsetTop = this._currentDrag.currentY;// + this._currentDrag.startOffsetTop;

    if(topSibling && (thisOffsetTop < topSibling.offsetTop + topSibling.offsetHeight/2)) {
      ionic.DomUtil.swapNodes(this._currentDrag.placeholder, topSibling);
      return index - 1;
    } else if(bottomSibling && thisOffsetTop > (bottomSibling.offsetTop + bottomSibling.offsetHeight/2)) {
      ionic.DomUtil.swapNodes(bottomSibling, this._currentDrag.placeholder);
      return index + 1;
    }
  };

  ReorderDrag.prototype.end = function(e, doneCallback) {
    if(!this._currentDrag) {
      doneCallback && doneCallback();
      return;
    }

    var placeholder = this._currentDrag.placeholder;

    // Reposition the element
    this.el.classList.remove(ITEM_REORDERING_CLASS);
    this.el.style.top = 0;

    var finalPosition = ionic.DomUtil.getChildIndex(placeholder, placeholder.nodeName.toLowerCase());
    placeholder.parentNode.insertBefore(this.el, placeholder);
    placeholder.parentNode.removeChild(placeholder);

    this.onReorder && this.onReorder(this.el, this._currentDrag.startIndex, finalPosition);

    this._currentDrag = null;
    doneCallback && doneCallback();
  };



  /**
   * The ListView handles a list of items. It will process drag animations, edit mode,
   * and other operations that are common on mobile lists or table views.
   */
  ionic.views.ListView = ionic.views.View.inherit({
    initialize: function(opts) {
      var _this = this;

      opts = ionic.extend({
        onReorder: function(el, oldIndex, newIndex) {},
        virtualRemoveThreshold: -200,
        virtualAddThreshold: 200
      }, opts);

      ionic.extend(this, opts);

      if(!this.itemHeight && this.listEl) {
        this.itemHeight = this.listEl.children[0] && parseInt(this.listEl.children[0].style.height, 10);
      }

      //ionic.views.ListView.__super__.initialize.call(this, opts);

      this.onRefresh = opts.onRefresh || function() {};
      this.onRefreshOpening = opts.onRefreshOpening || function() {};
      this.onRefreshHolding = opts.onRefreshHolding || function() {};

      window.ionic.onGesture('touch', function(e) {
        _this._handleTouch(e);
      }, this.el);

      window.ionic.onGesture('release', function(e) {
        _this._handleTouchRelease(e);
      }, this.el);
        
      // Start the drag states
      this._initDrag();
    },
    /**
     * Called to tell the list to stop refreshing. This is useful
     * if you are refreshing the list and are done with refreshing.
     */
    stopRefreshing: function() {
      var refresher = this.el.querySelector('.list-refresher');
      refresher.style.height = '0px';
    },

    /**
     * If we scrolled and have virtual mode enabled, compute the window
     * of active elements in order to figure out the viewport to render.
     */
    didScroll: function(e) {
      if(this.isVirtual) {
        var itemHeight = this.itemHeight;

        // TODO: This would be inaccurate if we are windowed
        var totalItems = this.listEl.children.length;

        // Grab the total height of the list
        var scrollHeight = e.target.scrollHeight;

        // Get the viewport height
        var viewportHeight = this.el.parentNode.offsetHeight;

        // scrollTop is the current scroll position
        var scrollTop = e.scrollTop;

        // High water is the pixel position of the first element to include (everything before
        // that will be removed)
        var highWater = Math.max(0, e.scrollTop + this.virtualRemoveThreshold);

        // Low water is the pixel position of the last element to include (everything after
        // that will be removed)
        var lowWater = Math.min(scrollHeight, Math.abs(e.scrollTop) + viewportHeight + this.virtualAddThreshold);

        // Compute how many items per viewport size can show
        var itemsPerViewport = Math.floor((lowWater - highWater) / itemHeight);

        // Get the first and last elements in the list based on how many can fit
        // between the pixel range of lowWater and highWater
        var first = parseInt(Math.abs(highWater / itemHeight), 10);
        var last = parseInt(Math.abs(lowWater / itemHeight), 10);

        // Get the items we need to remove
        this._virtualItemsToRemove = Array.prototype.slice.call(this.listEl.children, 0, first);

        // Grab the nodes we will be showing
        var nodes = Array.prototype.slice.call(this.listEl.children, first, first + itemsPerViewport);

        this.renderViewport && this.renderViewport(highWater, lowWater, first, last);
      }
    },

    didStopScrolling: function(e) {
      if(this.isVirtual) {
        for(var i = 0; i < this._virtualItemsToRemove.length; i++) {
          var el = this._virtualItemsToRemove[i];
          //el.parentNode.removeChild(el);
          this.didHideItem && this.didHideItem(i);
        }
        // Once scrolling stops, check if we need to remove old items

      }
    },

    _initDrag: function() {
      //ionic.views.ListView.__super__._initDrag.call(this);

      //this._isDragging = false;
      this._dragOp = null;
    },

    // Return the list item from the given target
    _getItem: function(target) {
      while(target) {
        if(target.classList.contains(ITEM_CLASS)) {
          return target;
        }
        target = target.parentNode;
      }
      return null;
    },


    _startDrag: function(e) {
      var _this = this;

      this._isDragging = false;

      // Check if this is a reorder drag
      if(ionic.DomUtil.getParentOrSelfWithClass(e.target, ITEM_DRAG_CLASS) && (e.gesture.direction == 'up' || e.gesture.direction == 'down')) {
        var item = this._getItem(e.target);

        if(item) {
          this._dragOp = new ReorderDrag({
            el: item,
            onReorder: function(el, start, end) {
              _this.onReorder && _this.onReorder(el, start, end);
            }
          });
          this._dragOp.start(e);
          e.preventDefault();
          return;
        }
      }

      // Or check if this is a swipe to the side drag
      else if((e.gesture.direction == 'left' || e.gesture.direction == 'right') && Math.abs(e.gesture.deltaX) > 5) {
        this._dragOp = new SlideDrag({ el: this.el });
        this._dragOp.start(e);
        e.preventDefault();
        return;
      }

      // We aren't handling it, so pass it up the chain
      //ionic.views.ListView.__super__._startDrag.call(this, e);
    },


    _handleEndDrag: function(e) {
      var _this = this;
      
      if(!this._dragOp) {
        //ionic.views.ListView.__super__._handleEndDrag.call(this, e);
        return;
      }

      this._dragOp.end(e, function() {
        _this._initDrag();
      });
    },

    /**
     * Process the drag event to move the item to the left or right.
     */
    _handleDrag: function(e) {
      var _this = this, content, buttons;
          
      // If the user has a touch timeout to highlight an element, clear it if we
      // get sufficient draggage
      if(Math.abs(e.gesture.deltaX) > 10 || Math.abs(e.gesture.deltaY) > 10) {
        clearTimeout(this._touchTimeout);
      }

      clearTimeout(this._touchTimeout);
      // If we get a drag event, make sure we aren't in another drag, then check if we should
      // start one
      if(!this.isDragging && !this._dragOp) {
        this._startDrag(e);
      }

      // No drag still, pass it up
      if(!this._dragOp) { 
        //ionic.views.ListView.__super__._handleDrag.call(this, e);
        return;
      }

      e.preventDefault();
      this._dragOp.drag(e);
    },

    /**
     * Handle the touch event to show the active state on an item if necessary.
     */
    _handleTouch: function(e) {
      var _this = this;

      var item = ionic.DomUtil.getParentOrSelfWithClass(e.target, ITEM_CLASS);
      if(!item) { return; }

      this._touchTimeout = setTimeout(function() {
        var items = _this.el.querySelectorAll('.item');
        for(var i = 0, l = items.length; i < l; i++) {
          items[i].classList.remove('active');
        }
        item.classList.add('active');
      }, 250);
    },

    /**
     * Handle the release event to remove the active state on an item if necessary.
     */
    _handleTouchRelease: function(e) {
      var _this = this;

      // Cancel touch timeout
      clearTimeout(this._touchTimeout);
      var items = _this.el.querySelectorAll('.item');
      for(var i = 0, l = items.length; i < l; i++) {
        items[i].classList.remove('active');
      }
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';
  /**
   * An ActionSheet is the slide up menu popularized on iOS.
   *
   * You see it all over iOS apps, where it offers a set of options 
   * triggered after an action.
   */
  ionic.views.Loading = ionic.views.View.inherit({
    initialize: function(opts) {
      var _this = this;

      this.el = opts.el;

      this.maxWidth = opts.maxWidth || 200;

      this._loadingBox = this.el.querySelector('.loading');
    },
    show: function() {
      var _this = this;

      if(this._loadingBox) {
        var lb = _this._loadingBox;

        var width = Math.min(_this.maxWidth, Math.max(window.outerWidth - 40, lb.offsetWidth));

        lb.style.width = width;

        lb.style.marginLeft = (-lb.offsetWidth) / 2 + 'px';
        lb.style.marginTop = (-lb.offsetHeight) / 2 + 'px';

        _this.el.classList.add('active');
      }
    },
    hide: function() {
      // Force a reflow so the animation will actually run
      this.el.offsetWidth;

      this.el.classList.remove('active');
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';

  ionic.views.Modal = ionic.views.View.inherit({
    initialize: function(opts) {
      opts = ionic.extend({
        focusFirstInput: false,
        unfocusOnHide: true
      }, opts);

      ionic.extend(this, opts);

      this.el = opts.el;
    },
    show: function() {
      this.el.classList.add('active');

      if(this.focusFirstInput) {
        var input = this.el.querySelector('input, textarea');
        input && input.focus && input.focus();
      }
    },
    hide: function() {
      this.el.classList.remove('active');

      // Unfocus all elements
      if(this.unfocusOnHide) {
        var inputs = this.el.querySelectorAll('input, textarea');
        for(var i = 0; i < inputs.length; i++) {
          inputs[i].blur && inputs[i].blur();
        }
      }
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';

  ionic.views.NavBar = ionic.views.View.inherit({
    initialize: function(opts) {
      this.el = opts.el;

      this._titleEl = this.el.querySelector('.title');

      if(opts.hidden) {
        this.hide();
      }
    },
    hide: function() {
      this.el.classList.add('hidden');
    },
    show: function() {
      this.el.classList.remove('hidden');
    },
    shouldGoBack: function() {},

    setTitle: function(title) {
      if(!this._titleEl) {
        return;
      }
      this._titleEl.innerHTML = title;
    },

    showBackButton: function(shouldShow) {
      var _this = this;

      if(!this._currentBackButton) {
        var back = document.createElement('a');
        back.className = 'button back';
        back.innerHTML = 'Back';

        this._currentBackButton = back;
        this._currentBackButton.onclick = function(event) {
          _this.shouldGoBack && _this.shouldGoBack();
        };
      }

      if(shouldShow && !this._currentBackButton.parentNode) {
        // Prepend the back button
        this.el.insertBefore(this._currentBackButton, this.el.firstChild);
      } else if(!shouldShow && this._currentBackButton.parentNode) {
        // Remove the back button if it's there
        this._currentBackButton.parentNode.removeChild(this._currentBackButton);
      }
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';
  /**
   * An ActionSheet is the slide up menu popularized on iOS.
   *
   * You see it all over iOS apps, where it offers a set of options 
   * triggered after an action.
   */
  ionic.views.Popup = ionic.views.View.inherit({
    initialize: function(opts) {
      var _this = this;

      this.el = opts.el;
    },

    setTitle: function(title) {
      var titleEl = el.querySelector('.popup-title');
      if(titleEl) {
        titleEl.innerHTML = title;
      }
    },
    alert: function(message) {
      var _this = this;

      window.rAF(function() {
        _this.setTitle(message);
        _this.el.classList.add('active');
      });
    },
    hide: function() {
      // Force a reflow so the animation will actually run
      this.el.offsetWidth;

      this.el.classList.remove('active');
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';

  /**
   * The side menu view handles one of the side menu's in a Side Menu Controller
   * configuration.
   * It takes a DOM reference to that side menu element.
   */
  ionic.views.SideMenu = ionic.views.View.inherit({
    initialize: function(opts) {
      this.el = opts.el;
      this.width = opts.width;
      this.isEnabled = opts.isEnabled || true;
    },

    getFullWidth: function() {
      return this.width;
    },
    setIsEnabled: function(isEnabled) {
      this.isEnabled = isEnabled;
    },
    bringUp: function() {
      this.el.style.zIndex = 0;
    },
    pushDown: function() {
      this.el.style.zIndex = -1;
    }
  });

  ionic.views.SideMenuContent = ionic.views.View.inherit({
    initialize: function(opts) {
      var _this = this;

      ionic.extend(this, {
        animationClass: 'menu-animated',
        onDrag: function(e) {},
        onEndDrag: function(e) {},
      }, opts);

      ionic.onGesture('drag', ionic.proxy(this._onDrag, this), this.el);
      ionic.onGesture('release', ionic.proxy(this._onEndDrag, this), this.el);
    },
    _onDrag: function(e) {
      this.onDrag && this.onDrag(e);
    },
    _onEndDrag: function(e) {
      this.onEndDrag && this.onEndDrag(e);
    },
    disableAnimation: function() {
      this.el.classList.remove(this.animationClass);
    },
    enableAnimation: function() {
      this.el.classList.add(this.animationClass);
    },
    getTranslateX: function() {
      return parseFloat(this.el.style.webkitTransform.replace('translate3d(', '').split(',')[0]);
    },
    setTranslateX: function(x) {
      this.el.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
    }
  });

})(ionic);
;
/**
 * The SlideBox is a swipeable, slidable, slideshowable box. Think of any image gallery
 * or iOS "dot" pager gallery, or maybe a carousel.
 *
 * Each screen fills the full width and height of the viewport, and screens can
 * be swiped between, or set to automatically transition.
 */
(function(ionic) {
'use strict';

  ionic.views.SlideBox = ionic.views.View.inherit({
    initialize: function(opts) {
      var _this = this;

      this.slideChanged = opts.slideChanged || function() {};
      this.el = opts.el;
      this.pager = this.el.querySelector('.slide-box-pager');

      // The drag threshold is the pixel delta that will trigger a drag (to 
      // avoid accidental dragging)
      this.dragThresholdX = opts.dragThresholdX || 10;
      // The velocity threshold is a velocity of drag that indicates a "swipe". This
      // number is taken from hammer.js's calculations
      this.velocityXThreshold = opts.velocityXThreshold || 0.3;

      // Initialize the slide index to the first page and update the pager
      this.slideIndex = 0;
      this._updatePager();

      // Listen for drag and release events
      window.ionic.onGesture('drag', function(e) {
        _this._handleDrag(e);
        e.gesture.srcEvent.preventDefault();
      }, this.el);
      window.ionic.onGesture('release', function(e) {
        _this._handleEndDrag(e);
      }, this.el);
    },

    /**
     * Tell the pager to update itself if content is added or
     * removed. 
     */
    update: function() {
      this._updatePager();
    },

    prependSlide: function(el) {
      var content = this.el.firstElementChild;
      if(!content) { return; }

      var slideWidth = content.offsetWidth;
      var offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
      var newOffsetX = Math.min(0, offsetX - slideWidth);
          
      content.insertBefore(el, content.firstChild);

      content.classList.remove('slide-box-animating');
      content.style.webkitTransform = 'translate3d(' + newOffsetX + 'px, 0, 0)';

      this._prependPagerIcon();
      this.slideIndex = (this.slideIndex + 1) % content.children.length;
      this._updatePager();
    },

    appendSlide: function(el) {
      var content = this.el.firstElementChild;
      if(!content) { return; }

      content.classList.remove('slide-box-animating');
      content.appendChild(el);

      this._appendPagerIcon();
      this._updatePager();
    },

    removeSlide: function(index) {
      var content = this.el.firstElementChild;
      if(!content) { return; }

      var items = this.el.firstElementChild;
      items.removeChild(items.firstElementChild);

      var slideWidth = content.offsetWidth;
      var offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;
      var newOffsetX = Math.min(0, offsetX + slideWidth);
          
      content.classList.remove('slide-box-animating');
      content.style.webkitTransform = 'translate3d(' + newOffsetX + 'px, 0, 0)';

      this._removePagerIcon();
      this.slideIndex = Math.max(0, (this.slideIndex - 1) % content.children.length);
      this._updatePager();
    },

    /**
     * Slide to the given slide index.
     *
     * @param {int} the index of the slide to animate to.
     */
    slideToSlide: function(index) {
      var content = this.el.firstElementChild;
      if(!content) {
        return;
      }

      // Get the width of one slide
      var slideWidth = content.offsetWidth;

      // Calculate the new offsetX position which is just
      // N slides to the left, where N is the given index
      var offsetX = index * slideWidth;

      // Calculate the max X position we'd allow based on how many slides
      // there are.
      var maxX = Math.max(0, content.children.length - 1) * slideWidth;

      // Bounds the offset X position in the range maxX >= offsetX >= 0
      offsetX = offsetX < 0 ? 0 : offsetX > maxX ? maxX : offsetX;

      // Animate and slide the slides over
      content.classList.add('slide-box-animating');
      content.style.webkitTransform = 'translate3d(' + -offsetX + 'px, 0, 0)';

      var lastSlide = this.slideIndex;

      // Update the slide index
      this.slideIndex = Math.ceil(offsetX / slideWidth);

      if(lastSlide !== this.slideIndex) {
        this.slideChanged && this.slideChanged(this.slideIndex);
      }

      this._updatePager();
    },

    /**
     * Get the currently set slide index. This method
     * is updated before any transitions run, so the
     * value could be early.
     *
     * @return {int} the current slide index
     */
    getSlideIndex: function() {
      return this.slideIndex;
    },

    _appendPagerIcon: function() {
      if(!this.pager || !this.pager.children.length) { return; }

      var newPagerChild = this.pager.children[0].cloneNode();
      this.pager.appendChild(newPagerChild);
    },

    _prependPagerIcon: function() {
      if(!this.pager || !this.pager.children.length) { return; }

      var newPagerChild = this.pager.children[0].cloneNode();
      this.pager.insertBefore(newPagerChild, this.pager.firstChild);
    },

    _removePagerIcon: function() {
      if(!this.pager || !this.pager.children.length) { return; }

      this.pager.removeChild(this.pager.firstElementChild);
    },

    /**
     * If we have a pager, update the active page when the current slide
     * changes.
     */
    _updatePager: function() {
      if(!this.pager) {
        return;
      }

      var numPagerChildren = this.pager.children.length;
      if(!numPagerChildren) {
        // No children to update
        return;
      }

      // Update the active state of the pager icons
      for(var i = 0, j = this.pager.children.length; i < j; i++) {
        if(i == this.slideIndex) {
          this.pager.children[i].classList.add('active');
        } else {
          this.pager.children[i].classList.remove('active');
        }
      }
    },

    _initDrag: function() {
      this._isDragging = false;
      this._drag = null;
    },

    _handleEndDrag: function(e) {
      var _this = this,
          finalOffsetX, content, ratio, slideWidth, totalWidth, offsetX;

      window.rAF(function() {
      
        // We didn't have a drag, so just init and leave
        if(!_this._drag) {
          _this._initDrag();
          return;
        }

        // We did have a drag, so we need to snap to the correct spot

        // Grab the content layer
        content = _this._drag.content;

        // Enable transition duration
        content.classList.add('slide-box-animating');

        // Grab the current offset X position
        offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;

        // Calculate how wide a single slide is, and their total width
        slideWidth = content.offsetWidth;
        totalWidth = content.offsetWidth * content.children.length;

        // Calculate how far in this slide we've dragged
        ratio = (offsetX % slideWidth) / slideWidth;

        if(ratio >= 0) {
          // Anything greater than zero is too far left, this is an extreme case
          // TODO: Do we need this anymore?
          finalOffsetX = 0;
        } else if(ratio >= -0.5) {
          // We are less than half-way through a drag
          // Sliiide to the left
          finalOffsetX = Math.max(0, Math.floor(Math.abs(offsetX) / slideWidth) * slideWidth);
        } else {
          // We are more than half-way through a drag
          // Sliiide to the right
          finalOffsetX = Math.min(totalWidth - slideWidth, Math.ceil(Math.abs(offsetX) / slideWidth) * slideWidth);
        }


        if(e.gesture.velocityX > _this.velocityXThreshold) {
          if(e.gesture.direction == 'left') {
            _this.slideToSlide(_this.slideIndex + 1);
          } else if(e.gesture.direction == 'right') {
            _this.slideToSlide(_this.slideIndex - 1);
          }
        } else {
          // Calculate the new slide index (or "page")
          _this.slideIndex = Math.ceil(finalOffsetX / slideWidth);

          // Negative offsetX to slide correctly
          content.style.webkitTransform = 'translate3d(' + -finalOffsetX + 'px, 0, 0)';
        }

        _this._initDrag();
      });
    },

    /**
     * Initialize a drag by grabbing the content area to drag, and any other
     * info we might need for the dragging.
     */
    _startDrag: function(e) {
      var offsetX, content;

      this._initDrag();

      // Make sure to grab the element we will slide as our target
      content = ionic.DomUtil.getParentOrSelfWithClass(e.target, 'slide-box-slides');
      if(!content) {
        return;
      }

      // Disable transitions during drag
      content.classList.remove('slide-box-animating');

      // Grab the starting X point for the item (for example, so we can tell whether it is open or closed to start)
      offsetX = parseFloat(content.style.webkitTransform.replace('translate3d(', '').split(',')[0]) || 0;

      this._drag = {
        content: content,
        startOffsetX: offsetX,
        resist: 1
      };
    },

    /**
     * Process the drag event to move the item to the left or right.
     */
    _handleDrag: function(e) {
      var _this = this;

      window.rAF(function() {
        var content;

        // We really aren't dragging
        if(!_this._drag) {
          _this._startDrag(e);
        }

        // Sanity
        if(!_this._drag) { return; }

        // Stop any default events during the drag
        e.preventDefault();

        // Check if we should start dragging. Check if we've dragged past the threshold.
        if(!_this._isDragging && (Math.abs(e.gesture.deltaX) > _this.dragThresholdX)) {
          _this._isDragging = true;
        }

        if(_this._isDragging) {
          content = _this._drag.content;

          var newX = _this._drag.startOffsetX + (e.gesture.deltaX / _this._drag.resist);

          var rightMostX = -(content.offsetWidth * Math.max(0, content.children.length - 1));

          if(newX > 0) {
            // We are dragging past the leftmost pane, rubber band
            _this._drag.resist = (newX / content.offsetWidth) + 1.4;
          } else if(newX < rightMostX) {
            // Dragging past the rightmost pane, rubber band
            //newX = Math.min(rightMostX, + (((e.gesture.deltaX + buttonsWidth) * 0.4)));
            _this._drag.resist = (Math.abs(newX) / content.offsetWidth) - 0.6;
          }

          _this._drag.content.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
        }
      });
    }
  });

})(window.ionic);
;
(function(ionic) {
'use strict';

ionic.views.TabBarItem = ionic.views.View.inherit({
  initialize: function(el) {
    this.el = el;

    this._buildItem();
  },
  // Factory for creating an item from a given javascript object
  create: function(itemData) {
    var item = document.createElement('a');
    item.className = 'tab-item';

    // If there is an icon, add the icon element
    if(itemData.icon) {
      var icon = document.createElement('i');
      icon.className = itemData.icon;
      item.appendChild(icon);
    }
    item.appendChild(document.createTextNode(itemData.title));

    return new ionic.views.TabBarItem(item);
  },


  _buildItem: function() {
    var _this = this, child, children = Array.prototype.slice.call(this.el.children);

    for(var i = 0, j = children.length; i < j; i++) {
      child = children[i];

      // Test if this is a "i" tag with icon in the class name
      // TODO: This heuristic might not be sufficient
      if(child.tagName.toLowerCase() == 'i' && /icon/.test(child.className)) {
        this.icon = child.className;
        break;
      }

    }

    // Set the title to the text content of the tab.
    this.title = this.el.textContent.trim();

    this._tapHandler = function(e) {
      _this.onTap && _this.onTap(e);
    };

    ionic.on('tap', this._tapHandler, this.el);
  },
  onTap: function(e) {
  },

  // Remove the event listeners from this object
  destroy: function() {
    ionic.off('tap', this._tapHandler, this.el);
  },

  getIcon: function() {
    return this.icon;
  },

  getTitle: function() {
    return this.title;
  },

  setSelected: function(isSelected) {
    this.isSelected = isSelected;
    if(isSelected) {
      this.el.classList.add('active');
    } else {
      this.el.classList.remove('active');
    }
  }
});

ionic.views.TabBar = ionic.views.View.inherit({
  initialize: function(opts) {
    this.el = opts.el;
     
    this.items = [];

    this._buildItems();
  },
  // get all the items for the TabBar
  getItems: function() {
    return this.items;
  },

  // Add an item to the tab bar
  addItem: function(item) {
    // Create a new TabItem
    var tabItem = ionic.views.TabBarItem.prototype.create(item);

    this.appendItemElement(tabItem);

    this.items.push(tabItem);
    this._bindEventsOnItem(tabItem);
  },

  appendItemElement: function(item) {
    if(!this.el) {
      return;
    }
    this.el.appendChild(item.el);
  },

  // Remove an item from the tab bar
  removeItem: function(index) {
    var item = this.items[index];
    if(!item) {
      return;
    }
    item.onTap = undefined;
    item.destroy();
  },

  _bindEventsOnItem: function(item) {
    var _this = this;

    if(!this._itemTapHandler) {
      this._itemTapHandler = function(e) {
        //_this.selectItem(this);
        _this.trySelectItem(this);
      };
    }
    item.onTap = this._itemTapHandler;
  },

  // Get the currently selected item
  getSelectedItem: function() {
    return this.selectedItem;
  },

  // Set the currently selected item by index
  setSelectedItem: function(index) {
    this.selectedItem = this.items[index];

    // Deselect all
    for(var i = 0, j = this.items.length; i < j; i += 1) {
      this.items[i].setSelected(false);
    }

    // Select the new item
    if(this.selectedItem) {
      this.selectedItem.setSelected(true);
      //this.onTabSelected && this.onTabSelected(this.selectedItem, index);
    }
  },

  // Select the given item assuming we can find it in our
  // item list.
  selectItem: function(item) {
    for(var i = 0, j = this.items.length; i < j; i += 1) {
      if(this.items[i] == item) {
        this.setSelectedItem(i);
        return;
      }
    }
  },

  // Try to select a given item. This triggers an event such
  // that the view controller managing this tab bar can decide
  // whether to select the item or cancel it.
  trySelectItem: function(item) {
    for(var i = 0, j = this.items.length; i < j; i += 1) {
      if(this.items[i] == item) {
        this.tryTabSelect && this.tryTabSelect(i);
        return;
      }
    }
  },

  // Build the initial items list from the given DOM node.
  _buildItems: function() {

    var item, items = Array.prototype.slice.call(this.el.children);

    for(var i = 0, j = items.length; i < j; i += 1) {
      item =  new ionic.views.TabBarItem(items[i]);
      this.items[i] = item;
      this._bindEventsOnItem(item);
    }
  
    if(this.items.length > 0) {
      this.selectedItem = this.items[0];
    }

  },

  // Destroy this tab bar
  destroy: function() {
    for(var i = 0, j = this.items.length; i < j; i += 1) {
      this.items[i].destroy();
    }
    this.items.length = 0;
  }
});

})(window.ionic);
;
(function(ionic) {
'use strict';

  ionic.views.Toggle = ionic.views.View.inherit({
    initialize: function(opts) {
      this.el = opts.el;
      this.checkbox = opts.checkbox;
      this.handle = opts.handle;
      this.openPercent = -1;
    },

    tap: function(e) {
      this.val( !this.checkbox.checked );
    },

    drag: function(e) {
      var slidePageLeft = this.checkbox.offsetLeft + (this.handle.offsetWidth / 2);
      var slidePageRight = this.checkbox.offsetLeft + this.checkbox.offsetWidth - (this.handle.offsetWidth / 2);

      if(e.pageX >= slidePageRight - 4) {
        this.val(true);
      } else if(e.pageX <= slidePageLeft) {
        this.val(false);
      } else {
        this.setOpenPercent( Math.round( (1 - ((slidePageRight - e.pageX) / (slidePageRight - slidePageLeft) )) * 100) );
      }
    },

    setOpenPercent: function(openPercent) {
      // only make a change if the new open percent has changed
      if(this.openPercent < 0 || (openPercent < (this.openPercent - 3) || openPercent > (this.openPercent + 3) ) ) {
        this.openPercent = openPercent;

        if(openPercent === 0) {
          this.val(false);
        } else if(openPercent === 100) {
          this.val(true);
        } else {
          var openPixel = Math.round( (openPercent / 100) * this.checkbox.offsetWidth - (this.handle.offsetWidth) );
          openPixel = (openPixel < 1 ? 0 : openPixel);
          this.handle.style.webkitTransform = 'translate3d(' + openPixel + 'px,0,0)';
        }
      }
    },

    release: function(e) {
      this.val( this.openPercent >= 50 );
    },

    val: function(value) {
      if(value === true || value === false) {
        if(this.handle.style.webkitTransform !== "") {
          this.handle.style.webkitTransform = "";
        }
        this.checkbox.checked = value;
        this.openPercent = (value ? 100 : 0);
      }
      return this.checkbox.checked;
    }

  });

})(ionic);
;
(function(ionic) {
'use strict';
  ionic.controllers.ViewController = function(options) {
    this.initialize.apply(this, arguments);
  };

  ionic.controllers.ViewController.inherit = ionic.inherit;

  ionic.extend(ionic.controllers.ViewController.prototype, {
    initialize: function() {},
    // Destroy this view controller, including all child views
    destroy: function() {
    }
  });

})(window.ionic);
;
(function(ionic) {
'use strict';

/**
 * The NavController makes it easy to have a stack
 * of views or screens that can be pushed and popped
 * for a dynamic navigation flow. This API is modelled
 * off of the UINavigationController in iOS.
 *
 * The NavController can drive a nav bar to show a back button
 * if the stack can be poppped to go back to the last view, and
 * it will handle updating the title of the nav bar and processing animations.
 */
ionic.controllers.NavController = ionic.controllers.ViewController.inherit({
  initialize: function(opts) {
    var _this = this;

    this.navBar = opts.navBar;
    this.content = opts.content;
    this.controllers = opts.controllers || [];

    this._updateNavBar();

    // TODO: Is this the best way?
    this.navBar.shouldGoBack = function() {
      _this.pop();
    };
  },

  /**
   * @return {array} the array of controllers on the stack.
   */
  getControllers: function() {
    return this.controllers;
  },

  /**
   * @return {object} the controller at the top of the stack.
   */
  getTopController: function() {
    return this.controllers[this.controllers.length-1];
  },

  /**
   * Push a new controller onto the navigation stack. The new controller
   * will automatically become the new visible view.
   *
   * @param {object} controller the controller to push on the stack.
   */
  push: function(controller) {
    var last = this.controllers[this.controllers.length - 1];

    this.controllers.push(controller);

    // Indicate we are switching controllers
    var shouldSwitch = this.switchingController && this.switchingController(controller) || true;

    // Return if navigation cancelled
    if(shouldSwitch === false)
      return;

    // Actually switch the active controllers
    if(last) {
      last.isVisible = false;
      last.visibilityChanged && last.visibilityChanged('push');
    }

    // Grab the top controller on the stack
    var next = this.controllers[this.controllers.length - 1];

    next.isVisible = true;
    // Trigger visibility change, but send 'first' if this is the first page
    next.visibilityChanged && next.visibilityChanged(last ? 'push' : 'first');

    this._updateNavBar();

    return controller;
  },

  /**
   * Pop the top controller off the stack, and show the last one. This is the
   * "back" operation.
   *
   * @return {object} the last popped controller
   */
  pop: function() {
    var next, last;

    // Make sure we keep one on the stack at all times
    if(this.controllers.length < 2) {
      return;
    }

    // Grab the controller behind the top one on the stack
    last = this.controllers.pop();
    if(last) {
      last.isVisible = false;
      last.visibilityChanged && last.visibilityChanged('pop');
    }
    
    // Remove the old one
    //last && last.detach();

    next = this.controllers[this.controllers.length - 1];

    // TODO: No DOM stuff here
    //this.content.el.appendChild(next.el);
    next.isVisible = true;
    next.visibilityChanged && next.visibilityChanged('pop');

    // Switch to it (TODO: Animate or such things here)

    this._updateNavBar();

    return last;
  },

  /**
   * Show the NavBar (if any)
   */
  showNavBar: function() {
    if(this.navBar) {
      this.navBar.show();
    }
  },

  /**
   * Hide the NavBar (if any)
   */
  hideNavBar: function() {
    if(this.navBar) {
      this.navBar.hide();
    }
  },

  // Update the nav bar after a push or pop
  _updateNavBar: function() {
    if(!this.getTopController() || !this.navBar) {
      return;
    }

    this.navBar.setTitle(this.getTopController().title);

    if(this.controllers.length > 1) {
      this.navBar.showBackButton(true);
    } else {
      this.navBar.showBackButton(false);
    }
  }
});

})(window.ionic);
;
(function(ionic) {
'use strict';

  /**
   * The SideMenuController is a controller with a left and/or right menu that
   * can be slid out and toggled. Seen on many an app.
   *
   * The right or left menu can be disabled or not used at all, if desired.
   */
  ionic.controllers.SideMenuController = ionic.controllers.ViewController.inherit({
    initialize: function(options) {
      var self = this;

      this.left = options.left;
      this.right = options.right;
      this.content = options.content;
      this.dragThresholdX = options.dragThresholdX || 10;
        
      this._rightShowing = false;
      this._leftShowing = false;
      this._isDragging = false;

      if(this.content) {
        this.content.onDrag = function(e) {
          self._handleDrag(e);
        };

        this.content.onEndDrag =function(e) {
          self._endDrag(e);
        };
      }
    },
    /**
     * Set the content view controller if not passed in the constructor options.
     * 
     * @param {object} content
     */
    setContent: function(content) {
      var self = this;

      this.content = content;

      this.content.onDrag = function(e) {
        self._handleDrag(e);
      };

      this.content.endDrag = function(e) {
        self._endDrag(e);
      };
    },

    /**
     * Toggle the left menu to open 100%
     */
    toggleLeft: function() {
      var openAmount = this.getOpenAmount();
      if(openAmount > 0) {
        this.openPercentage(0);
      } else {
        this.openPercentage(100);
      }
    },

    /**
     * Toggle the right menu to open 100%
     */
    toggleRight: function() {
      var openAmount = this.getOpenAmount();
      if(openAmount < 0) {
        this.openPercentage(0);
      } else {
        this.openPercentage(-100);
      }
    },

    /**
     * Close all menus.
     */
    close: function() {
      this.openPercentage(0);
    },

    /**
     * @return {float} The amount the side menu is open, either positive or negative for left (positive), or right (negative)
     */
    getOpenAmount: function() {
      return this.content.getTranslateX() || 0;
    },

    /**
     * @return {float} The ratio of open amount over menu width. For example, a
     * menu of width 100 open 50 pixels would be open 50% or a ratio of 0.5. Value is negative
     * for right menu.
     */
    getOpenRatio: function() {
      var amount = this.getOpenAmount();
      if(amount >= 0) {
        return amount / this.left.width;
      }
      return amount / this.right.width;
    },

    isOpen: function() {
      return this.getOpenRatio() == 1;
    },

    /**
     * @return {float} The percentage of open amount over menu width. For example, a
     * menu of width 100 open 50 pixels would be open 50%. Value is negative
     * for right menu.
     */
    getOpenPercentage: function() {
      return this.getOpenRatio() * 100;
    },

    /**
     * Open the menu with a given percentage amount.
     * @param {float} percentage The percentage (positive or negative for left/right) to open the menu.
     */
    openPercentage: function(percentage) {
      var p = percentage / 100;

      if(this.left && percentage >= 0) {
        this.openAmount(this.left.width * p);
      } else if(this.right && percentage < 0) {
        var maxRight = this.right.width;
        this.openAmount(this.right.width * p);
      }
    },

    /**
     * Open the menu the given pixel amount.
     * @param {float} amount the pixel amount to open the menu. Positive value for left menu,
     * negative value for right menu (only one menu will be visible at a time).
     */
    openAmount: function(amount) {
      var maxLeft = this.left && this.left.width || 0;
      var maxRight = this.right && this.right.width || 0;

      // Check if we can move to that side, depending if the left/right panel is enabled
      if((!(this.left && this.left.isEnabled) && amount > 0) || (!(this.right && this.right.isEnabled) && amount < 0)) {
        return;
      }

      if((this._leftShowing && amount > maxLeft) || (this._rightShowing && amount < -maxRight)) {
        return;
      }
      
      this.content.setTranslateX(amount);

      if(amount >= 0) {
        this._leftShowing = true;
        this._rightShowing = false;

        // Push the z-index of the right menu down
        this.right && this.right.pushDown && this.right.pushDown();
        // Bring the z-index of the left menu up
        this.left && this.left.bringUp && this.left.bringUp();
      } else {
        this._rightShowing = true;
        this._leftShowing = false;

        // Bring the z-index of the right menu up
        this.right && this.right.bringUp && this.right.bringUp();
        // Push the z-index of the left menu down
        this.left && this.left.pushDown && this.left.pushDown();
      }
    },

    /**
     * Given an event object, find the final resting position of this side
     * menu. For example, if the user "throws" the content to the right and 
     * releases the touch, the left menu should snap open (animated, of course).
     *
     * @param {Event} e the gesture event to use for snapping
     */
    snapToRest: function(e) {
      // We want to animate at the end of this
      this.content.enableAnimation();
      this._isDragging = false;

      // Check how much the panel is open after the drag, and
      // what the drag velocity is
      var ratio = this.getOpenRatio();

      if(ratio === 0)
        return;

      var velocityThreshold = 0.3;
      var velocityX = e.gesture.velocityX;
      var direction = e.gesture.direction;

      // Less than half, going left 
      //if(ratio > 0 && ratio < 0.5 && direction == 'left' && velocityX < velocityThreshold) {
      //this.openPercentage(0);
      //}

      // Going right, less than half, too slow (snap back)
      if(ratio > 0 && ratio < 0.5 && direction == 'right' && velocityX < velocityThreshold) {
        this.openPercentage(0);
      }

      // Going left, more than half, too slow (snap back)
      else if(ratio > 0.5 && direction == 'left' && velocityX < velocityThreshold) {
        this.openPercentage(100);
      }

      // Going left, less than half, too slow (snap back)
      else if(ratio < 0 && ratio > -0.5 && direction == 'left' && velocityX < velocityThreshold) {
        this.openPercentage(0);
      }

      // Going right, more than half, too slow (snap back)
      else if(ratio < 0.5 && direction == 'right' && velocityX < velocityThreshold) {
        this.openPercentage(-100);
      }
      
      // Going right, more than half, or quickly (snap open)
      else if(direction == 'right' && ratio >= 0 && (ratio >= 0.5 || velocityX > velocityThreshold)) {
        this.openPercentage(100);
      }
      
      // Going left, more than half, or quickly (span open)
      else if(direction == 'left' && ratio <= 0 && (ratio <= -0.5 || velocityX > velocityThreshold)) {
        this.openPercentage(-100);
      }
      
      // Snap back for safety
      else {
        this.openPercentage(0);
      }
    },

    // End a drag with the given event
    _endDrag: function(e) {
      this.snapToRest(e);
      this._startX = null;
      this._lastX = null;
      this._offsetX = null;
    },

    // Handle a drag event
    _handleDrag: function(e) {
      // If we don't have start coords, grab and store them
      if(!this._startX) {
        this._startX = e.gesture.touches[0].pageX;
        this._lastX = this._startX;
      } else {
        // Grab the current tap coords
        this._lastX = e.gesture.touches[0].pageX;
      }

      // Calculate difference from the tap points
      if(!this._isDragging && Math.abs(this._lastX - this._startX) > this.dragThresholdX) {
        // if the difference is greater than threshold, start dragging using the current
        // point as the starting point
        this._startX = this._lastX;

        this._isDragging = true;
        // Initialize dragging
        this.content.disableAnimation();
        this._offsetX = this.getOpenAmount();
      }

      if(this._isDragging) {
        this.openAmount(this._offsetX + (this._lastX - this._startX));
      }
    }
  });

})(ionic);
;
(function(ionic) {
'use strict';

/**
 * The TabBarController handles a set of view controllers powered by a tab strip
 * at the bottom (or possibly top) of a screen.
 *
 * The API here is somewhat modelled off of UITabController in the sense that the
 * controllers actually define what the tab will look like (title, icon, etc.).
 *
 * Tabs shouldn't be interacted with through your own code. Instead, use the controller
 * methods which will power the tab bar.
 */
ionic.controllers.TabBarController = ionic.controllers.ViewController.inherit({
  initialize: function(options) {
    this.tabBar = options.tabBar;

    this._bindEvents();

    this.controllers = [];

    var controllers = options.controllers || [];

    for(var i = 0; i < controllers.length; i++) {
      this.addController(controllers[i]);
    }

    // Bind or set our tabWillChange callback
    this.controllerWillChange = options.controllerWillChange || function(controller) {};
    this.controllerChanged = options.controllerChanged || function(controller) {};

    // Try to select the first controller if we have one
    this.setSelectedController(0);
  },
  // Start listening for events on our tab bar
  _bindEvents: function() {
    var _this = this;

    this.tabBar.tryTabSelect = function(index) {
      _this.setSelectedController(index);
    };
  },


  selectController: function(index) {
    var shouldChange = true;

    // Check if we should switch to this tab. This lets the app
    // cancel tab switches if the context isn't right, for example.
    if(this.controllerWillChange) {
      if(this.controllerWillChange(this.controllers[index], index) === false) {
        shouldChange = false;
      }
    }

    if(shouldChange) {
      this.setSelectedController(index);
    }
  },

  // Force the selection of a controller at the given index
  setSelectedController: function(index) {
    if(index >= this.controllers.length) {
      return;
    }
    var lastController = this.selectedController;
    var lastIndex = this.selectedIndex;

    this.selectedController = this.controllers[index];
    this.selectedIndex = index;

    this._showController(index);
    this.tabBar.setSelectedItem(index);

    this.controllerChanged && this.controllerChanged(lastController, lastIndex, this.selectedController, this.selectedIndex);
  },

  _showController: function(index) {
    var c;

    for(var i = 0, j = this.controllers.length; i < j; i ++) {
      c = this.controllers[i];
      //c.detach && c.detach();
      c.isVisible = false;
      c.visibilityChanged && c.visibilityChanged();
    }

    c = this.controllers[index];
    //c.attach && c.attach();
    c.isVisible = true;
    c.visibilityChanged && c.visibilityChanged();
  },

  _clearSelected: function() {
    this.selectedController = null;
    this.selectedIndex = -1;
  },

  // Return the tab at the given index
  getController: function(index) {
    return this.controllers[index];
  },

  // Return the current tab list
  getControllers: function() {
    return this.controllers;
  },

  // Get the currently selected controller
  getSelectedController: function() {
    return this.selectedController;
  },

  // Get the index of the currently selected controller
  getSelectedControllerIndex: function() {
    return this.selectedIndex;
  },

  // Add a tab
  addController: function(controller) {
    this.controllers.push(controller);

    this.tabBar.addItem({
      title: controller.title,
      icon: controller.icon
    });

    // If we don't have a selected controller yet, select the first one.
    if(!this.selectedController) {
      this.setSelectedController(0);
    }
  },

  // Set the tabs and select the first
  setControllers: function(controllers) {
    this.controllers = controllers;
    this._clearSelected();
    this.selectController(0);
  },
});

})(window.ionic);
