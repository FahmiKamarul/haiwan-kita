// src/mocks/react-native-maps.web.js
// Robust Web implementation for react-native-maps using an Iframe with Leaflet
const React = require('react');
const { useEffect, useRef } = require('react');
const { View } = require('react-native');

const MapView = React.forwardRef(({ style, children, initialRegion }, ref) => {
  const iframeRef = useRef(null);

  // 1. Generate the HTML content for the iframe
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map;
        var markers = {};

        function initMap() {
          var center = ${initialRegion ? `[${initialRegion.latitude}, ${initialRegion.longitude}]` : '[3.1390, 101.6869]'};
          var delta = ${initialRegion?.latitudeDelta || 8};
          var zoom = Math.max(1, Math.min(18, Math.round(14 - Math.log2(delta * 111))));
          
          map = L.map('map').setView(center, zoom);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          window.parent.postMessage('MAP_READY', '*');
        }

        window.addEventListener('message', function(e) {
          try {
            var data = JSON.parse(e.data);
            if (data.type === 'UPDATE_MARKERS') {
              var newKeys = new Set();
              data.markers.forEach(function(m) {
                newKeys.add(m.id);
                if (!markers[m.id]) {
                  var marker = L.marker([m.lat, m.lng]).addTo(map);
                  if (m.title) marker.bindPopup('<b>' + m.title + '</b><br/>' + (m.description || ''));
                  markers[m.id] = marker;
                } else {
                  markers[m.id].setLatLng([m.lat, m.lng]);
                  if (m.title) markers[m.id].bindPopup('<b>' + m.title + '</b><br/>' + (m.description || ''));
                }
              });
              // Remove old
              Object.keys(markers).forEach(function(key) {
                if (!newKeys.has(key)) {
                  map.removeLayer(markers[key]);
                  delete markers[key];
                }
              });
            } else if (data.type === 'FIT_BOUNDS' && data.coords && data.coords.length > 0) {
              var bounds = L.latLngBounds(data.coords);
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            }
          } catch(err) {}
        });

        window.onload = initMap;
      </script>
    </body>
    </html>
  `;

  const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);

  // 2. Sync React children (Markers) to the iframe
  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    
    const markers = [];
    React.Children.forEach(children, (child) => {
      if (!child || child.type.displayName !== 'Marker') return;
      const { coordinate, title, description } = child.props;
      if (!coordinate) return;
      
      markers.push({
        id: child.key || (coordinate.latitude + '-' + coordinate.longitude),
        lat: coordinate.latitude,
        lng: coordinate.longitude,
        title,
        description
      });
    });

    iframeRef.current.contentWindow.postMessage(JSON.stringify({
      type: 'UPDATE_MARKERS',
      markers: markers
    }), '*');
  }, [children]);

  // 3. Expose fitToCoordinates
  React.useImperativeHandle(ref, () => ({
    fitToCoordinates: (coords, options) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow || !coords || coords.length === 0) return;
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        type: 'FIT_BOUNDS',
        coords: coords.map(c => [c.latitude, c.longitude])
      }), '*');
    },
  }));

  // Render an iframe natively via React.createElement
  return React.createElement(
    View,
    { style: [style, { flex: 1, minHeight: 400, backgroundColor: '#e5e5e5', overflow: 'hidden' }] },
    React.createElement('iframe', {
      ref: iframeRef,
      src: dataUri,
      style: { border: 0, width: '100%', height: '100%', flex: 1 },
      allowFullScreen: true,
    })
  );
});

MapView.displayName = 'MapView';

const Marker = () => null;
Marker.displayName = 'Marker';

module.exports = {
  default: MapView,
  Marker,
  PROVIDER_DEFAULT: null,
  PROVIDER_GOOGLE: null,
};
