'use strict';

$(function() {
  RepLocator.prototype.USE_HASH_AS_STATE = false;
  RepData.prototype.DATA_PATH = './js/locate/data/';

  var app = new RepLocator();

  app.start();
});
