const axios = require('axios');

function searchResultsHtml(stores) {
  return stores.map(store => `
    <a href="/stores/${store.slug}" class="search__result">
      <strong>${store.name}</strong>
    </a>
  `).join('');
}

function typeAhead(search) {
  if (search) {
    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');

    searchInput.on('input', function(event) {
      // if there is no value, hide results
      if (this.value) {
        searchResults.style.display = 'none';
      }
      searchResults.innerHTML = '';
      searchResults.style.display = 'block';
      axios
        .get(`/api/search?q=${this.value}`)
        .then((res) => {
          if (res.data.length) {
            searchResults.innerHTML = searchResultsHtml(res.data);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }
}

export default typeAhead;
