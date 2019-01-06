function autocomplete(addressInput, latInput, lngInput) {
  if (!addressInput) return;

  /* eslint-disable no-undef */ // eslint was unaware of google since it's being included at the html level
  const dropdown = new google.maps.places.Autocomplete(addressInput);
  // {
  //   types: ['establishment'],
  // }
  /* eslint-enable no-undef */

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    // console.log(place);
    const { lat, lng } = place.geometry.location;
    /* eslint-disable no-param-reassign */ // setting value of the lat/lng inputs was bothering eslin
    latInput.value = lat();
    lngInput.value = lng();
    /* eslint-enable no-param-reassign */
  });

  addressInput.on('keydown', (keydownEvent) => {
    if (keydownEvent.keyCode === 13) {
      keydownEvent.preventDefault();
    }
  });
}
export default autocomplete;
