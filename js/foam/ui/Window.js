CLASS({
  package: 'foam.ui',

  name: 'Window',

  exports: [
    '$$',
    '$',
    'addStyle',
    'animate',
    'cancelAnimationFrame',
    'clearInterval',
    'clearTimeout',
    'console',
    'document',
    'dynamic',
    'error',
    'info',
    'log',
    'memento',
    'registerModel_',
    'requestAnimationFrame',
    'setInterval',
    'setTimeout',
    'warn',
    'window'
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'name',
      defaultValue: 'window'
    },
    {
      name: 'window',
      postSet: function(_, w) {
        // TODO: This would be better if ChromeApp.js added this behaviour
        // in a SubModel of Window, ie. ChromeAppWindow
        if ( this.X.subDocument ) this.X.subDocument(w.document);

        this.document = w.document;
      }
    },
    {
      name: 'document'
    },
    {
      name: 'installedModels',
      lazyFactory: function() {
        return this.document.installedModels || ( this.document.installedModels = {} );
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'isBackground',
      defaultValue: false
    },
    {
      name: 'console',
      lazyFactory: function() { return this.window.console; }
    },
    {
      name: 'memento',
      lazyFactory: function() { this.window.WindowHashValue.create({window: this.window}); }
    }
  ],

  methods: {
    registerModel_: function(model) {
      var X        = this.X;
      var document = this.document;

      // TODO(kgr): If Traits have CSS then it will get installed more than once.
      // TODO(kgr): Add package support.
      for ( var m = model ; m && m.getPrototype ; m = m.extendsModel && this[m.extendsModel] ) {
        if ( this.installedModels[m.id] ) return;
        this.installedModels[m.id] = true;
        arequireModel(m)(function(m) {
          m.getPrototype().installInDocument(X, document);
        });
      }
    },
    addStyle: function(css) {
      var s = this.document.createElement('style');
      s.innerHTML = css;
      this.document.head.appendChild(s);
    },
    log:   function() { this.console.log.apply(this.console, arguments); }, 
    warn:  function() { this.console.warn.apply(this.console, arguments); }, 
    info:  function() { this.console.info.apply(this.console, arguments); }, 
    error: function() { this.console.error.apply(this.console, arguments); }, 
    $: function(id) {
      return ( this.document.FOAM_OBJECTS && this.document.FOAM_OBJECTS[id] ) ?
        this.document.FOAM_OBJECTS[id] :
        this.document.getElementById(id);
    },
    $$: function(cls) {
      return this.document.getElementsByClassName(cls);
    },
    dynamic: function(fn, opt_fn) {
      Events.dynamic(fn, opt_fn, this.X);
    },
    animate: function(duration, fn, opt_interp, opt_onEnd) {
      return Movement.animate(duration, fn, opt_interp, opt_onEnd, this.X);
    },
    setTimeout: function(f, t) {
      return this.window.setTimeout.apply(this.window, arguments);
    },
    clearTimeout: function(id) { this.window.clearTimeout(id); },
    setInterval: function(f, t) {
      return this.window.setInterval.apply(this.window, arguments);
    },
    clearInterval: function(id) { this.window.clearInterval(id); },
    requestAnimationFrame: function(f) {
      if ( this.isBackground ) return this.setTimeout(f, 16); 

      console.assert(
        this.window.requestAnimationFrame,
        'requestAnimationFrame not defined');
      return this.window.requestAnimationFrame(f);
    },
    cancelAnimationFrame: function(id) {
      if ( this.isBackground ) {
        this.clearTimeout(id);
        return;
      }

      this.window.cancelAnimationFrame && this.window.cancelAnimationFrame(id);
    }
  }
});


// Using the existence of 'process' to determine that we're running in Node.
foam.ui.Window.create(
  {
    window: window,
    name: 'DEFAULT WINDOW',
    isBackground: typeof process === 'object'
  },
  { __proto__: X, sub: function() { return X; } }
);