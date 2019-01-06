import axios from 'axios';
import dompurify from 'dompurify';

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

    searchInput.on('input', function() {
      // if there is no value, hide results
      if (!this.value) {
        searchResults.style.display = 'none';
        return;
      }
      searchResults.innerHTML = '';
      searchResults.style.display = 'block';
      axios
        .get(`/api/search?q=${this.value}`)
        .then((res) => {
          if (res.data.length) {
            searchResults.innerHTML = dompurify.sanitize(searchResultsHtml(res.data));
            return;
          }
          if (this.value) {
            searchResults.innerHTML = dompurify.sanitize(`
              <div class="search__result">No results found for <strong>${this.value}</strong></div>
            `);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    });

    searchInput.on('keyup', (keyupEvent) => {
      if ([38, 40, 13].includes(keyupEvent.keyCode)) {
        const activeClass = 'search__result--active';
        const current = searchResults.querySelector(`.${activeClass}`);
        const items = searchResults.querySelectorAll('.search__result');
        let next;
        if (keyupEvent.keyCode === 40 && current) { // down
          next = current.nextElementSibling || items[0];
        } else if (keyupEvent.keyCode === 40) {
          [next] = items;
        } else if (keyupEvent.keyCode === 38 && current) { // up
          next = current.previousElementSibling || items[items.length - 1];
        } else if (keyupEvent.keyCode === 38) {
          next = items[items.length - 1];
        } else if (keyupEvent.keyCode === 13 && current.href) { // enter
          window.location = current.href;
        }
        if (current) {
          current.classList.remove(activeClass);
        }
        next.classList.add(activeClass);
      }
    });
  }
}

export default typeAhead;
