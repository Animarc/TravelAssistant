/* global window, document */
// Token and account URLs must be excluded before the application loads.
(function () {
  var home = /^\/(?:es\/?|en\/?|fr\/?|de\/?|zh\/?|ru\/?|ja\/?)?$/.test(window.location.pathname);
  if (!home || window.location.search) {
    var robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, follow';
  }
}());
