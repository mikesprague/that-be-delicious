import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: {
    lat: 42.4,
    lng: -76.4,
  },
  zoom: 10,
};
function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then((res) => {
      const places = res.data;
      if (places) {
        /* eslint-disable no-undef */
        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();
        /* eslint-enable no-undef */
        const markers = places.map((place) => {
          const [placeLng, placeLat] = place.location.coordinates;
          const position = { lat: placeLat, lng: placeLng };
          bounds.extend(position);
          /* eslint-disable no-undef */
          const marker = new google.maps.Marker({ map, position });
          /* eslint-enable no-undef */
          marker.place = place;
          return marker;
        });
        markers.map(marker => marker.addListener('click', function() {
          const html = `
            <div class="popup">
              <a href="/stores/${this.place.slug}">
                <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}">
              </a>
              <p>
                <strong>${this.place.name}</strong>
                <br>
                ${this.place.location.address}
              </p>
            </div>
          `;
          infoWindow.setContent(html);
          infoWindow.open(map, this);
        }));

        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
        return;
      }
      console.log('No places found');
    })
    .catch((err) => {
      console.error(err);
    });
}

function makeMap(mapEl) {
  if (mapEl) {
    /* eslint-disable no-undef */
    const map = new google.maps.Map(mapEl, mapOptions);
    /* eslint-enable no-undef */
    loadPlaces(map);
    const input = $('.autocomplete__input');
    /* eslint-disable no-undef */
    const autocomplete = new google.maps.places.Autocomplete(input);
    /* eslint-enable no-undef */
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
    });
  }
}

export default makeMap;
